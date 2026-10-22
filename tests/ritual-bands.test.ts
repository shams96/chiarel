import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { morningRoute, eveningRoute } from "@/components/RoutineBand";

const page = readFileSync("app/ritual/page.tsx", "utf8");
const band = readFileSync("components/RoutineBand.tsx", "utf8");
const src = page + band;

describe("ritual page: Morning and Evening are distinct bands", () => {
  it("renders two full-width routine bands with anchors and their own headings", () => {
    expect(src).toContain('id="morning"');
    expect(src).toContain('id="evening"');
    expect(src).toContain("Morning: prepare the skin for the day");
    expect(src).toContain("Evening: let the day go");
  });
  it("evening is the cool light variant, morning the warm one", () => {
    expect(src).toMatch(/id="evening"[\s\S]*?dark/);
    expect(src).toContain("border-y border-ink/20 bg-cloud text-ink");
    expect(src).toContain("bg-champagne/25");
  });
  it("keeps the real step order for each routine", () => {
    expect(morningRoute).toEqual(["chiarel-essence", "terra-radiance-creme"]);
    expect(eveningRoute).toEqual([
      "chiarel-essence",
      "eye-contour-concentrate",
      "recovery-masque",
      "n1-neck-decollete",
    ]);
  });
  it("carries the owner ritual copy verbatim", () => {
    for (const line of [
      "Five products, two moments in the day: prepare for it, then let it go.",
      "Morning: prepare the skin for the day",
      "Evening: let the day go",
      "Clarity Essence",
      "Clarity Day Crème",
      "Clarity Eye Contour Concentrate",
      "Clarity Night Crème",
      "Clarity Neck & Décolleté Crème",
      "Peptides · Niacinamide · Hyaluronic Acid.",
      "Ceramides · Cholesterol · Squalane.",
      "Follow with SPF.",
      "Caffeine · Peptides · Hyaluronic Acid.",
      "Made for the evening, and it may be used morning or night.",
      "Bakuchiol · Peptides · Niacinamide.",
      "Copper Peptide · Ceramides · Squalane.",
      "Order follows the texture, lightest first.",
      "Modern Biological Stress",
    ]) {
      expect(src).toContain(line);
    }
  });
  it("has no optional-preparation, lip, DRAFT or retired names", () => {
    expect(page).not.toMatch(/Optional Preparation|Beyond the Ritual|DRAFT|Cleanser|Cellular Mist|Lip Concentrate|Four-Product|Recovery Masque|Terra Radiance|N1 Neck|Eye Treatment/);
  });
  it("jump links are real touch targets", () => {
    expect((src.match(/min-h-\[44px\]/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });
});
