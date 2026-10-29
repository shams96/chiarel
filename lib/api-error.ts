import { NextResponse } from "next/server";
import { dbGeneration, recoverFromEnginePanic } from "@/lib/db-client";
import { isEnginePanic, retryDb } from "@/lib/db-resilience";

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
 */
export function withApiErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<NextResponse>
): (...args: Args) => Promise<NextResponse> {
  return async (...args: Args) => {
    const first = args[0] as { method?: string } | undefined;
    const readOnly = !first?.method || first.method === "GET";
    try {
      return await retryDb(
        () => {
          const generation = dbGeneration();
          return handler(...args).catch((err) => {
            if (isEnginePanic(err)) recoverFromEnginePanic(generation);
            throw err;
          });
        },
        { readOnly, retries: readOnly ? 1 : 0 }
      );
    } catch (err) {
      console.error("[api error]", err);
      return NextResponse.json(
        { error: "Something went wrong on our end. Please try again in a moment." },
        { status: 503 }
      );
    }
  };
}
