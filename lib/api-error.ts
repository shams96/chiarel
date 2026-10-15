import { NextResponse } from "next/server";
import { retryDb } from "@/lib/db-resilience";

/**
 * Wraps a route handler so a thrown error (most commonly the database being
 * unreachable, e.g. a Supabase pooler outage) returns a JSON body the client
 * can show the customer, instead of Next's bare empty-body 500 that leaves
 * the cart drawer or checkout button silently doing nothing.
 *
 * Transient database errors are retried first (see lib/db-resilience.ts): a
 * handler that reads (GET) retries on any transient code; one that writes
 * retries only on errors raised before any SQL was sent, so a retry can never
 * duplicate an order or a cart line.
 */
export function withApiErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<NextResponse>
): (...args: Args) => Promise<NextResponse> {
  return async (...args: Args) => {
    const first = args[0] as { method?: string } | undefined;
    const readOnly = !first?.method || first.method === "GET";
    try {
      return await retryDb(() => handler(...args), { readOnly });
    } catch (err) {
      console.error("[api error]", err);
      return NextResponse.json(
        { error: "Something went wrong on our end. Please try again in a moment." },
        { status: 503 }
      );
    }
  };
}
