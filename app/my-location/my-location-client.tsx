"use client";

import { useState, useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  Navigation,
  Globe,
  ChevronDown,
  ChevronUp,
  Loader2,
  Wifi,
  MapPin,
  Crosshair,
} from "lucide-react";

interface IpData {
  ip?: string;
  country?: string;
  country_code?: string;
  city?: string;
  continent?: string;
  latitude: number;
  longitude: number;
  time_zone?: string;
  postal_code?: string;
  org?: string;
  asn?: string;
  asn_name?: string;
  is_proxy?: boolean;
  is_vpn?: boolean;
  is_tor?: boolean;
  is_hosting?: boolean;
  isp?: string;
  organization?: string;
}

interface GpsData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export default function MyLocationClient() {
  const [ipData, setIpData] = useState<IpData | null>(null);
  const [gpsData, setGpsData] = useState<GpsData | null>(null);
  const [ipLoading, setIpLoading] = useState(true);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [ipError, setIpError] = useState<string | null>(null);
  const [connOpen, setConnOpen] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    fetch("/api/my-location")
      .then((res) => {
        if (!res.ok) throw new Error("IP lookup failed");
        return res.json() as Promise<IpData>;
      })
      .then((data) => {
        setIpData(data);
        setIpLoading(false);
      })
      .catch(() => {
        setIpError("Could not determine approximate location");
        setIpLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation not supported in this browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsData({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        const msgs: Record<number, string> = {
          [err.PERMISSION_DENIED]:
            "Enable location access for a more precise result.",
          [err.POSITION_UNAVAILABLE]: "GPS position unavailable.",
          [err.TIMEOUT]: "GPS request timed out.",
        };
        setGpsError(msgs[err.code] || "Could not get GPS position.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

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
    if (!map) return;
    const lat = gpsData?.latitude ?? ipData?.latitude;
    const lon = gpsData?.longitude ?? ipData?.longitude;
    if (lat == null || lon == null) return;

    const lngLat: [number, number] = [lon, lat];
    const isGps = !!gpsData;

    if (!markerRef.current) {
      const el = document.createElement("div");
      el.className = "flex items-center justify-center";
      el.style.width = "30px";
      el.style.height = "30px";
      el.style.background = isGps ? "hsl(180 100% 30%)" : "hsl(35 100% 50%)";
      el.style.borderRadius = "50% 50% 50% 0";
      el.style.transform = "rotate(-45deg)";
      el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
      el.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" style="transform:rotate(45deg);margin-top:3px"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
      markerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat(lngLat)
        .addTo(map);
    } else {
      markerRef.current.setLngLat(lngLat);
    }

    map.flyTo({ center: lngLat, zoom: isGps ? 14 : 8, duration: 600 });
  }, [ipData, gpsData]);

  const activeLat = gpsData?.latitude ?? ipData?.latitude;
  const activeLon = gpsData?.longitude ?? ipData?.longitude;
  const useGps = !!gpsData;

  return (
    <div className="flex-1 w-full flex flex-col gap-6 max-w-4xl mx-auto p-4 sm:p-6 pt-16 lg:pt-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">My Location</h1>
        <p className="text-sm text-muted-foreground">
          Detect your current location using IP geolocation and device GPS
        </p>
      </div>

      {ipLoading && (
        <div className="rounded-xl border bg-card p-10 text-center">
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center mx-auto mb-3">
            <Globe className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Determining approximate location...
          </p>
        </div>
      )}

      {ipError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive flex items-center gap-2">
          <MapPin className="w-4 h-4 shrink-0" />
          {ipError}
        </div>
      )}

      {!ipLoading && !ipError && ipData && (
        <>
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  useGps ? "bg-teal-500/10" : "bg-amber-500/10"
                }`}
              >
                {useGps ? (
                  <Navigation className="w-4.5 h-4.5 text-teal-500" />
                ) : (
                  <Globe className="w-4.5 h-4.5 text-amber-500" />
                )}
              </div>
              <div>
                <span
                  className={`text-sm font-semibold ${
                    useGps ? "text-teal-500" : "text-amber-500"
                  }`}
                >
                  {useGps ? "Precise location (from device GPS)" : "Approximate location (from IP)"}
                </span>
                {!useGps && !gpsError && (
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Requesting GPS access...
                  </p>
                )}
              </div>
            </div>

            <div>
              <p className="text-xl sm:text-2xl font-mono font-semibold tracking-tight">
                {activeLat?.toFixed(5)}, {activeLon?.toFixed(5)}
              </p>
              {!useGps && (
                <p className="text-sm text-muted-foreground mt-1">
                  {[ipData.city, ipData.country].filter(Boolean).join(", ")}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5 text-sm bg-muted/30 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  IP-based estimate: <span className="font-medium text-foreground">accurate to ~15km</span>
                </span>
              </div>
              {useGps ? (
                <div className="flex items-center gap-2">
                  <Crosshair className="w-3.5 h-3.5 text-teal-500" />
                  <span className="text-muted-foreground">
                    Device GPS: <span className="font-medium text-teal-500">accurate to ~{Math.round(gpsData.accuracy)}m</span>
                  </span>
                </div>
              ) : gpsError ? (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground italic">{gpsError}</span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Map</h2>
              {activeLat != null && activeLon != null && (
                <span className="text-xs text-muted-foreground font-mono">
                  {activeLat.toFixed(4)}, {activeLon.toFixed(4)}
                </span>
              )}
            </div>
            <div
              ref={mapContainer}
              className="w-full h-64 sm:h-80 md:h-96 rounded-xl border overflow-hidden"
            />
          </div>

          <div className="rounded-xl border bg-card overflow-hidden">
            <button
              onClick={() => setConnOpen(!connOpen)}
              className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium hover:bg-accent/50 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Wifi className="w-4 h-4 text-muted-foreground" />
                Connection Info
              </span>
              {connOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            {connOpen && (
              <div className="border-t px-5 pb-4 pt-3 space-y-2.5 text-sm">
                <Row label="ISP" value={ipData.isp} />
                <Row
                  label="ASN"
                  value={
                    ipData.asn
                      ? `${ipData.asn}${ipData.asn_name ? ` — ${ipData.asn_name}` : ""}`
                      : undefined
                  }
                />
                <Row label="Organization" value={ipData.org} />
                <FlagRow label="VPN" value={ipData.is_vpn} />
                <FlagRow label="Proxy" value={ipData.is_proxy} />
                <FlagRow label="Tor" value={ipData.is_tor} />
                <FlagRow label="Hosting" value={ipData.is_hosting} warn />
                <Row label="IP Address" value={ipData.ip} mono />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className={mono ? "font-mono text-xs" : "text-xs"}>
        {value || "—"}
      </span>
    </div>
  );
}

function FlagRow({
  label,
  value,
  warn,
}: {
  label: string;
  value?: boolean | null;
  warn?: boolean;
}) {
  const color = value
    ? warn
      ? "text-amber-500"
      : "text-destructive"
    : "text-green-600";
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className={`text-xs font-medium ${color}`}>
        {value ? "Yes" : "No"}
      </span>
    </div>
  );
}
