import { NextRequest, NextResponse } from "next/server";
import { buildAuthorization, googleConfig, OAUTH_COOKIE, OAUTH_COOKIE_PATH, OAUTH_COOKIE_TTL_S } from "@/lib/oauth-google";
import { isRateLimited, clientIp } from "@/lib/rate-limit";
import { loginRedirect, notFound } from "@/lib/social-login-http";
import { safeReturnTo } from "@/lib/return-to";

const WINDOW_MS = 10 * 60 * 1000;

// Needs no database, so it keeps working through a database outage (the callback
// is where that matters). 404 while Google sign-in is off.
export async function GET(req: NextRequest) {
  const cfg = googleConfig();
  if (!cfg) return notFound();

  // intent=customer signs a storefront customer in; anything else is the admin flow.
  const intent = req.nextUrl.searchParams.get("intent") === "customer" ? "customer" : "admin";
  const returnTo = intent === "customer" ? safeReturnTo(req.nextUrl.searchParams.get("return_to")) : undefined;

  if (isRateLimited(`google-start:${clientIp(req)}`, 20, WINDOW_MS) || isRateLimited("google-start:all", 200, WINDOW_MS)) {
    return loginRedirect("rate_limited", false, intent);
  }

  const { url, cookie } = await buildAuthorization(cfg, { intent, returnTo });
  const res = NextResponse.redirect(url, 302);
  res.cookies.set(OAUTH_COOKIE, cookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // Lax, not Strict: the cookie must come back on the top-level redirect from Google.
    sameSite: "lax",
    path: OAUTH_COOKIE_PATH,
    maxAge: OAUTH_COOKIE_TTL_S,
  });
  res.headers.set("Cache-Control", "no-store");
  return res;
}
