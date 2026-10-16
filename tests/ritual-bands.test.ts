import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const src = readFileSync("app/ritual/page.tsx", "utf8");

describe("ritual page: Morning and Evening are distinct bands", () => {
  it("renders two full-width routine bands with anchors and their own headings", () => {
    expect(src).toContain('id="morning"');
    expect(src).toContain('id="evening"');
    expect(src).toContain("The Morning Ritual");
    expect(src).toContain("The Evening Ritual");
  });
  it("evening is the dark variant, morning the light one", () => {
    expect(src).toMatch(/id="evening"[\s\S]*?dark/);
    expect(src).toContain("bg-garden text-ivory");
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
