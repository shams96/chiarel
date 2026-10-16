import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { trustedOrigin } from "@/lib/site-origin";
import { setLineQty, withTotals } from "@/lib/cart-math";
import { MAX_LINE_QTY } from "@/lib/cart-limits";

describe("trustedOrigin (Stripe return URLs)", () => {
  it("accepts this site, apex or www", () => {
    expect(trustedOrigin("https://chiarel.com", "https://chiarel.com/api/checkout")).toBe("https://chiarel.com");
    expect(trustedOrigin("https://www.chiarel.com", "https://chiarel.com/api/checkout")).toBe("https://www.chiarel.com");
  });
  it("ignores a foreign or missing Origin in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(trustedOrigin("https://evil.example", "https://chiarel.com/x")).toBe("https://chiarel.com");
    expect(trustedOrigin(null, "http://localhost:3000/x")).toBe("https://chiarel.com");
    vi.unstubAllEnvs();
  });
  it("allows localhost only outside production", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(trustedOrigin("http://localhost:4600", "http://localhost:4600/x")).toBe("http://localhost:4600");
    expect(trustedOrigin("https://evil.example", "https://evil.example/x")).toBe("https://chiarel.com");
    vi.unstubAllEnvs();
  });
});

describe("quantity cap", () => {
  const snap = withTotals({
    lines: [{ id: "l1", slug: "chiarel-essence", mode: "oneTime" as const, qty: 1, unitPrice: 189 }],
    count: 0, subtotal: 0, savings: 0,
  })!;
  it("optimistic math refuses more than the server accepts", () => {
    expect(setLineQty(snap, "l1", MAX_LINE_QTY)).not.toBeNull();
    expect(setLineQty(snap, "l1", MAX_LINE_QTY + 1)).toBeNull();
  });
  it("server routes enforce it", () => {
    expect(readFileSync("app/api/cart/[itemId]/route.ts", "utf8")).toContain("qty > MAX_LINE_QTY");
    expect(readFileSync("app/api/cart/route.ts", "utf8")).toContain("MAX_LINE_QTY");
  });
});

describe("route guards stay in place", () => {
  const checkout = readFileSync("app/api/checkout/route.ts", "utf8");
  it("checkout never builds return URLs from the raw Origin header", () => {
    expect(checkout).not.toMatch(/headers\.get\("origin"\) \?\?/);
    expect(checkout).toContain("trustedOrigin(");
  });
  it("checkout never overwrites an existing Stripe customer", () => {
    expect(checkout).not.toContain("customers.update");
  });
  it("admin login has a global attempt cap and a constant-time unknown-user path", () => {
    const login = readFileSync("app/api/admin/auth/login/route.ts", "utf8");
    expect(login).toContain('"admin-login:all"');
    expect(login).toContain("DUMMY_HASH");
  });
  it("adding to the bag is rate limited; X-Powered-By is off", () => {
    expect(readFileSync("app/api/cart/route.ts", "utf8")).toContain("cart-add:");
    expect(readFileSync("next.config.mjs", "utf8")).toContain("poweredByHeader: false");
  });
});
