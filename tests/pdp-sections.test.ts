import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { products, publishedInci } from "@/lib/products";
import { pdpSections } from "@/lib/pdp-sections";

const bySlug = (slug: string) => products.find((p) => p.slug === slug)!;

describe("pdpSections (accordions beside the buy box)", () => {
  // Updated deliberately: the owner decided to stop publishing ingredient
  // percentages, so this now asserts key ingredient NAMES only (v2 INCI names).
  it("Essence: benefits, how to use and its named key ingredients, no percentages", () => {
    const s = pdpSections(bySlug("chiarel-essence"));
    expect(s.map((x) => x.id)).toEqual(["benefits", "how-to-use", "actives"]);
    const actives = s.find((x) => x.id === "actives");
    expect(actives && "actives" in actives && actives.actives).toEqual([
      { name: "Acetyl Hexapeptide-8" },
      { name: "Palmitoyl Tripeptide-1" },
      { name: "Palmitoyl Tetrapeptide-7" },
      { name: "Bifida Ferment Lysate" },
      { name: "Niacinamide" },
    ]);
    expect(actives && "title" in actives && actives.title).toBe("Key ingredients");
  });

  it("N1 has no disclosed actives, so no actives or ingredients accordion is invented", () => {
    const ids = pdpSections(bySlug("n1-neck-decollete")).map((x) => x.id);
    expect(ids).toEqual(["benefits", "how-to-use"]);
  });

  it("a product with no data gets no sections at all", () => {
    expect(pdpSections(bySlug("the-ritual-set"))).toEqual([]);
  });

  it("N1 and Eye Contour carry a draft INCI list but no key ingredients, so no ingredient section shows", () => {
    for (const slug of ["n1-neck-decollete", "eye-contour-concentrate"]) {
      const ids = pdpSections(bySlug(slug)).map((x) => x.id);
      expect(ids).not.toContain("actives");
      expect(ids).not.toContain("ingredients");
    }
  });

  it("an INCI list marked 'final' renders in order; draft lists never render", () => {
    const base = bySlug("chiarel-essence");
    const final = { ...base, ingredientsInci: ["Aqua", "Glycerin", "Niacinamide"], ingredientsInciStatus: "final" as const };
    const ids = pdpSections(final).map((x) => x.id);
    expect(ids).toContain("ingredients");
    expect(ids).not.toContain("actives");
    const sec = pdpSections(final).find((x) => x.id === "ingredients");
    expect(sec && "inci" in sec && sec.inci).toBe("Aqua, Glycerin, Niacinamide");
    expect(sec && "inci" in sec && sec.inci).not.toContain("%");

    const draft = { ...final, ingredientsInciStatus: "draft-v2" as const };
    expect(pdpSections(draft).map((x) => x.id)).not.toContain("ingredients");
    expect(publishedInci(draft)).toBeNull();
    expect(publishedInci({ ...final, ingredientsInciStatus: undefined })).toBeNull();
  });

  it("all five launch products ship a draft-v2 INCI list that is hidden by default", () => {
    const slugs = ["chiarel-essence", "terra-radiance-creme", "n1-neck-decollete", "recovery-masque", "eye-contour-concentrate"];
    for (const slug of slugs) {
      const p = bySlug(slug);
      expect(p.ingredientsInci && p.ingredientsInci.length).toBeGreaterThan(10);
      expect(p.ingredientsInci![0]).toBe("Aqua");
      expect(p.ingredientsInciStatus).toBe("draft-v2");
      expect(publishedInci(p)).toBeNull();
    }
    expect(bySlug("chiarel-essence").ingredientsInci).not.toContain("Palmitoyl Pentapeptide-4");
  });

  it("no product data contains a percentage, a percent field, or the old pentapeptide claim", () => {
    const json = readFileSync("data/products.json", "utf8");
    expect(json).not.toMatch(/%/);
    expect(json).not.toMatch(/"percent"/);
    expect(json).not.toMatch(/Pentapeptide-4/);
  });

  it("every item shown comes straight from the product data", () => {
    for (const p of products) {
      for (const s of pdpSections(p)) {
        if (s.kind === "list") expect(s.items).toEqual(p.benefits);
        if (s.kind === "steps") expect(s.items).toEqual(p.howToUse);
        if (s.kind === "actives") {
          for (const a of s.actives) expect(p.actives).toContainEqual({ name: a.name });
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
