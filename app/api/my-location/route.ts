import { NextRequest, NextResponse } from "next/server";

interface IpCacheEntry {
  data: Record<string, unknown>;
  timestamp: number;
}

const ipCache = new Map<string, IpCacheEntry>();
const CACHE_TTL = 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "";
  const cacheKey = ip || "__default__";

  const cached = ipCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  const apiKey = process.env.IPLOCATE_API_KEY;
  const baseUrl = "https://www.iplocate.io/api/lookup";
  const url = ip
    ? `${baseUrl}/${ip}${apiKey ? `?api_key=${apiKey}` : ""}`
    : `${baseUrl}${apiKey ? `?api_key=${apiKey}` : ""}`;

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: `IPLocate error: ${response.status}`, detail: text },
        { status: response.status }
      );
    }
    const data = await response.json();
    ipCache.set(cacheKey, { data, timestamp: Date.now() });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch location data" },
      { status: 500 }
    );
  }
}
