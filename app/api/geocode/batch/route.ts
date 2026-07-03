import { NextRequest, NextResponse } from "next/server";
import { detectAndConvert } from "@/lib/coordinates";
import { validateApiKey } from "@/lib/geocode/auth";
import { checkQuota, logUsage } from "@/lib/geocode/quota";
import { geocodeWithFallback } from "@/lib/geocode/providers";
import { getCachedResult, setCachedResult } from "@/lib/geocode/cache";
import { assessIpRisk } from "@/lib/ip-risk";
import { getAnonymousLimit } from "@/lib/usage-quota";
import type { GeocodeResult, GeocodeError } from "@/lib/geocode/types";

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "127.0.0.1";
}

function detectFormat(input: string): GeocodeResult["matched_format"] {
  const result = detectAndConvert(input);
  if (result) return result.detectedFormat;
  return "address";
}

const MAX_BATCH = 500;

export async function POST(request: NextRequest) {
  try {
    const { inputs } = (await request.json()) as { inputs: string[] };
    if (!Array.isArray(inputs) || inputs.length === 0) {
      return NextResponse.json({ error: "Missing or empty 'inputs' array" }, { status: 400 });
    }
    if (inputs.length > MAX_BATCH) {
      return NextResponse.json(
        { error: `Max ${MAX_BATCH} inputs per request` },
        { status: 400 }
      );
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
      const quota = await checkQuota(userId!, plan, inputs.length);
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
      const { getRemainingFromCookie } = await import("@/lib/usage-quota");
      const cookieStr = request.cookies.get("locator_quota")?.value;
      const cookieInfo = getRemainingFromCookie(cookieStr, ip);
      const remaining = cookieInfo !== null ? cookieInfo.remaining : anonLimit;
      if (remaining < inputs.length) {
        return NextResponse.json(
          {
            error: "Anonymous quota exceeded. Sign in with an API key for a higher limit.",
            remaining: Math.max(0, remaining),
            limit: anonLimit,
          },
          { status: 429 }
        );
      }
    }

    const results: (GeocodeResult | GeocodeError)[] = [];

    for (const raw of inputs) {
      const trimmed = raw.trim();
      if (!trimmed) {
        results.push({ input: raw, error: "Empty input" });
        continue;
      }

      const matchedFormat = detectFormat(trimmed);

      const cached = await getCachedResult(trimmed);
      if (cached) {
        results.push({ ...cached, cached: true });
        continue;
      }

      const providerResult = await geocodeWithFallback(trimmed);
      if (!providerResult) {
        results.push({ input: trimmed, error: "Could not geocode input" });
        continue;
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
      results.push(result);
    }

    const successCount = results.filter((r) => !("error" in r && (r as GeocodeError).error)).length;

    if (auth && userId) {
      try { await logUsage(userId, apiKeyId, "/api/geocode/batch", successCount); } catch {}
    } else {
      const { deductQuota, getRemainingFromCookie } = await import("@/lib/usage-quota");
      const cookieStr = request.cookies.get("locator_quota")?.value;
      const risk = await assessIpRisk(ip);
      const anonLimit = getAnonymousLimit(risk.riskLevel);
      const cookieInfo = getRemainingFromCookie(cookieStr, ip);
      const remaining = cookieInfo !== null ? cookieInfo.remaining : anonLimit;
      const newCookie = deductQuota(remaining, risk.riskLevel, ip, successCount);
      const response = NextResponse.json({ results });
      response.cookies.set("locator_quota", newCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 86400,
        path: "/",
      });
      return response;
    }

    return NextResponse.json({ results });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
