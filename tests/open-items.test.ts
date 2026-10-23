import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("open items closed", () => {
  it("founding capture form ids are unique per instance (two cards render on /founding-100)", () => {
    const src = readFileSync("components/ComingSoonPackshot.tsx", "utf8");
    expect(src).toContain("useId");
    expect(src).not.toMatch(/id="founding-/);
  });

  it("footer names the Clarity neck product and no longer shows the Recovery Masque alt", () => {
    const src = readFileSync("components/Footer.tsx", "utf8");
    expect(src).toContain("/shop/clarity-neck-decollete-creme");
    expect(src).toContain("Clarity Neck & Décolleté Crème");
    expect(src).not.toContain("Recovery Masque");
  });
});
