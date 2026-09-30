import { describe, it, expect } from "vitest";
import { computeUnitPrice, computeLineSavings } from "./pricing";
import { totalFounding100Credit } from "./founding100";

// Pricing math is the highest-cost place for a silent bug on this site — a
// wrong number here means every order at that tier is mispriced, and
// nothing else would catch it before a customer does. These test the exact
// rule the platform audit flagged as duplicated between client and server
// (lib/cart-context.tsx vs. lib/cart-server.ts) before it was consolidated
// into lib/pricing.ts.

describe("computeUnitPrice", () => {
  it("prices the 90-day Ritual Plan at 2x the 45-day subscription rate", () => {
    expect(computeUnitPrice(151, 189, "ninetyDay")).toBe(302);
  });

  it("prices a single 45-day subscription at the subscription rate", () => {
    expect(computeUnitPrice(151, 189, "subscription")).toBe(151);
  });

  it("prices a one-time purchase at the one-time rate, ignoring subscription pricing", () => {
    expect(computeUnitPrice(151, 189, "oneTime")).toBe(189);
  });

  it("holds the 2x relationship across different price points", () => {
    for (const sub of [46, 70, 78, 118, 126, 151, 372]) {
      expect(computeUnitPrice(sub, sub * 1.25, "ninetyDay")).toBe(sub * 2);
    }
  });

  it("applies the real Founding 100 20% discount for enrolled slugs, not the flat 2x", () => {
    // N1's real bug this pins: the sitewide "90-day ritual, half price" banner
    // promised a discount that N1's own Ritual Plan never actually applied.
    expect(computeUnitPrice(118, 138, "ninetyDay", "n1-neck-decollete")).toBe(189); // round(236*0.8)
  });

  it("does not apply the Founding 100 discount to a non-enrolled product", () => {
    expect(computeUnitPrice(151, 189, "ninetyDay", "chiarel-essence")).toBe(302);
  });

  it("ignores the slug entirely for non-ninetyDay modes", () => {
    expect(computeUnitPrice(118, 138, "subscription", "n1-neck-decollete")).toBe(118);
    expect(computeUnitPrice(118, 138, "oneTime", "n1-neck-decollete")).toBe(138);
  });
});

describe("computeLineSavings", () => {
  it("is zero for a one-time purchase (no discount to save)", () => {
    const unit = computeUnitPrice(151, 189, "oneTime");
    expect(computeLineSavings(189, unit, "oneTime", 1)).toBe(0);
  });

  it("is the per-unit subscription discount for a single subscription line", () => {
    const unit = computeUnitPrice(151, 189, "subscription");
    expect(computeLineSavings(189, unit, "subscription", 1)).toBe(38); // 189 - 151
  });

  it("compares the ninetyDay price against 2x one-time, not 1x", () => {
    const unit = computeUnitPrice(151, 189, "ninetyDay"); // 302
    // Naively comparing against a single one-time price (189) would produce
    // a negative "savings" of -113 — the bug this test exists to catch.
    expect(computeLineSavings(189, unit, "ninetyDay", 1)).toBe(378 - 302); // 76
  });

  it("scales linearly with quantity", () => {
    const unit = computeUnitPrice(151, 189, "subscription");
    expect(computeLineSavings(189, unit, "subscription", 3)).toBe(38 * 3);
  });
});

describe("totalFounding100Credit", () => {
  const priceFor = (slug: string) => (slug === "n1-neck-decollete" ? 118 : 151);

  it("owes credit for an enrolled product in ninetyDay mode", () => {
    const lines = [{ slug: "n1-neck-decollete", mode: "ninetyDay", qty: 1 }];
    expect(totalFounding100Credit(lines, priceFor)).toBe(47); // round(round(236*0.8)*0.25)
  });

  it("owes nothing for a non-enrolled product", () => {
    const lines = [{ slug: "chiarel-essence", mode: "ninetyDay", qty: 1 }];
    expect(totalFounding100Credit(lines, priceFor)).toBe(0);
  });

  it("owes nothing for an enrolled product NOT in ninetyDay mode", () => {
    const lines = [{ slug: "n1-neck-decollete", mode: "subscription", qty: 1 }];
    expect(totalFounding100Credit(lines, priceFor)).toBe(0);
  });

  it("scales with quantity and sums across multiple lines", () => {
    const lines = [
      { slug: "n1-neck-decollete", mode: "ninetyDay", qty: 2 },
      { slug: "chiarel-essence", mode: "ninetyDay", qty: 1 }, // not enrolled, ignored
    ];
    expect(totalFounding100Credit(lines, priceFor)).toBe(47 * 2);
  });
});
