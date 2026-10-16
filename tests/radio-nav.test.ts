import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { radioTargetIndex } from "@/lib/radio-nav";

describe("radio group arrow keys", () => {
  it("moves forward and wraps", () => {
    expect(radioTargetIndex(3, 0, "ArrowDown")).toBe(1);
    expect(radioTargetIndex(3, 2, "ArrowRight")).toBe(0);
  });
  it("moves back and wraps", () => {
    expect(radioTargetIndex(3, 1, "ArrowUp")).toBe(0);
    expect(radioTargetIndex(3, 0, "ArrowLeft")).toBe(2);
  });
  it("Home and End jump to the ends; other keys are ignored", () => {
    expect(radioTargetIndex(3, 1, "Home")).toBe(0);
    expect(radioTargetIndex(3, 0, "End")).toBe(2);
    expect(radioTargetIndex(3, 0, "Tab")).toBeNull();
    expect(radioTargetIndex(3, 0, "Enter")).toBeNull();
    expect(radioTargetIndex(0, 0, "ArrowDown")).toBeNull();
  });
});

describe("plan selector wiring", () => {
  const src = readFileSync("components/PurchaseOptions.tsx", "utf8");
  it("only the selected option is a tab stop, and the group handles keys", () => {
    for (const t of ["ninetyDay", "single", "oneTime"]) {
      expect(src).toContain(`data-tier="${t}"`);
      expect(src).toContain(`tabIndex={tier === "${t}" ? 0 : -1}`);
    }
    expect(src).toContain("onKeyDown={onGroupKeyDown}");
  });
});
