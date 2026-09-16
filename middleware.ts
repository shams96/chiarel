import { NextRequest, NextResponse } from "next/server";

const CART_COOKIE = "chiarel_cart_id";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
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

  if (!request.cookies.get(CART_COOKIE)) {
    response.cookies.set(CART_COOKIE, crypto.randomUUID(), {
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
