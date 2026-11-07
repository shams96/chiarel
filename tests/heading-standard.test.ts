// Sitewide heading standard (owner, 2026-11-06): section headings use the type-scale tokens
// (text-h1..h4) and the brand colours, never ad hoc clamp() sizes or raw text-2xl/3xl. Homepage
// sections sit in the shared container, not their own max-width. Fonts are locked separately
// (tests/brand-fonts.test.ts).
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

const headingTags = (src: string) => src.match(/<h[1-4]\b[^>]*>/g) ?? [];

describe("homepage headings use tokens, not ad hoc sizes", () => {
  const files = walk("components/home");

  it("no heading in components/home sets its size with clamp() or a raw text-xl/2xl/3xl", () => {
    const bad = files.flatMap((f) =>
      headingTags(read(f))
        .filter((t) => /clamp\(|text-(xl|2xl|3xl|4xl)\b/.test(t))
        .map((t) => `${f}: ${t}`),
    );
    expect(bad).toEqual([]);
  });

  it("no home section keeps its own 84rem width: they use the shared container", () => {
    const bad = files.filter((f) => /max-w-\[84rem\]|max-w-\[56rem\]/.test(read(f)));
    expect(bad).toEqual([]);
  });

  it("the two-column sections are built inside Container", () => {
    for (const f of ["components/home/HomeFaceBeyond.tsx", "components/home/HomeIconProduct.tsx"]) {
      expect(read(f), f).toContain('from "@/components/layout/Container"');
    }
  });
});

describe("public inner pages use tokens for section headings", () => {
  const PUBLIC = [
    "app/science",
    "app/journal",
    "app/shop",
    "app/press",
    "app/founding-100",
    "app/house",
    "app/privacy",
    "app/terms",
    "app/ritual",
    "app/contact",
  ].flatMap((d) => (statSync(d).isDirectory() ? walk(d) : [d]));

  it("no h2/h3 uses a raw text-xl/2xl/3xl", () => {
    const bad = PUBLIC.flatMap((f) =>
      headingTags(read(f))
        .filter((t) => /^<h[23]\b/.test(t) && /\btext-(xl|2xl|3xl)\b/.test(t))
        .map((t) => `${f}: ${t}`),
    );
    expect(bad).toEqual([]);
  });

  it("section headings are ochre, legal headings are ink, at the same token sizes", () => {
    expect(read("app/science/barrier-resilience/page.tsx")).toContain('<h2 className="font-serif text-h3 text-ochre">Ceramides</h2>');
    expect(read("app/privacy/page.tsx")).toContain('<h2 className="font-serif text-h4 text-ink">Cookies</h2>');
  });
});

describe("page titles and card names follow the standard", () => {
  it("PageHead titles use text-h1 (one title size), not the poster size", () => {
    const head = read("components/layout/PageHead.tsx");
    expect(head).toMatch(/<h1 className="stagger font-serif text-h1">/);
    expect(head).not.toContain("text-mega");
  });

  it("product card names are text-h4 ochre", () => {
    expect(read("components/ProductCard.tsx")).toMatch(/<h3 className="font-serif text-h4 text-ochre/);
  });
});

describe("SectionHeading is the homepage standard", () => {
  it.each(["HomeFaceBeyond", "HomeIconProduct", "HomeFitGuidance", "HomeProof", "HomeFaq", "HomeRitual", "HomeFormulationRecord"])(
    "%s uses it",
    (name) => {
      expect(read(`components/home/${name}.tsx`)).toContain('from "@/components/layout/SectionHeading"');
    },
  );
});
