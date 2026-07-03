export const maxDuration = 30;

import { NextRequest, NextResponse } from "next/server";

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface PetrolPump {
  id: number;
  name: string;
  brand: string;
  address: string;
  lat: number;
  lon: number;
  distance: number;
}

const BRAND_KEYWORDS: [string, string][] = [
  ["indian oil", "Indian Oil"],
  ["iocl", "Indian Oil"],
  ["indane", "Indian Oil"],
  ["bpcl", "BPCL"],
  ["bharat petroleum", "BPCL"],
  ["bharatgas", "BPCL"],
  ["hpcl", "HPCL"],
  ["hindustan petroleum", "HPCL"],
  ["shell", "Shell"],
  ["reliance", "Reliance"],
  ["jio-bp", "Reliance"],
  ["jio bp", "Reliance"],
  ["nayara", "Nayara"],
  ["essar", "Nayara"],
  ["nrl", "NRL"],
  ["numaligarh", "NRL"],
  ["ongc", "ONGC"],
];

function detectBrand(tags: Record<string, string>): string {
  const rawOriginal = tags.brand || tags.operator || tags["brand:en"] || "";
  const raw = rawOriginal.toLowerCase();
  for (const [keyword, brand] of BRAND_KEYWORDS) {
    if (raw.includes(keyword)) return brand;
  }
  const name = (tags.name || "").toLowerCase();
  for (const [keyword, brand] of BRAND_KEYWORDS) {
    if (name.includes(keyword)) return brand;
  }
  if (rawOriginal) return rawOriginal;
  return "Unbranded";
}

function buildAddress(tags: Record<string, string>): string {
  if (tags["addr:full"]) return tags["addr:full"];
  const parts: string[] = [];
  if (tags["addr:street"]) parts.push(tags["addr:street"]);
  if (tags["addr:district"]) parts.push(tags["addr:district"]);
  if (tags["addr:city"]) parts.push(tags["addr:city"]);
  if (tags["addr:state"]) parts.push(tags["addr:state"]);
  return parts.join(", ");
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const lat = Number(body.lat);
    const lon = Number(body.lon);
    const radius = Math.min(Math.max(Number(body.radius) || 5000, 1000), 50000);

    if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return NextResponse.json({ error: "Coordinates out of range" }, { status: 400 });
    }

    const overpassQuery = `[out:json][timeout:15];(
      node["amenity"="fuel"](around:${radius},${lat},${lon});
      way["amenity"="fuel"](around:${radius},${lat},${lon});
    );out center 50;`;

    const overpassEndpoints = [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter",
    ];

    let response: Response | null = null;
    let upstreamError: string | null = null;

    for (const endpoint of overpassEndpoints) {
      try {
        response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ data: overpassQuery }),
          signal: AbortSignal.timeout(15000),
        });
        if (response.ok) break;
        const text = await response.text().catch(() => "");
        upstreamError = `Overpass ${response.status} from ${endpoint}: ${text.slice(0, 200)}`;
        response = null;
      } catch {
        upstreamError = `Network error contacting ${endpoint}`;
        response = null;
      }
    }

    if (!response) {
      return NextResponse.json(
        { error: upstreamError || "Failed to fetch pump data from upstream" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const elements: OverpassElement[] = data.elements || [];

    const pumps: PetrolPump[] = elements
      .filter((el) => el.tags && el.tags.amenity === "fuel")
      .map((el) => {
        const pumpLat = el.lat ?? el.center?.lat ?? 0;
        const pumpLon = el.lon ?? el.center?.lon ?? 0;
        return {
          id: el.id,
          name:
            el.tags!.name ||
            el.tags!["name:en"] ||
            `${detectBrand(el.tags!)} Petrol Pump`,
          brand: detectBrand(el.tags!),
          address: buildAddress(el.tags!),
          lat: pumpLat,
          lon: pumpLon,
          distance: Math.round(haversine(lat, lon, pumpLat, pumpLon) * 100) / 100,
        };
      })
      .filter((p) => !isNaN(p.lat) && !isNaN(p.lon) && p.lat !== 0 && p.lon !== 0)
      .sort((a, b) => a.distance - b.distance);

    return NextResponse.json({ pumps, userLocation: { lat, lon } });
  } catch (err) {
    if (err instanceof DOMException && err.name === "TimeoutError") {
      return NextResponse.json({ error: "Request timed out" }, { status: 504 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
