import { Redis } from "@upstash/redis";
import type { GeocodeResult } from "./types";

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_URL;
  const token = process.env.UPSTASH_REDIS_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function cacheKey(input: string): string {
  const normalized = input.trim().toLowerCase().replace(/\s+/g, " ");
  return `geocode:${normalized}`;
}

export async function getCachedResult(
  input: string
): Promise<GeocodeResult | null> {
  try {
    const redis = getRedis();
    if (!redis) return null;
    const data = await redis.get<GeocodeResult>(cacheKey(input));
    return data;
  } catch {
    return null;
  }
}

export async function setCachedResult(
  input: string,
  result: GeocodeResult
): Promise<void> {
  try {
    const redis = getRedis();
    if (!redis) return;
    const key = cacheKey(input);
    await redis.set(key, result, { ex: 2592000 });
  } catch {
    // cache write failures are non-fatal
  }
}
