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
      { name: "Peptides" },
      { name: "Niacinamide" },
      { name: "Hyaluronic Acid" },
    ]);
    expect(actives && "title" in actives && actives.title).toBe("Key ingredients");
  });

  it("Neck & Décolleté and Eye Contour name their key ingredients, and the hidden draft INCI never renders", () => {
    const named = {
      "n1-neck-decollete": ["Copper Peptide", "Ceramides", "Squalane"],
      "eye-contour-concentrate": ["Caffeine", "Peptides", "Hyaluronic Acid"],
    };
    for (const [slug, names] of Object.entries(named)) {
      const s = pdpSections(bySlug(slug));
      const actives = s.find((x) => x.id === "actives");
      expect(actives && "actives" in actives && actives.actives.map((a) => a.name)).toEqual(names);
      expect(s.map((x) => x.id)).not.toContain("ingredients");
    }
  });

  it("every catalog product has a name starting with Clarity and no removed-product wording", () => {
    for (const p of products) {
      expect(p.name).toMatch(/^Clarity /);
      expect(JSON.stringify([p.name, p.descriptor, p.blurb, p.role, p.badge, p.step, p.benefits, p.howToUse, p.gallery?.map((g) => g.alt)])).not.toMatch(/Masque|Emulsion|Eye Treatment|Complex™|vegan|airless|cruelty/i);
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

  it("renders the description under the buy box and the accordions after it (brief order)", () => {
    const accordions = page.indexOf("<ProductAccordions");
    expect(page.indexOf("{p.blurb}")).toBeGreaterThan(page.indexOf("<PurchaseOptions"));
    expect(accordions).toBeGreaterThan(page.indexOf("{p.blurb}"));
  });

  it("long-form sections follow the brief order: benefits, how to use, ingredients, formulation, notes, related", () => {
    const order = [
      "<KeyBenefits",
      "<HowToUse",
      "<KeyIngredients",
      "<Formulation />",
      "<IngredientNotes",
      "<LaunchRoutinePosition",
    ].map((m) => page.indexOf(m));
    expect(order.every((i) => i > 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it("paired products on the regimen cards have an Add to bag button, not a link wrapping a button", () => {
    expect(page).toMatch(/<AddPairButton/);
    expect(page).toMatch(/Complete your regimen/);
  });
});
