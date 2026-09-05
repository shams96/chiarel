import { describe, it, expect } from "vitest";
import { computeUnitPrice, computeLineSavings } from "./pricing";

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
