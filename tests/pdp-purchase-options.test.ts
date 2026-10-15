import { describe, expect, it } from "vitest";
import { purchaseOptionSummary, computeUnitPrice, perDayPrice } from "@/lib/pricing";
import { products, isPurchasable } from "@/lib/products";

describe("purchaseOptionSummary (PDP purchase box)", () => {
  it("Essence: Ritual Plan is 2x subscription, saving measured against two one-time purchases", () => {
    const s = purchaseOptionSummary("chiarel-essence", 151, 189);
    expect(s.ritual).toEqual({ total: 302, saving: 76 }); // 378 - 302
    expect(s.subscription).toEqual({ perDelivery: 151, saving: 38 });
    expect(s.oneTime).toEqual({ price: 189 });
  });

  it("N1 gets the same flat Ritual Plan as every product, with no founders discount", () => {
    const s = purchaseOptionSummary("n1-neck-decollete", 118, 138);
    expect(s.ritual.total).toBe(236); // 2 x 118
    expect(s.ritual.saving).toBe(40); // 276 - 236
    expect(s.subscription.saving).toBe(20);
  });

  it("never reports a negative saving", () => {
    const s = purchaseOptionSummary("some-slug", 200, 150);
    expect(s.ritual.saving).toBe(0);
    expect(s.subscription.saving).toBe(0);
  });

  it("matches the cart's computeUnitPrice for every purchasable product", () => {
    for (const p of products.filter(isPurchasable)) {
      const s = purchaseOptionSummary(p.slug, p.price.subscription, p.price.oneTime);
      expect(s.ritual.total).toBe(computeUnitPrice(p.price.subscription, p.price.oneTime, "ninetyDay", p.slug));
      expect(s.subscription.perDelivery).toBe(computeUnitPrice(p.price.subscription, p.price.oneTime, "subscription", p.slug));
      expect(s.oneTime.price).toBe(computeUnitPrice(p.price.subscription, p.price.oneTime, "oneTime", p.slug));
    }
  });
});

describe("perDayPrice", () => {
  it("Essence: $151 per 45 days is $3.36 a day, $189 one-time is $4.20", () => {
    expect(perDayPrice(151)).toBe("3.36");
    expect(perDayPrice(189)).toBe("4.20");
  });

  it("the Ritual Plan over 90 days matches the subscription per-day figure", () => {
    expect(perDayPrice(302, 90)).toBe(perDayPrice(151));
  });
});
