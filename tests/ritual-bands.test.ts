import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync("app/ritual/page.tsx", "utf8");
const band = readFileSync("components/RoutineBand.tsx", "utf8");
const src = page + band;

describe("ritual page: Morning and Evening are distinct bands", () => {
  it("renders two full-width routine bands with anchors and their own headings", () => {
    expect(src).toContain('id="morning"');
    expect(src).toContain('id="evening"');
    expect(src).toContain("The Morning Ritual");
    expect(src).toContain("The Evening Ritual");
  });
  it("evening is the cool light variant, morning the warm one", () => {
    expect(src).toMatch(/id="evening"[\s\S]*?dark/);
    expect(src).toContain("border-y border-ink/20 bg-cloud text-ink");
    expect(src).toContain("bg-champagne/25");
  });
  it("keeps the real step order for each routine", () => {
    expect(src).toContain('const morningRoute = ["chiarel-essence", "terra-radiance-creme"]');
    expect(src).toContain('const eveningRoute = ["chiarel-essence", "recovery-masque", "n1-neck-decollete"]');
  });
  it("jump links are real touch targets", () => {
    expect((src.match(/min-h-\[44px\]/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });
});
