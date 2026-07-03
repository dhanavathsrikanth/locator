import { NextRequest, NextResponse } from "next/server";
import { assessIpRisk } from "@/lib/ip-risk";
import {
  getAnonymousLimit,
  getPlanLimit,
  getRemainingFromCookie,
  deductQuota,
} from "@/lib/usage-quota";
import { createClient } from "@/lib/supabase/server";

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "127.0.0.1";
}

/**
 * Nominatim-geocode a single address.
 * In production, swap this for a paid geocoding service (Google, Mapbox, etc.)
 * to get higher throughput (no 1 req/s limit).
 */
async function geocodeAddress(
  address: string
): Promise<{ lat: number; lon: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "LocatorApp/1.0 (geocoding batch tool)",
      "Accept-Language": "en",
    },
  });
  if (!response.ok) return null;
  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { addresses, latCol, lonCol } = body as {
      addresses: string[];
      latCol: string;
      lonCol: string;
    };

    if (!Array.isArray(addresses) || addresses.length === 0) {
      return NextResponse.json({ error: "No addresses provided" }, { status: 400 });
    }

    if (addresses.length > 20) {
      return NextResponse.json({ error: "Max 20 addresses per request" }, { status: 400 });
    }

    const ip = getClientIp(request);
    const cookieStr = request.cookies.get("locator_quota")?.value;
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user ?? null;

    let limit: number;
    let remaining: number;
    let userId: string | null = null;
    let riskLevel = "low";

    if (user) {
      userId = user.id;
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();
      limit = getPlanLimit(profile?.plan ?? "free");
      const { data: usageData } = await supabase
        .from("usage_logs")
        .select("rows_processed")
        .eq("user_id", user.id)
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      const used = (usageData ?? []).reduce((sum, r) => sum + (r.rows_processed ?? 0), 0);
      remaining = Math.max(0, limit - used);
    } else {
      const risk = await assessIpRisk(ip);
      riskLevel = risk.riskLevel;
      limit = getAnonymousLimit(riskLevel);
      const cookieInfo = getRemainingFromCookie(cookieStr, ip);
      remaining = cookieInfo !== null ? cookieInfo.remaining : limit;
    }

    const isLoggedIn = userId !== null;

    if (remaining < addresses.length) {
      return NextResponse.json(
        {
          error: "Quota exceeded",
          remaining,
          limit,
          isLoggedIn,
          riskLevel,
          message: isLoggedIn
            ? `Monthly quota reached (${limit} rows). Upgrade your plan for more.`
            : `Anonymous quota reached (${limit} rows). Sign in for a higher free quota.`,
        },
        { status: 429 }
      );
    }

    const results: { address: string; lat: number | null; lon: number | null }[] = [];
    for (const address of addresses) {
      const coords = await geocodeAddress(address);
      results.push({ address, lat: coords?.lat ?? null, lon: coords?.lon ?? null });
    }

    const newRemaining = remaining - addresses.length;
    let setCookie: string | undefined;
    if (!isLoggedIn) {
      setCookie = deductQuota(remaining, riskLevel, ip, addresses.length);
    } else {
      await supabase.from("usage_logs").insert({
        user_id: userId,
        endpoint: "/api/batch/geocode",
        rows_processed: addresses.length,
      });
    }

    const response = NextResponse.json({
      results,
      remaining: newRemaining,
      limit,
      isLoggedIn,
    });

    if (setCookie) {
      response.cookies.set("locator_quota", setCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 86400,
        path: "/",
      });
    }

    return response;
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
