import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { products } from "@/lib/products";

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
});
