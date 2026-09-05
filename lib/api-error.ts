import { NextResponse } from "next/server";

/**
 * Wraps a route handler so a thrown error (most commonly the database being
 * unreachable, e.g. a Supabase pooler outage) returns a JSON body the client
 * can show the customer, instead of Next's bare empty-body 500 that leaves
 * the cart drawer or checkout button silently doing nothing.
 */
export function withApiErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<NextResponse>
): (...args: Args) => Promise<NextResponse> {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (err) {
      console.error("[api error]", err);
      return NextResponse.json(
        { error: "Something went wrong on our end. Please try again in a moment." },
        { status: 503 }
      );
    }
  };
}
