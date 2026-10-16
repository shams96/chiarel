import { NextRequest, NextResponse } from "next/server";

const CART_COOKIE = "chiarel_cart_id";

// The cart cookie is minted only when a visitor first WRITES to the cart
// (POST /api/cart), never on page loads or reads. Two reasons: (1) pages with a
// Set-Cookie cannot be cached by the CDN, so minting on every page forced every
// visit to the origin; (2) a cookie set only on the response is invisible to
// code running in the same request, so the first add-to-cart used to create an
// orphan cart nothing pointed at. The new id is also placed on the forwarded
// request so the route handler sees the very cookie the browser will receive.
export function middleware(request: NextRequest) {
  const mintsCartCookie =
    !request.cookies.get(CART_COOKIE) &&
    request.method === "POST" &&
    request.nextUrl.pathname === "/api/cart";
  const newCartId = mintsCartCookie ? crypto.randomUUID() : null;

  const requestHeaders = new Headers(request.headers);
  if (newCartId) {
    const existing = requestHeaders.get("cookie");
    requestHeaders.set("cookie", `${existing ? `${existing}; ` : ""}${CART_COOKIE}=${newCartId}`);
  }
  const response = NextResponse.next({ request: { headers: requestHeaders } });

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(self)");
  // 'unsafe-inline' on script-src is required for the JSON-LD
  // dangerouslySetInnerHTML blocks (app/layout.tsx, app/page.tsx, etc.) —
  // all of those are server-rendered from static/DB-sourced data, never raw
  // user input, so this doesn't open an XSS hole; frame-ancestors 'none'
  // backs up X-Frame-Options for browsers that honor CSP over the legacy
  // header.
  // Next.js dev mode's Fast Refresh runtime evaluates code via eval() to
  // patch modules in place; a strict script-src without 'unsafe-eval' makes
  // the browser throw on every HMR update, which crashes hydration client-side
  // and can leave the page's splash/preloader stuck (blank screen) even
  // though the server-rendered HTML is fine. Production never uses eval-based
  // Fast Refresh, so this relaxation is dev-only and doesn't weaken the
  // deployed CSP.
  const scriptSrc =
    process.env.NODE_ENV === "production"
      ? "script-src 'self' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com"
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.googletagmanager.com";
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      // GA4 hosts are inert unless NEXT_PUBLIC_GA_MEASUREMENT_ID is set and the
      // visitor opts in (components/Analytics.tsx).
      "connect-src 'self' https://api.stripe.com https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com",
      "frame-src https://js.stripe.com https://checkout.stripe.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  );
  // Only meaningful once the site is actually served over HTTPS (see the
  // chiarel.com domain-connection work) — tells browsers to always use
  // HTTPS for this origin going forward, closing the window an attacker on
  // a shared network could downgrade a plain-http request before HTTPS
  // redirect logic even runs. Not set in local dev, where the dev server is
  // plain http and this header would just be inert noise.
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains"
    );
  }

  if (newCartId) {
    response.cookies.set(CART_COOKIE, newCartId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 90,
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
