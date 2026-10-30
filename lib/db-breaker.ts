// A circuit breaker for the database path.
//
// When the database cannot be reached from this host, every request used to
// hang for the connect timeout (10 s, twice for reads) before failing. On a
// shared host with a hard process/thread cap those stuck requests hold the
// very resources that are scarce, so an outage fed itself. The breaker stops
// that: after a few connectivity failures in a row it opens, and database
// requests fail at once (503 + Retry-After) without touching the network. After
// a cooldown it lets exactly one probe request through; if that succeeds the
// breaker closes, if not it re-opens for another cooldown.
//
// Pure and clock-injected so the state machine is unit-tested without timers.

export type BreakerState = "closed" | "open" | "half-open";

export type BreakerOptions = {
  /** Connectivity failures inside `windowMs` that open the breaker. */
  threshold?: number;
  windowMs?: number;
  /** How long the breaker stays open before allowing one probe. */
  cooldownMs?: number;
  now?: () => number;
};

export function createBreaker(options: BreakerOptions = {}) {
  const threshold = options.threshold ?? 3;
  const windowMs = options.windowMs ?? 30_000;
  const cooldownMs = options.cooldownMs ?? 15_000;
  const now = options.now ?? Date.now;

  let failures: number[] = [];
  let openedAt: number | null = null;
  let probing = false;

  function state(): BreakerState {
    if (openedAt === null) return "closed";
    return now() - openedAt >= cooldownMs ? "half-open" : "open";
  }

  return {
    state,

    /** May this request use the database? In half-open, one probe at a time. */
    tryAcquire(): boolean {
      const s = state();
      if (s === "closed") return true;
      if (s === "open" || probing) return false;
      probing = true;
      return true;
    },

    /** The database answered (a query ran, even if the app then rejected it). */
    success(): void {
      failures = [];
      openedAt = null;
      probing = false;
    },

    /** A connectivity failure: timeout, unreachable, pool exhausted, engine crash. */
    failure(): void {
      const t = now();
      probing = false;
      if (openedAt !== null) {
        openedAt = t; // the probe failed: a full cooldown again
        return;
      }
      failures = failures.filter((f) => t - f < windowMs);
      failures.push(t);
      if (failures.length >= threshold) {
        openedAt = t;
        failures = [];
      }
    },

    retryAfterSeconds(): number {
      if (openedAt === null) return 0;
      return Math.max(1, Math.ceil((cooldownMs - (now() - openedAt)) / 1000));
    },
  };
}

export type Breaker = ReturnType<typeof createBreaker>;
