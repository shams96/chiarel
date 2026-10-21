import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { computeUnitPrice, planOptions } from "@/lib/pricing";
import { shippingFor, shippingNote } from "@/lib/shipping";
import { isPurchasable, products } from "@/lib/products";

describe("shippingFor (shared by checkout, drawer and cart page)", () => {
  it("ships every order free, whatever the bag size or purchase mode", () => {
    expect(shippingFor(40, [{ mode: "oneTime" }])).toBe(0);
    expect(shippingFor(138, [{ mode: "oneTime" }])).toBe(0);
    expect(shippingFor(118, [{ mode: "subscription" }])).toBe(0);
    expect(shippingFor(40, [{ mode: "ninetyDay" }])).toBe(0);
    expect(shippingFor(0, [])).toBe(0);
  });

  it("the note says shipping is complimentary on every order", () => {
    expect(shippingNote(138, [{ mode: "oneTime" }])).toBe("Complimentary shipping on every order.");
  });

  it("makes no sample promise anywhere a customer buys (until INCI and filling are settled)", () => {
    for (const f of ["app/checkout/page.tsx", "components/CartDrawer.tsx", "components/CartPageContent.tsx", "components/PurchaseOptions.tsx", "lib/shipping.ts"]) {
      expect(readFileSync(f, "utf8")).not.toMatch(/Complimentary samples/i);
    }
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
