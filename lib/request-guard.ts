import { NextRequest, NextResponse } from "next/server";
import { siteOrigin } from "@/lib/oauth-google";

/**
 * Cheap CSRF defence for the cookie-setting account POSTs. A cross-site HTML form
 * cannot send application/json, and a cross-site fetch that does would be
 * preflighted; as a second layer, an Origin header that is present must be this
 * site (the configured origin, or the origin this very request was addressed to).
 * Returns a neutral 403 to send back, or null when the request may proceed.
 */
export function rejectCrossSite(req: NextRequest): NextResponse | null {
  const deny = () => NextResponse.json({ ok: false, code: "forbidden" }, { status: 403 });
  if (!(req.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) return deny();
  const origin = req.headers.get("origin");
  if (origin && origin !== siteOrigin() && origin !== req.nextUrl.origin) return deny();
  return null;
}
