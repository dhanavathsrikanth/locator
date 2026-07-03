import { createHmac, timingSafeEqual } from "crypto";

const QUOTA_TTL = 24 * 60 * 60 * 1000;

interface QuotaCookie {
  remaining: number;
  riskLevel: string;
  ipPrefix: string;
  expiresAt: number;
}

function getSecret(): string {
  return process.env.IPLOCATE_API_KEY || process.env.QUOTA_SECRET || "dev-secret";
}

function packCookie(data: QuotaCookie): string {
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  const sig = createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

function unpackCookie(value: string): QuotaCookie | null {
  try {
    const dot = value.lastIndexOf(".");
    if (dot === -1) return null;
    const payload = value.slice(0, dot);
    const sig = value.slice(dot + 1);
    const expectedSig = createHmac("sha256", getSecret()).update(payload).digest("hex");
    const sigBuf = Buffer.from(sig, "hex");
    const expectedBuf = Buffer.from(expectedSig, "hex");
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) return null;
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
  } catch {
    return null;
  }
}

export function getAnonymousLimit(riskLevel: string): number {
  if (riskLevel === "high") return 50;
  if (riskLevel === "medium") return 200;
  return 500;
}

export function getPlanLimit(plan: string | null | undefined): number {
  if (!plan || plan === "free") return 2000;
  if (plan === "pro") return 50000;
  if (plan === "enterprise") return Infinity;
  return 2000;
}

export function getRemainingFromCookie(
  cookieValue: string | undefined,
  ip: string
): { remaining: number; riskLevel: string } | null {
  if (!cookieValue) return null;
  const data = unpackCookie(cookieValue);
  if (!data) return null;
  const ipPrefix = ip.split(".").slice(0, 3).join(".");
  if (data.ipPrefix !== ipPrefix) return null;
  if (Date.now() > data.expiresAt) return null;
  return { remaining: data.remaining, riskLevel: data.riskLevel };
}

export function createQuotaCookie(
  remaining: number,
  riskLevel: string,
  ip: string
): string {
  const ipPrefix = ip.split(".").slice(0, 3).join(".");
  return packCookie({
    remaining: Math.max(0, remaining),
    riskLevel,
    ipPrefix,
    expiresAt: Date.now() + QUOTA_TTL,
  });
}

export function deductQuota(
  currentRemaining: number,
  riskLevel: string,
  ip: string,
  deduction: number
): string {
  return createQuotaCookie(Math.max(0, currentRemaining - deduction), riskLevel, ip);
}
