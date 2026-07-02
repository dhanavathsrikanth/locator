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
      el.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" style="transform:rotate(45deg);margin-top:3px"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
      markerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat(lngLat)
        .addTo(map);
    } else {
      markerRef.current.setLngLat(lngLat);
    }

    map.flyTo({ center: lngLat, zoom: isGps ? 14 : 8, duration: 500 });
  }, [ipData, gpsData]);

  const activeLat = gpsData?.latitude ?? ipData?.latitude;
  const activeLon = gpsData?.longitude ?? ipData?.longitude;
  const useGps = !!gpsData;

  return (
    <div className="flex-1 w-full flex flex-col gap-6 max-w-5xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold">My Location</h1>

      {ipLoading && (
        <div className="rounded-lg border bg-card p-6 text-center text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Determining approximate location...
        </div>
      )}

      {ipError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-center text-sm text-destructive">
          {ipError}
        </div>
      )}

      {!ipLoading && !ipError && ipData && (
        <>
          <div className="rounded-lg border bg-card p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2">
              {useGps ? (
                <>
                  <Navigation className="w-5 h-5 text-teal-500" />
                  <span className="text-sm font-semibold text-teal-500">
                    Precise location (from device GPS)
                  </span>
                </>
              ) : (
                <>
                  <Globe className="w-5 h-5 text-amber-500" />
                  <span className="text-sm font-semibold text-amber-500">
                    Approximate location (from IP)
                  </span>
                </>
              )}
            </div>

            <div>
              <p className="text-xl font-mono">
                {activeLat?.toFixed(5)}, {activeLon?.toFixed(5)}
              </p>
              {!useGps && (
                <p className="text-sm text-muted-foreground mt-1">
                  {[ipData.city, ipData.country].filter(Boolean).join(", ")}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1 text-sm">
              <p className="text-muted-foreground">
                IP-based estimate: accurate to ~15km
              </p>
              {useGps ? (
                <p className="text-muted-foreground">
                  Device GPS: accurate to ~{Math.round(gpsData.accuracy)}m
                </p>
              ) : gpsError ? (
                <p className="text-muted-foreground italic">{gpsError}</p>
              ) : (
                <p className="text-muted-foreground italic">
                  Requesting GPS access...
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Map
            </h2>
            <div
              ref={mapContainer}
              className="w-full h-64 sm:h-80 md:h-96 rounded-lg border overflow-hidden"
            />
          </div>

          <div className="rounded-lg border bg-card">
            <button
              onClick={() => setConnOpen(!connOpen)}
              className="w-full flex items-center justify-between p-4 text-sm font-medium"
            >
              <span>Connection Info</span>
              {connOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {connOpen && (
              <div className="border-t px-4 pb-4 pt-3 space-y-2 text-sm">
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
                <Row
                  label="IP Address"
                  value={ipData.ip}
                  mono
                />
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
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono text-xs" : ""}>
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
    : "text-green-500";
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={color}>{value ? "Yes" : "No"}</span>
    </div>
  );
}
