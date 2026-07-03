import type { ProviderResponse } from "./types";

async function nominatimSearch(
  input: string
): Promise<ProviderResponse | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input)}&format=json&limit=1&addressdetails=0`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "LocatorApp/1.0 (geocoding api)",
      "Accept-Language": "en",
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return null;
  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  const item = data[0];
  if (item.lat == null || item.lon == null) return null;
  return {
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
    formatted_address: item.display_name ?? "",
    confidence: typeof item.importance === "number" ? item.importance : 0.5,
  };
}

async function opencageSearch(
  input: string
): Promise<ProviderResponse | null> {
  const apiKey = process.env.OPENCAGE_API_KEY;
  if (!apiKey) return null;
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(input)}&key=${apiKey}&limit=1&no_annotations=1`;
  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) return null;
  const data = await response.json();
  if (!data.results || data.results.length === 0) return null;
  const item = data.results[0];
  const confidence = typeof item.confidence === "number" ? item.confidence / 10 : 0.5;
  return {
    lat: item.geometry?.lat,
    lng: item.geometry?.lng,
    formatted_address: item.formatted ?? "",
    confidence: Math.min(confidence, 1),
  };
}

export async function geocodeWithFallback(
  input: string
): Promise<{ result: ProviderResponse; provider: "nominatim" | "opencage" } | null> {
  const nom = await nominatimSearch(input);
  if (nom && nom.confidence >= 0.5) {
    return { result: nom, provider: "nominatim" };
  }

  const oc = await opencageSearch(input);
  if (oc && oc.confidence >= 0.3) {
    return { result: oc, provider: "opencage" };
  }

  if (nom && nom.confidence < 0.5 && nom.lat != null) {
    return { result: nom, provider: "nominatim" };
  }

  return null;
}
