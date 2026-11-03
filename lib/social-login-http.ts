import { NextResponse } from "next/server";
import { OAUTH_COOKIE, OAUTH_COOKIE_PATH, siteOrigin } from "@/lib/oauth-google";
import { safeErrorCode } from "@/lib/api-error";

// Neutral outcomes for the browser. The login page maps these fixed codes to
// fixed text; nothing from the provider or the request is ever echoed back, so
// the page cannot be used to tell an unknown address from a failed sign-in.
export type LoginNotice = "failed" | "rate_limited";

export function clearOAuthCookieOn(res: NextResponse): void {
  res.cookies.set(OAUTH_COOKIE, "", { path: OAUTH_COOKIE_PATH, maxAge: 0 });
}

export function loginRedirect(notice: LoginNotice, clearOAuthCookie = true): NextResponse {
  const res = NextResponse.redirect(`${siteOrigin()}/admin/login?notice=${notice}`, 303);
  if (clearOAuthCookie) clearOAuthCookieOn(res);
  return res;
}

export function adminRedirect(): NextResponse {
  const res = NextResponse.redirect(`${siteOrigin()}/admin`, 303);
  clearOAuthCookieOn(res);
  return res;
}

export function notFound(): NextResponse {
  return new NextResponse(null, { status: 404 });
}

/** A short, safe reason label for the audit log: never provider text or secrets. */
export function reasonCode(err: unknown): string {
  const message = (err as { message?: unknown } | null)?.message;
  if (typeof message === "string" && /^[a-z_]{3,40}$/.test(message)) return message;
  return safeErrorCode(err);
}

/** Replaces the generic JSON 503 with a page a person can read during a database outage. */
export function unavailableIfJson503(res: NextResponse): NextResponse {
  if (res.status !== 503) return res;
  const html =
    '<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>Sign-in unavailable</title>' +
    '<p style="font-family:sans-serif;max-width:32rem;margin:4rem auto">Sign-in is temporarily unavailable. ' +
    'Please try again in a moment. <a href="/admin/login">Back to sign in</a></p>';
  const out = new NextResponse(html, {
    status: 503,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
  const retry = res.headers.get("Retry-After");
  if (retry) out.headers.set("Retry-After", retry);
  clearOAuthCookieOn(out);
  return out;
}
