export interface IpLocateResponse {
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

interface CacheEntry {
  data: IpLocateResponse;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 60 * 60 * 1000;

export function clearIpCache() {
  cache.clear();
}

export async function lookupIp(ip: string): Promise<IpLocateResponse | null> {
  const cacheKey = ip || "__default__";

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const apiKey = process.env.IPLOCATE_API_KEY;
  const baseUrl = "https://www.iplocate.io/api/lookup";
  const url = ip
    ? `${baseUrl}/${ip}${apiKey ? `?api_key=${apiKey}` : ""}`
    : `${baseUrl}${apiKey ? `?api_key=${apiKey}` : ""}`;

  const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) return null;

  const data = (await response.json()) as IpLocateResponse;
  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}
