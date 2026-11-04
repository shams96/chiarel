import { NextRequest } from "next/server";

/**
 * In-memory fixed-window rate limiter. Deliberately not Redis-backed: this
 * app runs as a single standalone Node process on Hostinger (see
 * next.config.mjs), so per-process memory is the actual deployment topology,
 * not a simplification made ahead of a multi-instance need that doesn't
 * exist yet.
 */
const hits = new Map<string, { count: number; resetAt: number }>();

const MAX_ENTRIES = 5000;
// Hard ceiling: if pruning expired windows is not enough (a flood of distinct keys),
// the oldest entries are evicted, so memory stays bounded.
const HARD_CAP = 10_000;
let lastPrune = 0;

/** Drops expired windows so the map cannot grow with every distinct IP forever. */
function prune(now: number) {
  for (const [k, v] of hits) if (now >= v.resetAt) hits.delete(k);
}

export function isRateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  // Pruning walks the whole map, so do it at most once a second.
  if (hits.size > MAX_ENTRIES && now - lastPrune > 1000) {
    prune(now);
    lastPrune = now;
  }
  if (hits.size >= HARD_CAP) {
    // Maps iterate in insertion order, so the first keys are the oldest.
    for (const k of hits.keys()) {
      if (hits.size < HARD_CAP * 0.9) break;
      hits.delete(k);
    }
  }
  const entry = hits.get(key);

  if (!entry || now >= entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count += 1;
  return entry.count > max;
}

/**
 * Client IP for rate-limit keying: the RIGHTMOST X-Forwarded-For entry, i.e. the
 * one our own proxy appended. Entries to its left are whatever the client sent
 * and can be forged freely, so they never contribute to the key. (If the proxy
 * overwrites the header there is only one entry and this is the same.) For
 * throttling only, not for auth decisions.
 */
export function clientIp(req: NextRequest): string {
  const parts = req.headers.get("x-forwarded-for")?.split(",") ?? [];
  const last = parts[parts.length - 1]?.trim();
  return last || "unknown";
}
