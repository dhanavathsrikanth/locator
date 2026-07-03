"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Loader2, Fuel, Navigation, MapPin, Radius, SlidersHorizontal } from "lucide-react";

interface PetrolPump {
  id: number;
  name: string;
  brand: string;
  address: string;
  lat: number;
  lon: number;
  distance: number;
}

interface NearbyResponse {
  pumps: PetrolPump[];
  userLocation: { lat: number; lon: number };
}

const BRAND_COLORS: Record<string, string> = {
  "Indian Oil": "#E53935",
  BPCL: "#43A047",
  HPCL: "#1E88E5",
  Shell: "#FDD835",
  Reliance: "#FB8C00",
  Nayara: "#8E24AA",
  NRL: "#00ACC1",
  ONGC: "#6D4C41",
};

const ALL_BRANDS = Object.keys(BRAND_COLORS);
const DEFAULT_COLOR = "#757575";

const RADII = [
  { label: "1 km", value: 1000 },
  { label: "2 km", value: 2000 },
  { label: "5 km", value: 5000 },
  { label: "10 km", value: 10000 },
  { label: "25 km", value: 25000 },
  { label: "50 km", value: 50000 },
];

export default function NearestPumpsClient() {
  const [location, setLocation] = useState<{
    lat: number;
    lon: number;
    accuracy?: number;
  } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pumps, setPumps] = useState<PetrolPump[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [radius, setRadius] = useState(5000);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedPump, setSelectedPump] = useState<PetrolPump | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation not supported in this browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      (err) => {
        const msgs: Record<number, string> = {
          [err.PERMISSION_DENIED]:
            "Enable location access for finding nearby petrol pumps.",
          [err.POSITION_UNAVAILABLE]: "GPS position unavailable.",
          [err.TIMEOUT]: "GPS request timed out.",
        };
        setGpsError(msgs[err.code] || "Could not get GPS position.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    if (!location) return;
    setLoading(true);
    setError(null);
    fetch("/api/nearby-pumps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lat: location.lat,
        lon: location.lon,
        radius,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch nearby pumps");
        return res.json() as Promise<NearbyResponse>;
      })
      .then((data) => {
        setPumps(data.pumps);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message || "Could not find nearby pumps");
        setLoading(false);
      });
  }, [location, radius]);

  const filteredPumps = useMemo(() => {
    if (!selectedBrand) return pumps;
    return pumps.filter((p) => p.brand === selectedBrand);
  }, [pumps, selectedBrand]);

  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of pumps) {
      counts[p.brand] = (counts[p.brand] || 0) + 1;
    }
    return counts;
  }, [pumps]);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution:
              "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>",
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      },
      center: [78, 20],
      zoom: 4,
    });
    map.addControl(new maplibregl.NavigationControl(), "top-right");
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !location) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (!userMarkerRef.current) {
      const el = document.createElement("div");
      el.style.width = "18px";
      el.style.height = "18px";
      el.style.background = "hsl(180 100% 40%)";
      el.style.borderRadius = "50%";
      el.style.border = "3px solid white";
      el.style.boxShadow = "0 0 4px rgba(0,0,0,0.3)";
      userMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([location.lon, location.lat])
        .addTo(map);
    } else {
      userMarkerRef.current.setLngLat([location.lon, location.lat]);
    }

    filteredPumps.forEach((pump) => {
      const color = BRAND_COLORS[pump.brand] || DEFAULT_COLOR;
      const el = document.createElement("div");
      el.style.width = "24px";
      el.style.height = "24px";
      el.style.background = color;
      el.style.borderRadius = "50%";
      el.style.border = "3px solid white";
      el.style.cursor = "pointer";
      el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.25)";
      el.style.transition = "transform 0.15s";
      el.title = `${pump.name} (${pump.distance} km)`;

      el.addEventListener("mouseenter", () => { el.style.transform = "scale(1.2)"; });
      el.addEventListener("mouseleave", () => { el.style.transform = "scale(1)"; });

      const popup = new maplibregl.Popup({ offset: 25, closeButton: false }).setHTML(`
        <div style="font-size:13px;line-height:1.5;min-width:160px">
          <strong style="font-size:14px">${pump.name}</strong><br/>
          <span style="color:${color};font-size:16px">●</span>
          <span style="font-weight:500">${pump.brand}</span><br/>
          <span style="color:#888;font-size:12px">${pump.distance} km away</span>
          ${pump.address ? `<br/><span style="color:#888;font-size:11px">${pump.address}</span>` : ""}
        </div>
      `);

      el.addEventListener("click", () => setSelectedPump(pump));

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([pump.lon, pump.lat])
        .setPopup(popup)
        .addTo(map);
      markersRef.current.push(marker);
    });

    if (filteredPumps.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      bounds.extend([location.lon, location.lat]);
      filteredPumps.forEach((p) => bounds.extend([p.lon, p.lat]));
      map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 500 });
    } else {
      map.flyTo({
        center: [location.lon, location.lat],
        zoom: 12,
        duration: 500,
      });
    }
  }, [filteredPumps, location]);

  return (
    <div className="flex-1 w-full flex flex-col gap-6 max-w-5xl mx-auto p-4 sm:p-6 pt-16 lg:pt-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Nearest Petrol Pumps</h1>
        <p className="text-muted-foreground text-sm">
          Find filling stations near your current location in India
        </p>
      </div>

      {!location && !gpsError && (
        <div className="rounded-xl border bg-card p-10 text-center">
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center mx-auto mb-3">
            <Navigation className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Getting your location...
          </p>
        </div>
      )}

      {gpsError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-center text-sm text-destructive flex items-center justify-center gap-2">
          <MapPin className="w-4 h-4 shrink-0" />
          {gpsError}
        </div>
      )}

      {location && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Radius className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mr-1">
              Radius
            </span>
            {RADII.map((r) => (
              <button
                key={r.value}
                onClick={() => setRadius(r.value)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-all duration-150 font-medium ${
                  radius === r.value
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mr-1">
              Brand
            </span>
            <button
              onClick={() => setSelectedBrand(null)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-all duration-150 font-medium ${
                !selectedBrand
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              All{pumps.length > 0 ? ` (${pumps.length})` : ""}
            </button>
            {ALL_BRANDS.filter((b) => brandCounts[b]).map((brand) => {
              const color = BRAND_COLORS[brand] || DEFAULT_COLOR;
              return (
                <button
                  key={brand}
                  onClick={() =>
                    setSelectedBrand(selectedBrand === brand ? null : brand)
                  }
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all duration-150 font-medium flex items-center gap-1.5 ${
                    selectedBrand === brand
                      ? "text-white border-transparent shadow-sm"
                      : "bg-card text-muted-foreground border-border hover:border-primary/50"
                  }`}
                  style={
                    selectedBrand === brand
                      ? { backgroundColor: color }
                      : undefined
                  }
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  {brand} ({brandCounts[brand]})
                </button>
              );
            })}
          </div>

          {loading && (
            <div className="rounded-xl border bg-card p-8 text-center">
              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center mx-auto mb-3">
                <Fuel className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching for nearby petrol pumps...
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive flex items-start gap-3">
              <MapPin className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div
            ref={mapContainer}
            className="w-full h-72 sm:h-96 rounded-xl border overflow-hidden"
          />

          {!loading && !error && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Results ({filteredPumps.length})
                </h2>
                {location.accuracy && (
                  <span className="text-xs text-muted-foreground">
                    GPS accuracy: ~{Math.round(location.accuracy)}m
                  </span>
                )}
              </div>
              {filteredPumps.length === 0 ? (
                <div className="rounded-xl border bg-card p-10 text-center">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                    <Fuel className="w-5 h-5 text-muted-foreground/50" />
                  </div>
                  <p className="text-muted-foreground">No petrol pumps found in this area.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try increasing the search radius.
                  </p>
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredPumps.map((pump) => {
                    const color = BRAND_COLORS[pump.brand] || DEFAULT_COLOR;
                    return (
                      <button
                        key={pump.id}
                        onClick={() => {
                          setSelectedPump(pump);
                          mapRef.current?.flyTo({
                            center: [pump.lon, pump.lat],
                            zoom: 15,
                            duration: 500,
                          });
                        }}
                        className={`w-full text-left rounded-xl border bg-card p-3.5 hover:border-primary/40 hover:shadow-sm transition-all duration-150 ${
                          selectedPump?.id === pump.id ? "ring-2 ring-primary border-primary" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className="w-3.5 h-3.5 rounded-full shrink-0 ring-1 ring-black/10"
                              style={{ backgroundColor: color }}
                            />
                            <span className="font-medium text-sm truncate">
                              {pump.name}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0 font-mono tabular-nums">
                            {pump.distance} km
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 ml-6">
                          <span className="text-xs text-muted-foreground/70">{pump.brand}</span>
                          {pump.address && (
                            <>
                              <span className="text-xs text-muted-foreground/30">·</span>
                              <span className="text-xs text-muted-foreground/70 truncate">{pump.address}</span>
                            </>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
