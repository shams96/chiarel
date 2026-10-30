import { NextResponse } from "next/server";
import { dbGeneration, replaceDbClientOnPanic, withDbBreaker } from "@/lib/db-client";
import { DbUnavailableError, isEnginePanic, retryDb } from "@/lib/db-resilience";

const MESSAGE = "Something went wrong on our end. Please try again in a moment.";

/**
 * A short, safe label for what failed: a Prisma/Node error code or class name, or
 * a fixed label for a known misconfiguration. Never the message, which can carry
 * connection details. Hostinger exposes no runtime log, so without this a 503
 * cannot be told apart from another. Only returned on /api/admin routes.
 */
export function safeErrorCode(err: unknown): string {
  const e = err as { code?: unknown; name?: unknown; message?: unknown } | null;
  if (typeof e?.message === "string" && e.message.includes("ADMIN_SESSION_SECRET")) {
    return "config_missing_admin_session_secret";
  }
  if (typeof e?.code === "string" && /^[A-Za-z0-9_]{1,40}$/.test(e.code)) return e.code;
  if (typeof e?.name === "string" && /^[A-Za-z0-9_]{1,60}$/.test(e.name)) return e.name;
  return "unknown";
}

function isAdminRequest(first: unknown): boolean {
  const url = (first as { url?: unknown } | undefined)?.url;
  if (typeof url !== "string") return false;
  try {
    return new URL(url).pathname.startsWith("/api/admin/");
  } catch {
    return false;
  }
}

/**
 * Wraps a route handler so a thrown error (most commonly the database being
 * unreachable, e.g. a Supabase pooler outage) returns a JSON body the client
 * can show the customer, instead of Next's bare empty-body 500 that leaves
 * the cart drawer or checkout button silently doing nothing.
 *
 * Read handlers (GET) retry once on a transient database error (see
 * lib/db-resilience.ts). Anything that writes is never retried here: a retry
 * re-runs the whole handler, so it would find the request body already
 * consumed and could repeat earlier writes (a second order, a bumped quantity).
 *
 * The handler runs under the database circuit breaker (lib/db-breaker.ts): while
 * the database is unreachable, requests that need it get an immediate 503 with
 * Retry-After instead of hanging for the connect timeout and holding the host's
 * scarce processes.
 */
export function withApiErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<NextResponse>
): (...args: Args) => Promise<NextResponse> {
  return async (...args: Args) => {
    const first = args[0] as { method?: string } | undefined;
    const readOnly = !first?.method || first.method === "GET";
    try {
      return await withDbBreaker(() =>
        retryDb(
          () => {
            const generation = dbGeneration();
            // A crashed engine is replaced before the retry, so the retry gets a fresh one.
            return handler(...args).catch((err) => {
              if (isEnginePanic(err)) replaceDbClientOnPanic(err, generation);
              throw err;
            });
          },
          { readOnly, retries: readOnly ? 1 : 0 }
        )
      );
    } catch (err) {
      if (err instanceof DbUnavailableError) {
        return NextResponse.json(
          { error: MESSAGE, code: "temporarily_unavailable" },
          { status: 503, headers: { "Retry-After": String(err.retryAfterSeconds) } }
        );
      }
      console.error("[api error]", err);
      return NextResponse.json(
        isAdminRequest(first) ? { error: MESSAGE, code: safeErrorCode(err) } : { error: MESSAGE },
        { status: 503 }
      );
    }
  };
}
