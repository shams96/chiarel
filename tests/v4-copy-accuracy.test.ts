import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { products } from "@/lib/products";
import { quietNote } from "@/lib/quiet-notes";

// Every key ingredient named on a product, and every copy claim about its form,
// must be backed by that product's v4 INCI list (CHIAREL_Launch_Formulas_v4,
// Oct 30 2026). Added 2026-11-23 with the v4 copy rewrite.
const BACKING: Record<string, RegExp> = {
  Peptides: /peptide/i,
  Niacinamide: /^niacinamide$/i,
  "Hyaluronic Acid": /hyaluronate/i,
  "Marine-derived Hydrolysed Collagen": /hydrolyzed collagen/i,
  "Bifida Ferment Lysate": /bifida ferment lysate/i,
  Ceramides: /^ceramide/i,
  Cholesterol: /^cholesterol$/i,
  Squalane: /^squalane$/i,
  Bakuchiol: /^bakuchiol$/i,
  Caffeine: /^caffeine$/i,
};

// Anything that makes a formula not "oil-free": added oils, butters, lipids, esters, fatty alcohols.
const OIL_LIKE = /\boil\b|butter|squalane|triglyceride|palmitate|stearate|cetearyl|lecithin|ceramide|cholesterol|bakuchiol|tocopherol|bisabolol|sphingosine/i;

describe("v4 copy accuracy", () => {
  it("every named key ingredient is in that product's v4 INCI list", () => {
    for (const p of products.filter((x) => x.ingredientsInci?.length)) {
      for (const a of p.actives ?? []) {
        const re = BACKING[a.name];
        expect(re, `no backing rule for "${a.name}"`).toBeDefined();
        expect(p.ingredientsInci!.some((i) => re.test(i)), `${p.slug}: ${a.name}`).toBe(true);
      }
    }
  });

  it("Bifida Ferment Lysate is never claimed for Night Crème (not in 4A)", () => {
    const night = products.find((p) => p.slug === "recovery-masque")!;
    expect(JSON.stringify({ ...night, ingredientsInci: undefined })).not.toMatch(/bifida/i);
  });

  it("collagen is claimed for the Essence only, and always as marine-derived", () => {
    for (const p of products) {
      const copy = JSON.stringify({ ...p, ingredientsInci: undefined });
      if (p.slug === "chiarel-essence") expect(copy).toMatch(/marine-derived/i);
      else expect(copy, p.slug).not.toMatch(/collagen/i);
    }
  });

  it("'oil-free' appears only in copy about a formula with no oil-like ingredient", () => {
    const sources = [readFileSync("components/home/HomeHero.tsx", "utf8"), readFileSync("app/science/page.tsx", "utf8")];
    for (const p of products) {
      const copy = JSON.stringify({ ...p, ingredientsInci: undefined });
      if (/oil-free/i.test(copy)) {
        expect(p.slug).toBe("chiarel-essence");
        expect((p.ingredientsInci ?? []).filter((i) => OIL_LIKE.test(i)), p.slug).toEqual([]);
      }
    }
    // The only page-level "oil-free" claims are about Clarity Essence.
    for (const s of sources) for (const m of s.matchAll(/([^.]*oil-free[^.]*)\./gi)) expect(m[1]).toMatch(/Essence/);
  });

  it("no copy promises what is not verified: milky, non-comedogenic, non-greasy, hypoallergenic, copper", () => {
    for (const p of products) {
      const copy = JSON.stringify({ ...p, ingredientsInci: undefined });
      expect(copy, p.slug).not.toMatch(/milky|non-?comedogenic|non-?greasy|hypoallergenic|copper|lightweight/i);
    }
  });

  it("a quiet Oil-free note is only ever on a formula with no oil-like INCI line", () => {
    for (const p of products) {
      const note = quietNote(p.slug);
      if (note && /oil-free/i.test(note)) {
        expect((p.ingredientsInci ?? []).filter((i) => OIL_LIKE.test(i)), p.slug).toEqual([]);
      }
    }
    expect(quietNote("chiarel-essence")).toBe("Oil-free formula");
    for (const slug of ["terra-radiance-creme", "recovery-masque", "n1-neck-decollete", "eye-contour-concentrate"]) {
      expect(quietNote(slug), slug).toBeUndefined();
    }
  });
});

// iOS Safari zooms the page when a focused field is under 16px. The signup
// fields must be 16px on phones (desktop may stay smaller).
describe("signup fields on phones", () => {
  it("every input class in the signup forms sets a 16px base", () => {
    for (const f of ["components/ComingSoonPackshot.tsx", "components/EmailSignup.tsx"]) {
      const src = readFileSync(f, "utf8");
      const classes = [...src.matchAll(/<input[\s\S]*?className=(?:\{`([^`]*)`\}|"([^"]*)")/g)].map((m) => m[1] ?? m[2]);
      for (const c of classes.filter((c) => /border/.test(c) && !/h-[56] w-[56]/.test(c))) {
        expect(c, `${f}: ${c.slice(0, 50)}`).toMatch(/text-\[16px\]/);
      }
    }
  });
});

// Owner copy brief (2026-11-24): the hero and shop entry open with a situation,
// not a trademark. Abstract brand terms may support the copy, never lead it.
describe("situation-first hero and shop entry", () => {
  const strip = (f: string) => readFileSync(f, "utf8").replace(/\s+/g, " ");
  it("keeps brand abstractions out of the hero headline and eyebrow", () => {
    const hero = strip("components/home/HomeHero.tsx");
    const h1 = hero.slice(hero.indexOf("<h1"), hero.indexOf("</h1>"));
    expect(h1).not.toMatch(/Advancing|Cellular|Clarity|House of/);
    expect(hero).not.toContain("The House of Clarity");
  });
  it("keeps Consumer Collection out of the shop's customer-facing copy", () => {
    expect(strip("app/shop/page.tsx")).not.toContain("Consumer Collection");
  });
  it("never claims firmness in the hero or shop entry, and shows no bare Discover CTA there", () => {
    for (const f of ["components/home/HomeHero.tsx", "app/shop/page.tsx"]) {
      expect(strip(f), f).not.toMatch(/firm|Discover the/i);
    }
  });
  it("ties the guarantee near the shop CTA to its terms", () => {
    const shop = strip("app/shop/page.tsx");
    expect(shop).toContain("first order is covered by the 90-Day Guarantee");
    expect(shop).toContain('href="/terms#guarantee"');
  });
});
