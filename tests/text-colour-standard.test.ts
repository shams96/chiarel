// Text colour standard (owner, 2026-11-07): words are set in the true brand ink (#1D1D1F) or
// the true light colour on dark panels, not in 70-90% opacity washes, so the Bodoni hairlines
// stay crisp and every word reads as premium. Hierarchy comes from size, case and weight.
// Exempt: placeholders and disabled states (meant to look inactive) and the admin console.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (p: string) => readFileSync(p, "utf8");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith(".tsx")) out.push(p.replace(/\\/g, "/"));
  }
  return out;
}

const PUBLIC = [...walk("app"), ...walk("components")].filter(
  (f) => !f.startsWith("app/admin") && !f.startsWith("components/admin"),
);

describe("text uses the true colour, not a faded one", () => {
  it("no text-ink or text-ivory at 70-90% opacity on public pages and components", () => {
    const bad = PUBLIC.flatMap((f) =>
      (read(f).match(/(?<![:\w-])text-(ink|ivory)\/(60|65|70|75|80|85|90)\b/g) ?? []).map((m) => `${f}: ${m}`),
    );
    expect(bad).toEqual([]);
  });

  it("the footer text is also full colour", () => {
    expect(read("components/Footer.tsx")).not.toMatch(/(?<![:\w-])text-(ink|cloud)\/(60|70|75|80)\b/);
  });
});

describe("one crisp rendering rule, family untouched", () => {
  const css = read("app/globals.css");
  it("body turns on kerning and legibility and forbids faked bold/italic", () => {
    expect(css).toMatch(/text-rendering:\s*optimizeLegibility/);
    expect(css).toMatch(/font-kerning:\s*normal/);
    expect(css).toMatch(/font-synthesis:\s*none/);
  });
  it("does not declare a font-family (locked by tests/brand-fonts.test.ts)", () => {
    expect(css).not.toMatch(/font-family\s*:/);
  });
});

describe("the footer sits on the shared container", () => {
  it("uses max-w-container and px-margin like the header and sections", () => {
    const footer = read("components/Footer.tsx");
    expect(footer).toContain("max-w-container px-margin");
    expect(footer).not.toContain("max-w-7xl");
  });
  it("the wordmark and mobile seam geometry are unchanged", () => {
    const footer = read("components/Footer.tsx");
    expect(footer).toContain("25.2cqw");
    expect(footer).toContain("top-[calc(282px-5.75vw)]");
    expect(footer).toContain("h-[280px]");
  });
});

// Owner, 2026-11-07: "light black" text is #1d1d1f (the logo ink) everywhere, admin and the
// hero poster included. Only the black is covered here; other colours are untouched.
describe("black text is exactly the logo ink", () => {
  const ALL = [...walk("app"), ...walk("components")];
  it("no text-ink at reduced opacity anywhere, admin included (placeholder/disabled variants exempt)", () => {
    const bad = ALL.flatMap((f) =>
      (read(f).match(/(?<![:\w-])text-ink\/\d+\b/g) ?? []).map((m) => `${f}: ${m}`),
    );
    expect(bad).toEqual([]);
  });
  it("the hero poster text and ladder/outline type use #1d1d1f, not the old 50 49 45 grey-black", () => {
    const css = read("app/globals.css");
    expect(css).not.toMatch(/rgb\(50 49 45\)/);
    expect(css).not.toMatch(/(?<![-\w])color:\s*rgb\(50 49 45/);
    expect(css).toMatch(/\.poster > span \{[^}]*color:\s*rgb\(var\(--c-ink\)\);/);
    // and Day ink resolves to the logo ink #1d1d1f (29 29 31)
    expect(css).toMatch(/:root,\s*\[data-theme="light"\][\s\S]*?--c-ink: 29 29 31;/);
  });
  it("the global error page text is the logo ink", () => {
    expect(read("app/global-error.tsx")).not.toContain("rgba(29,29,31,0.7)");
  });
});
