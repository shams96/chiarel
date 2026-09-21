import { NextRequest } from "next/server";

/**
 * In-memory fixed-window rate limiter. Deliberately not Redis-backed: this
 * app runs as a single standalone Node process on Hostinger (see
 * next.config.mjs), so per-process memory is the actual deployment topology,
 * not a simplification made ahead of a multi-instance need that doesn't
 * exist yet.
 */
const hits = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now >= entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count += 1;
  return entry.count > max;
}

/** Best-effort client IP for rate-limit keying — trusts the first hop's proxy header, which is fine for throttling (not for auth/authorization decisions). */
export function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
