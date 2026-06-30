/**
 * Minimal in-memory, per-IP sliding-window rate limiter.
 *
 * This is intentionally dependency-free so the project stays zero-cost. It is
 * "good enough" for a single serverless instance to avoid blowing through the
 * Gemini free tier. For multi-region/high-traffic deployments, swap this for a
 * shared store (e.g. @upstash/ratelimit) behind the same interface.
 */

interface Window {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Window>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  key: string,
  max = Number(process.env.RATE_LIMIT_MAX ?? 20),
  windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: max - 1, resetAt };
  }

  if (existing.count >= max) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: max - existing.count,
    resetAt: existing.resetAt,
  };
}
