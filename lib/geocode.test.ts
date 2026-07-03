import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/geocode/auth", () => ({
  validateApiKey: vi.fn(),
}));

vi.mock("@/lib/geocode/providers", () => ({
  geocodeWithFallback: vi.fn(),
}));

vi.mock("@/lib/geocode/cache", () => ({
  getCachedResult: vi.fn(),
  setCachedResult: vi.fn(),
}));

vi.mock("@/lib/geocode/quota", () => ({
  checkQuota: vi.fn(),
  logUsage: vi.fn(),
}));

vi.mock("@/lib/ip-risk", () => ({
  assessIpRisk: vi.fn(),
}));

vi.mock("@/lib/usage-quota", () => ({
  getAnonymousLimit: vi.fn(),
  getRemainingFromCookie: vi.fn(),
  deductQuota: vi.fn(),
}));

import { POST as geocodeSingle } from "@/app/api/geocode/route";
import { POST as geocodeBatch } from "@/app/api/geocode/batch/route";
import { validateApiKey } from "@/lib/geocode/auth";
import { geocodeWithFallback } from "@/lib/geocode/providers";
import { getCachedResult, setCachedResult } from "@/lib/geocode/cache";
import { checkQuota, logUsage } from "@/lib/geocode/quota";
import { assessIpRisk } from "@/lib/ip-risk";
import {
  getAnonymousLimit,
  getRemainingFromCookie,
  deductQuota,
} from "@/lib/usage-quota";

function singleReq(overrides: {
  input?: string;
  authHeader?: string;
  cookie?: string;
  forwardIp?: string;
} = {}): NextRequest {
  const {
    input = "New Delhi",
    authHeader,
    cookie,
    forwardIp = "1.2.3.4",
  } = overrides;
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-forwarded-for": forwardIp,
  };
  if (authHeader) headers.authorization = authHeader;
  if (cookie) headers.cookie = `locator_quota=${cookie}`;
  return new NextRequest("http://localhost/api/geocode", {
    method: "POST",
    headers,
    body: JSON.stringify({ input }),
  }) as NextRequest;
}

function batchReq(overrides: {
  inputs?: string[];
  authHeader?: string;
  cookie?: string;
  forwardIp?: string;
} = {}): NextRequest {
  const {
    inputs = ["New Delhi", "Mumbai"],
    authHeader,
    cookie,
    forwardIp = "1.2.3.4",
  } = overrides;
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-forwarded-for": forwardIp,
  };
  if (authHeader) headers.authorization = authHeader;
  if (cookie) headers.cookie = `locator_quota=${cookie}`;
  return new NextRequest("http://localhost/api/geocode/batch", {
    method: "POST",
    headers,
    body: JSON.stringify({ inputs }),
  }) as NextRequest;
}

const MOCK_RESULT = {
  result: {
    lat: 28.6139,
    lng: 77.209,
    formatted_address: "New Delhi, Delhi, India",
    confidence: 0.85,
  },
  provider: "nominatim" as const,
};

const VALID_AUTH = { userId: "user-1", apiKeyId: "key-1", plan: "free" };

describe("/api/geocode — single", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCachedResult).mockResolvedValue(null);
    vi.mocked(geocodeWithFallback).mockResolvedValue(MOCK_RESULT);
    vi.mocked(assessIpRisk).mockResolvedValue({
      riskLevel: "low",
      isVpn: false,
      isProxy: false,
      isTor: false,
      isHosting: false,
    });
    vi.mocked(getAnonymousLimit).mockReturnValue(500);
    vi.mocked(getRemainingFromCookie).mockReturnValue(null);
    vi.mocked(deductQuota).mockReturnValue("signed.payload.abc123");
  });

  it("returns 400 when input is missing", async () => {
    const req = new NextRequest("http://localhost/api/geocode", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    }) as NextRequest;
    const res = await geocodeSingle(req);
    expect(res.status).toBe(400);
  });

  it("returns 401 for invalid API key (Bearer token present but unverifiable)", async () => {
    vi.mocked(validateApiKey).mockResolvedValue(null);
    const req = singleReq({ authHeader: "Bearer invalid-key-xxxx" });
    const res = await geocodeSingle(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Invalid API key");
  });

  it("returns 429 when authenticated quota is exhausted", async () => {
    vi.mocked(validateApiKey).mockResolvedValue(VALID_AUTH);
    vi.mocked(checkQuota).mockResolvedValue({
      allowed: false,
      remaining: 0,
      limit: 2000,
    });
    const req = singleReq({ authHeader: "Bearer valid-key" });
    const res = await geocodeSingle(req);
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toContain("quota");
    expect(body.remaining).toBe(0);
  });

  it("returns cached result without calling upstream provider", async () => {
    vi.mocked(validateApiKey).mockResolvedValue(null);
    vi.mocked(getCachedResult).mockResolvedValue({
      input: "new delhi",
      matched_format: "address",
      lat: 28.6139,
      lng: 77.209,
      formatted_address: "New Delhi, Delhi, India",
      confidence: 0.9,
      provider: "nominatim",
      cached: true,
    });

    const req = singleReq();
    const res = await geocodeSingle(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.cached).toBe(true);
    expect(body.lat).toBe(28.6139);
    expect(geocodeWithFallback).not.toHaveBeenCalled();
  });

  it("returns 200 for authenticated request with valid API key", async () => {
    vi.mocked(validateApiKey).mockResolvedValue({
      userId: "user-1",
      apiKeyId: "key-1",
      plan: "pro",
    });
    vi.mocked(checkQuota).mockResolvedValue({
      allowed: true,
      remaining: 250000,
      limit: 250000,
    });

    const req = singleReq({ authHeader: "Bearer valid-pro-key" });
    const res = await geocodeSingle(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.lat).toBe(28.6139);
    expect(body.lng).toBe(77.209);
    expect(body.provider).toBe("nominatim");
    expect(body.cached).toBe(false);
    expect(body.matched_format).toBe("address");
    expect(body.input).toBe("New Delhi");
    expect(body.formatted_address).toBe("New Delhi, Delhi, India");
    expect(body.confidence).toBe(0.85);
    expect(logUsage).toHaveBeenCalledWith("user-1", "key-1", "/api/geocode", 1);
  });

  it("anonymous high-risk IP respects reduced 50-row quota and sets cookie", async () => {
    vi.mocked(validateApiKey).mockResolvedValue(null);
    vi.mocked(assessIpRisk).mockResolvedValue({
      riskLevel: "high",
      isVpn: false,
      isProxy: false,
      isTor: true,
      isHosting: false,
    });
    vi.mocked(getAnonymousLimit).mockReturnValue(50);

    const req = singleReq({ forwardIp: "10.0.0.1" });
    const res = await geocodeSingle(req);
    expect(res.status).toBe(200);
    expect(deductQuota).toHaveBeenCalled();
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("locator_quota");
  });

  it("returns 429 when anonymous quota is exhausted", async () => {
    vi.mocked(validateApiKey).mockResolvedValue(null);
    vi.mocked(assessIpRisk).mockResolvedValue({
      riskLevel: "low",
      isVpn: false,
      isProxy: false,
      isTor: false,
      isHosting: false,
    });
    vi.mocked(getAnonymousLimit).mockReturnValue(500);
    vi.mocked(getRemainingFromCookie).mockReturnValue({ remaining: 0, riskLevel: "low" });

    const req = singleReq({ cookie: "some-used-up-cookie" });
    const res = await geocodeSingle(req);
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toContain("quota");
  });
});

describe("/api/geocode/batch — batch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCachedResult).mockResolvedValue(null);
    vi.mocked(geocodeWithFallback).mockResolvedValue(MOCK_RESULT);
    vi.mocked(assessIpRisk).mockResolvedValue({
      riskLevel: "low",
      isVpn: false,
      isProxy: false,
      isTor: false,
      isHosting: false,
    });
    vi.mocked(getAnonymousLimit).mockReturnValue(500);
    vi.mocked(getRemainingFromCookie).mockReturnValue(null);
    vi.mocked(deductQuota).mockReturnValue("signed.payload.abc123");
  });

  it("returns 400 for empty inputs array", async () => {
    const req = batchReq({ inputs: [] });
    const res = await geocodeBatch(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for more than 500 inputs", async () => {
    const req = batchReq({ inputs: Array(501).fill("test") });
    const res = await geocodeBatch(req);
    expect(res.status).toBe(400);
  });

  it("returns 401 for invalid Bearer token", async () => {
    vi.mocked(validateApiKey).mockResolvedValue(null);
    const req = batchReq({ authHeader: "Bearer bad-key" });
    const res = await geocodeBatch(req);
    expect(res.status).toBe(401);
  });

  it("returns 429 when authenticated quota is insufficient for batch size", async () => {
    vi.mocked(validateApiKey).mockResolvedValue(VALID_AUTH);
    vi.mocked(checkQuota).mockResolvedValue({
      allowed: false,
      remaining: 1,
      limit: 2000,
    });
    const req = batchReq({ authHeader: "Bearer key", inputs: ["a", "b"] });
    const res = await geocodeBatch(req);
    expect(res.status).toBe(429);
  });

  it("processes batch successfully for authenticated user and logs usage", async () => {
    vi.mocked(validateApiKey).mockResolvedValue({
      userId: "user-1",
      apiKeyId: "key-1",
      plan: "pro",
    });
    vi.mocked(checkQuota).mockResolvedValue({
      allowed: true,
      remaining: 250000,
      limit: 250000,
    });
    vi.mocked(geocodeWithFallback).mockResolvedValue(MOCK_RESULT);

    const req = batchReq({
      authHeader: "Bearer pro-key",
      inputs: ["New Delhi", "Mumbai"],
    });
    const res = await geocodeBatch(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.results).toHaveLength(2);
    expect(body.results[0].lat).toBe(28.6139);
    expect(body.results[1].lat).toBe(28.6139);
    expect(logUsage).toHaveBeenCalledWith("user-1", "key-1", "/api/geocode/batch", 2);
  });

  it("does not call upstream provider for cached inputs", async () => {
    vi.mocked(validateApiKey).mockResolvedValue(null);
    vi.mocked(getCachedResult).mockImplementation(async (input) => {
      if (input === "New Delhi") {
        return {
          input: "new delhi",
          matched_format: "address",
          lat: 28.6139,
          lng: 77.209,
          formatted_address: "New Delhi, India",
          confidence: 0.9,
          provider: "nominatim",
          cached: true,
        };
      }
      return null;
    });

    const req = batchReq({ inputs: ["New Delhi", "Unknown Place"] });
    const res = await geocodeBatch(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.results[0].cached).toBe(true);
    expect(geocodeWithFallback).toHaveBeenCalledTimes(1);
    expect(setCachedResult).toHaveBeenCalledTimes(1);
  });
});
