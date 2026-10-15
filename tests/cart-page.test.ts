import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { computeUnitPrice, planOptions } from "@/lib/pricing";
import { EXTRA_SAMPLE_THRESHOLD, FREE_SHIP_THRESHOLD, SHIPPING_COST, shippingFor, shippingNote } from "@/lib/shipping";
import { isPurchasable, products } from "@/lib/products";

describe("shippingFor (shared by checkout, drawer and cart page)", () => {
  const oneTime = [{ mode: "oneTime" }];

  it("one-time bags ship free at or above the threshold and pay a flat charge below it", () => {
    expect(shippingFor(FREE_SHIP_THRESHOLD, oneTime)).toBe(0);
    expect(shippingFor(FREE_SHIP_THRESHOLD - 1, oneTime)).toBe(SHIPPING_COST);
    expect(shippingFor(138, oneTime)).toBe(SHIPPING_COST);
  });

  it("the Ritual Plan and subscriptions ship free at any size", () => {
    expect(shippingFor(118, [{ mode: "subscription" }])).toBe(0);
    expect(shippingFor(40, [{ mode: "ninetyDay" }])).toBe(0);
    expect(shippingFor(40, [{ mode: "oneTime" }, { mode: "subscription" }])).toBe(0);
  });

  it("charges nothing for an empty bag", () => {
    expect(shippingFor(0, [])).toBe(0);
  });

  it("the note tells a one-time bag how to unlock free shipping, and confirms it once unlocked", () => {
    expect(shippingNote(138, oneTime)).toMatch(/Ritual Plan or a subscription, or add \$12 more/);
    expect(shippingNote(138, [{ mode: "ninetyDay" }])).toBe("Complimentary shipping included.");
    expect(shippingNote(150, oneTime)).toBe("Complimentary shipping included.");
  });

  it("keeps the bonus-sample threshold above the free-shipping threshold", () => {
    expect(EXTRA_SAMPLE_THRESHOLD).toBeGreaterThan(FREE_SHIP_THRESHOLD);
  });
});

describe("planOptions (the cart page plan selector)", () => {
  it("lists Ritual Plan, Subscription, One-time in that order", () => {
    const o = planOptions("chiarel-essence", 151, 189);
    expect(o.map((x) => x.mode)).toEqual(["ninetyDay", "subscription", "oneTime"]);
    expect(o.map((x) => x.price)).toEqual([302, 151, 189]);
  });

  it("charges the same price the cart does for every purchasable product", () => {
    for (const p of products.filter(isPurchasable)) {
      for (const o of planOptions(p.slug, p.price.subscription, p.price.oneTime)) {
        expect(o.price).toBe(computeUnitPrice(p.price.subscription, p.price.oneTime, o.mode, p.slug));
      }
    }
  });
});

describe("cart page wiring", () => {
  const read = (p: string) => readFileSync(p, "utf8");

  it("the shipping numbers live only in lib/shipping.ts", () => {
    for (const f of ["app/api/checkout/route.ts", "app/checkout/page.tsx", "components/CartDrawer.tsx"]) {
      expect(read(f)).not.toMatch(/const (FREE_SHIP_THRESHOLD|SHIPPING_COST|EXTRA_SAMPLE_THRESHOLD)\s*=/);
    }
  });

  it("/cart is kept out of search results and crawlers", () => {
    expect(read("app/cart/page.tsx")).toMatch(/index:\s*false/);
    expect(read("app/robots.ts")).toMatch(/"\/cart"/);
  });

  it("the drawer links to the bag page", () => {
    expect(read("components/CartDrawer.tsx")).toMatch(/href="\/cart"/);
  });

  it("every control on the page keeps a 44px hit area", () => {
    const src = read("components/CartPageContent.tsx");
    expect(src).toMatch(/h-11 w-11/);
    expect(src).toMatch(/min-h-\[44px\]/);
  });
});
