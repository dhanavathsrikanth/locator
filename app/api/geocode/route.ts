import { NextRequest, NextResponse } from "next/server";
import { detectAndConvert } from "@/lib/coordinates";
import { validateApiKey } from "@/lib/geocode/auth";
import { checkQuota, logUsage } from "@/lib/geocode/quota";
import { geocodeWithFallback } from "@/lib/geocode/providers";
import { getCachedResult, setCachedResult } from "@/lib/geocode/cache";
import { assessIpRisk } from "@/lib/ip-risk";
import { getAnonymousLimit } from "@/lib/usage-quota";
import type { GeocodeResult } from "@/lib/geocode/types";

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "127.0.0.1";
}

function detectFormat(input: string): GeocodeResult["matched_format"] {
  const result = detectAndConvert(input);
  if (result) return result.detectedFormat;
  return "address";
}

export async function POST(request: NextRequest) {
  try {
    const { input } = (await request.json()) as { input: string };
    if (!input || typeof input !== "string" || !input.trim()) {
      return NextResponse.json({ error: "Missing or invalid 'input'" }, { status: 400 });
    }

    const ip = getClientIp(request);
    const authHeader = request.headers.get("authorization");

    if (authHeader && !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Invalid authorization format" }, { status: 401 });
    }

    const auth = authHeader ? await validateApiKey(authHeader) : null;

    if (authHeader && !auth) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    let userId: string | null = null;
    let apiKeyId: string | null = null;
    let plan = "free";

    if (auth) {
      userId = auth.userId;
      apiKeyId = auth.apiKeyId;
      plan = auth.plan;
    }

    if (auth) {
      const quota = await checkQuota(userId!, plan, 1);
      if (!quota.allowed) {
        return NextResponse.json(
          {
            error: "Monthly quota exceeded",
            remaining: quota.remaining,
            limit: quota.limit,
            plan,
          },
          { status: 429 }
        );
      }
    } else {
      const risk = await assessIpRisk(ip);
      const anonLimit = getAnonymousLimit(risk.riskLevel);
      const cookieStr = request.cookies.get("locator_quota")?.value;
      const { getRemainingFromCookie, deductQuota } = await import("@/lib/usage-quota");
      const cookieInfo = getRemainingFromCookie(cookieStr, ip);
      const remaining = cookieInfo !== null ? cookieInfo.remaining : anonLimit;
      if (remaining < 1) {
        return NextResponse.json(
          {
            error: "Anonymous quota exceeded. Sign in with an API key for a higher limit.",
            remaining: 0,
            limit: anonLimit,
          },
          { status: 429 }
        );
      }
    }

    const trimmed = input.trim();
    const matchedFormat = detectFormat(trimmed);

    const cached = await getCachedResult(trimmed);
    if (cached) {
      const result: GeocodeResult = { ...cached, cached: true };
      return NextResponse.json(result);
    }

    const providerResult = await geocodeWithFallback(trimmed);
    if (!providerResult) {
      return NextResponse.json(
        { input: trimmed, error: "Could not geocode input" },
        { status: 422 }
      );
    }

    const result: GeocodeResult = {
      input: trimmed,
      matched_format: matchedFormat,
      lat: providerResult.result.lat,
      lng: providerResult.result.lng,
      formatted_address: providerResult.result.formatted_address,
      confidence: providerResult.result.confidence,
      provider: providerResult.provider,
      cached: false,
    };

    try { await setCachedResult(trimmed, result); } catch {}

    if (auth && userId) {
      try { await logUsage(userId, apiKeyId, "/api/geocode", 1); } catch {}
    } else {
      const { deductQuota, getRemainingFromCookie } = await import("@/lib/usage-quota");
      const cookieStr = request.cookies.get("locator_quota")?.value;
      const cookieInfo = getRemainingFromCookie(cookieStr, ip);
      const anonLimit = getAnonymousLimit((await assessIpRisk(ip)).riskLevel);
      const remaining = cookieInfo !== null ? cookieInfo.remaining : anonLimit;
      const newCookie = deductQuota(remaining, (await assessIpRisk(ip)).riskLevel, ip, 1);
      const response = NextResponse.json(result);
      response.cookies.set("locator_quota", newCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 86400,
        path: "/",
      });
      return response;
    }

    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
