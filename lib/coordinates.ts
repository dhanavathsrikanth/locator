import { forward as mgrsForward, toPoint as mgrsToPoint } from "mgrs";
import UtmLatLng from "utm-latlng";
import * as ngeohash from "ngeohash";
import { OpenLocationCode } from "open-location-code";

const utm = new UtmLatLng();
const olc = new OpenLocationCode();

export type CoordFormat =
  | "dd"
  | "dms"
  | "ddm"
  | "utm"
  | "mgrs"
  | "geohash"
  | "pluscode";

export interface CoordResults {
  dd: string;
  dms: string;
  ddm: string;
  utm: string;
  mgrs: string;
  geohash: string;
  pluscode: string;
  lat: number;
  lon: number;
  detectedFormat: CoordFormat;
}

function toDeg(val: number): number {
  return val;
}

function toRad(val: number): number {
  return (val * Math.PI) / 180;
}

function normalizeLat(lat: number): number {
  return Math.max(-90, Math.min(90, lat));
}

function normalizeLon(lon: number): number {
  return ((lon + 540) % 360) - 180;
}

function roundTo(val: number, decimals: number): number {
  const f = Math.pow(10, decimals);
  return Math.round(val * f) / f;
}

export function formatDMS(lat: number, lon: number): string {
  const fmt = (val: number, isLat: boolean): string => {
    const abs = Math.abs(val);
    const d = Math.floor(abs);
    const m = Math.floor((abs - d) * 60);
    const s = roundTo((abs - d - m / 60) * 3600, 1);
    const dir = isLat ? (val >= 0 ? "N" : "S") : val >= 0 ? "E" : "W";
    return `${d}°${m.toString().padStart(2, "0")}'${s.toFixed(1).padStart(4, "0")}"${dir}`;
  };
  return `${fmt(lat, true)} ${fmt(lon, false)}`;
}

export function formatDDM(lat: number, lon: number): string {
  const fmt = (val: number, isLat: boolean): string => {
    const abs = Math.abs(val);
    const d = Math.floor(abs);
    const m = roundTo((abs - d) * 60, 4);
    const dir = isLat ? (val >= 0 ? "N" : "S") : val >= 0 ? "E" : "W";
    return `${d}°${m.toFixed(4).padStart(7, "0")}'${dir}`;
  };
  return `${fmt(lat, true)} ${fmt(lon, false)}`;
}

export function formatDD(lat: number, lon: number, decimals = 7): string {
  return `${roundTo(lat, decimals)}, ${roundTo(lon, decimals)}`;
}

export function formatUTM(lat: number, lon: number): string {
  try {
    const r = utm.convertLatLngToUtm(lat, lon, 0);
    return `${r.ZoneNumber}${r.ZoneLetter} ${Math.round(r.Easting)} ${Math.round(r.Northing)}`;
  } catch {
    return "";
  }
}

export function formatMGRS(lat: number, lon: number): string {
  try {
    return mgrsForward([lon, lat], 5);
  } catch {
    return "";
  }
}

export function formatGeohash(lat: number, lon: number, precision = 11): string {
  try {
    return ngeohash.encode(lat, lon, precision);
  } catch {
    return "";
  }
}

export function formatPlusCode(lat: number, lon: number): string {
  try {
    return olc.encode(lat, lon, 10);
  } catch {
    return "";
  }
}

export function computeAll(lat: number, lon: number, detectedFormat: CoordFormat): CoordResults {
  const nlat = normalizeLat(lat);
  const nlon = normalizeLon(lon);
  return {
    dd: formatDD(nlat, nlon),
    dms: formatDMS(nlat, nlon),
    ddm: formatDDM(nlat, nlon),
    utm: formatUTM(nlat, nlon),
    mgrs: formatMGRS(nlat, nlon),
    geohash: formatGeohash(nlat, nlon),
    pluscode: formatPlusCode(nlat, nlon),
    lat: nlat,
    lon: nlon,
    detectedFormat,
  };
}

function parseDD(input: string): { lat: number; lon: number } | null {
  const cleaned = input.replace(/[°°]/, "").trim();
  const parts = cleaned
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length < 2) return null;
  const vals = parts.map(Number);
  if (vals.some(isNaN)) return null;
  if (vals[0] >= -90 && vals[0] <= 90 && vals[1] >= -180 && vals[1] <= 180) {
    return { lat: vals[0], lon: vals[1] };
  }
  if (vals[1] >= -90 && vals[1] <= 90 && vals[0] >= -180 && vals[0] <= 180) {
    return { lat: vals[1], lon: vals[0] };
  }
  return null;
}

function parseDMS(input: string): { lat: number; lon: number } | null {
  const cleaned = input
    .replace(/[°]/g, "d")
    .replace(/['']/g, "m")
    .replace(/["'"]/g, "s")
    .replace(/[′]/g, "m")
    .replace(/[″]/g, "s");
  const dmsRe =
    /(\d+)\s*d\s*(\d+(?:\.\d+)?)\s*m\s*(\d+(?:\.\d+)?)\s*s\s*([NSEW])/gi;
  const matches: { deg: number; min: number; sec: number; dir: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = dmsRe.exec(cleaned)) !== null) {
    matches.push({
      deg: parseInt(m[1]),
      min: parseFloat(m[2]),
      sec: parseFloat(m[3]),
      dir: m[4].toUpperCase(),
    });
  }
  if (matches.length < 2) {
    const altRe =
    /(\d+)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s*([NSEW])\s+(\d+)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s*([NSEW])/i;
    const altMatch = cleaned.trim().match(altRe);
    if (altMatch) {
      matches.push(
        { deg: parseInt(altMatch[1]), min: parseFloat(altMatch[2]), sec: parseFloat(altMatch[3]), dir: altMatch[4].toUpperCase() },
        { deg: parseInt(altMatch[5]), min: parseFloat(altMatch[6]), sec: parseFloat(altMatch[7]), dir: altMatch[8].toUpperCase() },
      );
    } else {
      return null;
    }
  }
  let lat: number | null = null;
  let lon: number | null = null;
  for (const { deg, min, sec, dir } of matches) {
    const val = deg + min / 60 + sec / 3600;
    if (dir === "N" || dir === "S") lat = (dir === "S" ? -val : val);
    else lon = (dir === "W" ? -val : val);
  }
  if (lat !== null && lon !== null) return { lat, lon };
  return null;
}

function parseDDM(input: string): { lat: number; lon: number } | null {
  const cleaned = input.replace(/[°]/g, "d").replace(/['']/g, "m");
  const re = /(\d+)\s*d\s*(\d+(?:\.\d+)?)\s*m\s*([NSEW])/gi;
  const matches: { deg: number; min: number; dir: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(cleaned)) !== null) {
    matches.push({ deg: parseInt(m[1]), min: parseFloat(m[2]), dir: m[3].toUpperCase() });
  }
  if (matches.length < 2) {
    const altRe =
    /(\d+)\s+(\d+(?:\.\d+)?)\s*([NSEW])\s+(\d+)\s+(\d+(?:\.\d+)?)\s*([NSEW])/i;
    const altMatch = cleaned.trim().match(altRe);
    if (altMatch) {
      matches.push(
        { deg: parseInt(altMatch[1]), min: parseFloat(altMatch[2]), dir: altMatch[3].toUpperCase() },
        { deg: parseInt(altMatch[4]), min: parseFloat(altMatch[5]), dir: altMatch[6].toUpperCase() },
      );
    } else {
      return null;
    }
  }
  let lat: number | null = null;
  let lon: number | null = null;
  for (const { deg, min, dir } of matches) {
    const val = deg + min / 60;
    if (dir === "N" || dir === "S") lat = (dir === "S" ? -val : val);
    else lon = (dir === "W" ? -val : val);
  }
  if (lat !== null && lon !== null) return { lat, lon };
  return null;
}

function parseUTM(input: string): { lat: number; lon: number } | null {
  const trimmed = input.trim();
  const re = /^(\d{1,2})\s*([A-Za-z])\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)$/;
  const m = trimmed.match(re);
  if (!m) return null;
  const zoneNum = parseInt(m[1]);
  if (zoneNum < 1 || zoneNum > 60) return null;
  const zoneLetter = m[2].toUpperCase();
  if (zoneLetter < "C" || zoneLetter > "X" || zoneLetter === "I" || zoneLetter === "O") return null;
  const easting = parseFloat(m[3]);
  const northing = parseFloat(m[4]);
  if (isNaN(easting) || isNaN(northing)) return null;
  try {
    const r = utm.convertUtmToLatLng(easting, northing, zoneNum, zoneLetter);
    if (isNaN(r.lat) || isNaN(r.lng)) return null;
    return { lat: r.lat, lon: r.lng };
  } catch {
    return null;
  }
}

function parseMGRS(input: string): { lat: number; lon: number } | null {
  try {
    const pt = mgrsToPoint(input.trim().toUpperCase());
    if (!pt || pt.length < 2) return null;
    return { lat: pt[1], lon: pt[0] };
  } catch {
    return null;
  }
}

const GEOHASH_CHARS = "0123456789bcdefghjkmnpqrstuvwxyz";

function parseGeohash(input: string): { lat: number; lon: number } | null {
  const trimmed = input.trim().toLowerCase();
  if (trimmed.length < 2) return null;
  for (const ch of trimmed) {
    if (!GEOHASH_CHARS.includes(ch)) return null;
  }
  try {
    const r = ngeohash.decode(trimmed);
    if (isNaN(r.latitude) || isNaN(r.longitude)) return null;
    return { lat: r.latitude, lon: r.longitude };
  } catch {
    return null;
  }
}

function parsePlusCode(input: string): { lat: number; lon: number } | null {
  try {
    if (!olc.isFull(input.trim().toUpperCase())) return null;
    const r = olc.decode(input.trim().toUpperCase());
    if (isNaN(r.latitudeCenter) || isNaN(r.longitudeCenter)) return null;
    return { lat: r.latitudeCenter, lon: r.longitudeCenter };
  } catch {
    return null;
  }
}

const parsers: [CoordFormat, (input: string) => { lat: number; lon: number } | null][] =
  [
    ["pluscode", parsePlusCode],
    ["mgrs", parseMGRS],
    ["utm", parseUTM],
    ["dms", parseDMS],
    ["ddm", parseDDM],
    ["geohash", parseGeohash],
    ["dd", parseDD],
  ];

export function detectAndConvert(
  input: string
): CoordResults | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  for (const [format, parser] of parsers) {
    const result = parser(trimmed);
    if (result) {
      try {
        return computeAll(result.lat, result.lon, format);
      } catch {
        return null;
      }
    }
  }
  return null;
}
