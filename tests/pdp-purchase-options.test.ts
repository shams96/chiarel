import { describe, expect, it } from "vitest";
import { purchaseOptionSummary, computeUnitPrice } from "@/lib/pricing";
import { products, isPurchasable } from "@/lib/products";

describe("purchaseOptionSummary (PDP purchase box)", () => {
  it("Essence: Ritual Plan is 2x subscription, saving measured against two one-time purchases", () => {
    const s = purchaseOptionSummary("chiarel-essence", 151, 189);
    expect(s.ritual).toEqual({ total: 302, saving: 76 }); // 378 - 302
    expect(s.subscription).toEqual({ perDelivery: 151, saving: 38 });
    expect(s.oneTime).toEqual({ price: 189 });
  });

  it("Founding 100 products use the real 20%-off checkout total, not the flat 2x", () => {
    const s = purchaseOptionSummary("n1-neck-decollete", 118, 138);
    expect(s.ritual.total).toBe(189); // round(236 * 0.8)
    expect(s.ritual.saving).toBe(87); // 276 - 189
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
