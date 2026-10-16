import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { nextFocusIndex } from "@/lib/dialog-focus";

describe("focus trap order", () => {
  it("wraps forwards and backwards", () => {
    expect(nextFocusIndex(4, 3, false)).toBe(0);
    expect(nextFocusIndex(4, 0, true)).toBe(3);
    expect(nextFocusIndex(4, 1, false)).toBe(2);
    expect(nextFocusIndex(4, 2, true)).toBe(1);
  });
  it("starts at an end when focus is outside the dialog; handles empty", () => {
    expect(nextFocusIndex(3, -1, false)).toBe(0);
    expect(nextFocusIndex(3, -1, true)).toBe(2);
    expect(nextFocusIndex(0, 0, false)).toBe(-1);
  });
});

describe("drawer and menu are real dialogs", () => {
  for (const file of ["components/CartDrawer.tsx", "components/Header.tsx"]) {
    const src = readFileSync(file, "utf8");
    it(`${file}: named modal dialog wired to useDialog`, () => {
      expect(src).toContain('role="dialog"');
      expect(src).toContain('aria-modal="true"');
      expect(src).toMatch(/aria-label="(Your Ritual Bag|Menu)"/);
      expect(src).toContain("useDialog(");
    });
  }
});
