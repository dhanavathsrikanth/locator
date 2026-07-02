"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { detectAndConvert, formatDD, type CoordResults } from "@/lib/coordinates";
import { Copy, Check, ArrowLeftRight, MapPin } from "lucide-react";

const FORMAT_DEFS: { label: string; key: string }[] = [
  { label: "Decimal Degrees", key: "dd" },
  { label: "Degrees Minutes Seconds", key: "dms" },
  { label: "Degrees Decimal Minutes", key: "ddm" },
  { label: "UTM", key: "utm" },
  { label: "MGRS", key: "mgrs" },
  { label: "Geohash", key: "geohash" },
  { label: "Plus Code", key: "pluscode" },
];

export default function ConvertClient() {
  const [input, setInput] = useState("");
  const [order, setOrder] = useState<"latlon" | "lonlat">("latlon");
  const [results, setResults] = useState<CoordResults | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!input.trim()) {
        setResults(null);
        return;
      }
      setResults(detectAndConvert(input));
    }, 150);
    return () => clearTimeout(timer);
  }, [input]);

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
            attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>",
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      },
      center: [0, 20],
      zoom: 2,
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
    if (!map || !results) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
      return;
    }
    const { lat, lon } = results;
    const lngLat: [number, number] = order === "latlon" ? [lon, lat] : [lat, lon];

    if (!markerRef.current) {
      const el = document.createElement("div");
      el.className = "flex items-center justify-center";
      el.style.width = "30px";
      el.style.height = "30px";
      el.style.background = "hsl(180 100% 30%)";
      el.style.borderRadius = "50% 50% 50% 0";
      el.style.transform = "rotate(-45deg)";
      el.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" style="transform:rotate(45deg);margin-top:3px"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
      markerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat(lngLat)
        .addTo(map);
    } else {
      markerRef.current.setLngLat(lngLat);
    }

    const label = `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
    if (!popupRef.current) {
      popupRef.current = new maplibregl.Popup({ offset: 25, closeButton: false })
        .setLngLat(lngLat)
        .setHTML(`<div class="text-xs font-mono">${label}</div>`)
        .addTo(map);
    } else {
      popupRef.current.setLngLat(lngLat).setHTML(`<div class="text-xs font-mono">${label}</div>`);
    }

    map.flyTo({ center: lngLat, zoom: 10, duration: 500 });
  }, [results, order]);

  const handleCopy = useCallback(async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  }, []);

  const formatItems = useMemo(() => {
    if (!results) return [];
    return FORMAT_DEFS.map(({ label, key }) => {
      let value = (results as unknown as Record<string, string>)[key];
      if (key === "dd" && order === "lonlat") {
        value = formatDD(results.lon, results.lat);
      }
      return { label, key, value };
    });
  }, [results, order]);

  return (
    <div className="flex-1 w-full flex flex-col gap-6 max-w-5xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Convert Coordinates</h1>
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Paste any coordinate format — DD, DMS, DDM, UTM, MGRS, Geohash, Plus Code..."
            className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="text-xs font-medium uppercase tracking-wider">Order:</span>
          <button
            onClick={() => setOrder(order === "latlon" ? "lonlat" : "latlon")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {order === "latlon" ? "Lat, Lon" : "Lon, Lat"}
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>
          {results && (
            <span className="text-xs text-muted-foreground ml-auto">
              Detected: <span className="font-medium uppercase">{results.detectedFormat}</span>
            </span>
          )}
        </div>
      </div>

      {results ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {formatItems.map(({ label, key, value }) => (
            <div
              key={key}
              className={`rounded-lg border bg-card p-3 transition-colors ${
                results.detectedFormat === key ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {label}
                </span>
                <button
                  onClick={() => handleCopy(key, value)}
                  className="p-1 rounded hover:bg-accent transition-colors"
                  title="Copy to clipboard"
                >
                  {copied === key ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </button>
              </div>
              <p className="text-sm font-mono break-all select-all">{value}</p>
            </div>
          ))}
        </div>
      ) : input.trim() ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          Could not parse coordinate. Try a different format.
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-card/50 p-8 text-center text-muted-foreground">
          Enter a coordinate above to see conversions
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Map Preview
        </h2>
        <div ref={mapContainer} className="w-full h-64 sm:h-80 md:h-96 rounded-lg border overflow-hidden" />
      </div>
    </div>
  );
}
