import { NextRequest, NextResponse } from "next/server";
import { buildAuthorization, googleConfig, OAUTH_COOKIE, OAUTH_COOKIE_PATH, OAUTH_COOKIE_TTL_S } from "@/lib/oauth-google";
import { isRateLimited, clientIp } from "@/lib/rate-limit";
import { loginRedirect, notFound } from "@/lib/social-login-http";

const WINDOW_MS = 10 * 60 * 1000;

// Needs no database, so it keeps working through a database outage (the callback
// is where that matters). 404 while Google sign-in is off.
export async function GET(req: NextRequest) {
  const cfg = googleConfig();
  if (!cfg) return notFound();

  if (isRateLimited(`google-start:${clientIp(req)}`, 20, WINDOW_MS) || isRateLimited("google-start:all", 200, WINDOW_MS)) {
    return loginRedirect("rate_limited", false);
  }

  const { url, cookie } = await buildAuthorization(cfg);
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
