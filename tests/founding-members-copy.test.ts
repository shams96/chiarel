import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// The Founding Members offer is access and recognition, not a discount. These
// phrases promised a markdown or a content-for-refund exchange and must not
// come back on any page, banner or share text.
const FILES = [
  "app/founding-100/page.tsx",
  "components/Header.tsx",
  "components/ComingSoonPackshot.tsx",
  "components/PurchaseOptions.tsx",
];
const BANNED = [/half price/i, /we return the rest/i, /full refund/i, /credited back/i, /\b50% off\b/i, /\b20% off\b/i];

describe("Founding Members copy", () => {
  for (const file of FILES) {
    it(`${file} makes no discount or content-for-refund promise`, () => {
      const src = readFileSync(file, "utf8");
      for (const phrase of BANNED) expect(src).not.toMatch(phrase);
    });
  }

  it("the checkout route no longer writes a founders credit", () => {
    expect(readFileSync("app/api/checkout/route.ts", "utf8")).not.toMatch(/founding100Credit/);
  });

  it("the signup form no longer asks for a social handle (it served the retired content mechanic)", () => {
    expect(readFileSync("components/ComingSoonPackshot.tsx", "utf8")).not.toMatch(/Instagram|TikTok/i);
  });
});
