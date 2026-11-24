import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// At 375px the header row (wordmark, Shop, Day/Evening, Bag, menu) ran 2px past
// the screen edge and Shop touched the wordmark. On phones the toggle lives in
// the menu panel; the header keeps it from sm up.
const src = readFileSync("components/Header.tsx", "utf8");

describe("header on phones", () => {
  it("shows the theme toggle in the header only from sm up", () => {
    expect(src).toMatch(/<span className="hidden sm:contents">\s*<ThemeToggle \/>/);
  });
  it("offers the theme toggle inside the menu panel on phones only", () => {
    expect(src).toMatch(/<span className="sm:hidden">\s*<ThemeToggle \/>/);
  });
});
