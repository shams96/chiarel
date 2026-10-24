// Tolerance for a slow or briefly unreachable database. The production database
// is a Supabase pooler in another region (about 0.4 s per round trip measured
// from a developer machine, 1.6 s for a cold connect), so Prisma's defaults
// (5 s connect timeout, pool sized from the host's CPU count) are too tight
// for a busy or cold shared host.

const DEFAULT_PARAMS: Record<string, string> = {
  connect_timeout: "10",
  pool_timeout: "10",
  connection_limit: "5",
  // A connection the host or the pooler dropped silently would otherwise leave
  // a query waiting for the operating system to give up (minutes). These make a
  // dead socket fail fast and idle connections retire before they go stale, so
  // the pool reconnects instead of hanging.
  socket_timeout: "15",
  max_idle_connection_lifetime: "20",
};

/**
 * Adds connection params to a Postgres URL only where the URL does not already
 * set them, so an operator-supplied value in the environment always wins.
 * Returns the input unchanged if it is missing or not a parseable URL.
 */
export function withConnectionDefaults(url: string | undefined): string | undefined {
  if (!url) return url;
  try {
    const u = new URL(url);
    for (const [k, v] of Object.entries(DEFAULT_PARAMS)) {
      if (!u.searchParams.has(k)) u.searchParams.set(k, v);
    }
    return u.toString();
  } catch {
    return url;
  }
}

// P1001 can't reach the server and P2024 pool timeout both fail before any SQL
// is sent, so retrying cannot duplicate a write. The others can fail after the
// server has started the statement, so only reads may retry on them.
const NEVER_EXECUTED = new Set(["P1001", "P2024"]);
const MAYBE_EXECUTED = new Set(["P1002", "P1008", "P1017"]);

export function isRetryableDbError(err: unknown, readOnly: boolean): boolean {
  const code = (err as { code?: unknown } | null)?.code;
  if (typeof code !== "string") return false;
  return NEVER_EXECUTED.has(code) || (readOnly && MAYBE_EXECUTED.has(code));
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Runs fn, retrying up to `retries` times with short backoff on retryable errors. */
export async function retryDb<T>(
  fn: () => Promise<T>,
  { readOnly, retries = 2, baseDelayMs = 300 }: { readOnly: boolean; retries?: number; baseDelayMs?: number }
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= retries || !isRetryableDbError(err, readOnly)) throw err;
      await sleep(baseDelayMs * 2 ** attempt);
    }
  }
}
