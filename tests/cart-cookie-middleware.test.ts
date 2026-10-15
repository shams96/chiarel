import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

const CART = "chiarel_cart_id";
const req = (path: string, method = "GET", cookie?: string) =>
  new NextRequest(`https://chiarel.com${path}`, { method, headers: cookie ? { cookie } : {} });

describe("cart cookie minting (middleware)", () => {
  it("mints a cart cookie on the first add-to-cart (POST /api/cart) and forwards the same id to the handler", () => {
    const res = middleware(req("/api/cart", "POST"));
    const set = res.cookies.get(CART);
    expect(set?.value).toMatch(/^[0-9a-f-]{36}$/);
    // The route handler runs in the same request, so it must see the very cookie the browser will get.
    expect(res.headers.get("x-middleware-request-cookie")).toContain(`${CART}=${set!.value}`);
  });

  it("keeps other cookies on the forwarded request when it mints", () => {
    const res = middleware(req("/api/cart", "POST", "theme=dark"));
    const forwarded = res.headers.get("x-middleware-request-cookie")!;
    expect(forwarded).toContain("theme=dark");
    expect(forwarded).toContain(CART);
  });

  it("never mints on page loads, reads, assets or other API routes (keeps pages cacheable, reads side-effect free)", () => {
    for (const [path, method] of [
      ["/", "GET"],
      ["/shop/chiarel-essence", "GET"],
      ["/cart", "GET"],
      ["/api/cart", "GET"],
      ["/api/cart/abc", "PATCH"],
      ["/api/checkout", "POST"],
      ["/api/webhooks/stripe", "POST"],
      ["/robots.txt", "GET"],
    ] as const) {
      const res = middleware(req(path, method));
      expect(res.cookies.get(CART), `${method} ${path}`).toBeUndefined();
    }
  });

  it("does not replace an existing cart cookie", () => {
    const res = middleware(req("/api/cart", "POST", `${CART}=existing-id`));
    expect(res.cookies.get(CART)).toBeUndefined();
  });

  it("still sets the security headers", () => {
    const res = middleware(req("/", "GET"));
    expect(res.headers.get("x-frame-options")).toBe("DENY");
    expect(res.headers.get("content-security-policy")).toContain("frame-ancestors 'none'");
  });
});
