import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { products } from "@/lib/products";
import { pdpSections } from "@/lib/pdp-sections";

const bySlug = (slug: string) => products.find((p) => p.slug === slug)!;

describe("pdpSections (accordions beside the buy box)", () => {
  it("Essence: benefits, how to use and its two disclosed actives with exact percentages", () => {
    const s = pdpSections(bySlug("chiarel-essence"));
    expect(s.map((x) => x.id)).toEqual(["benefits", "how-to-use", "actives"]);
    const actives = s.find((x) => x.id === "actives");
    expect(actives && "actives" in actives && actives.actives).toEqual([
      { name: "Palmitoyl Pentapeptide-4", percent: "3%" },
      { name: "Bioactive Ferment Lysate (BFL)", percent: "0.30%" },
    ]);
  });

  it("N1 has no disclosed actives, so no actives or ingredients accordion is invented", () => {
    const ids = pdpSections(bySlug("n1-neck-decollete")).map((x) => x.id);
    expect(ids).toEqual(["benefits", "how-to-use"]);
  });

  it("a product with no data gets no sections at all", () => {
    expect(pdpSections(bySlug("the-ritual-set"))).toEqual([]);
  });

  it("only offers an Ingredients section when a final-label INCI list exists", () => {
    const withInci = { ...bySlug("chiarel-essence"), ingredientsInci: "Aqua, Glycerin" };
    const ids = pdpSections(withInci).map((x) => x.id);
    expect(ids).toContain("ingredients");
    expect(ids).not.toContain("actives");
    for (const p of products) {
      if (!p.ingredientsInci) expect(pdpSections(p).map((x) => x.id)).not.toContain("ingredients");
    }
  });

  it("every item shown comes straight from the product data", () => {
    for (const p of products) {
      for (const s of pdpSections(p)) {
        if (s.kind === "list") expect(s.items).toEqual(p.benefits);
        if (s.kind === "steps") expect(s.items).toEqual(p.howToUse);
        if (s.kind === "actives") {
          for (const a of s.actives) expect(p.actives).toContainEqual({ name: a.name, percent: a.percent });
        }
      }
    }
  });
});

describe("product page wiring", () => {
  const page = readFileSync("app/shop/[slug]/page.tsx", "utf8");

  it("renders the accordions directly under the buy box, before the blurb", () => {
    const accordions = page.indexOf("<ProductAccordions");
    expect(accordions).toBeGreaterThan(page.indexOf("<PurchaseOptions"));
    expect(accordions).toBeLessThan(page.indexOf("{p.blurb}"));
  });

  it("paired products on the regimen cards have an Add to bag button, not a link wrapping a button", () => {
    expect(page).toMatch(/<AddPairButton/);
    expect(page).toMatch(/Complete your regimen/);
  });
});
