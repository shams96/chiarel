import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { products } from "@/lib/products";
import {
  FREE_FROM_CATEGORIES,
  FREE_FROM_SENTENCE,
  LAUNCH_FORMULA_SLUGS,
  formulationLine,
} from "@/lib/formulation-line";

// Checked against the v2 draft INCI lists (CHIAREL_Launch_Formulas_v2_Natural_You.xlsx,
// tab "INCI Order (draft)", 1A / 2A / N1 / 4A / 7A) on 2026-10-16. Every category
// below is ABSENT from all five lists, so a "formulated without" claim may name it.
// Not claimed: "colorants" (7A contains Mica, CI 77019) or "alcohol-free" (all
// creams contain Cetearyl Alcohol, a fatty alcohol, not denatured alcohol).
// Caveat: "Parfum (CHIAREL accord)" is in every list and its composition is not
// in the workbook; the supplier declaration is still pending.
const VERIFIED_ABSENT: Record<string, RegExp> = {
  parabens: /paraben/i,
  sulfates: /sulfate|sulphate/i,
  "mineral oil": /mineral oil|paraffinum|petrolatum|petroleum/i,
  silicones: /silicone|dimethicone|siloxane|cyclomethicone/i,
  "denatured alcohol": /alcohol denat/i,
  "PEG compounds": /\bpeg-|\bppg-|polyethylene glycol/i,
};

// INCI lists copied from the v2 draft tab (order and names as in the workbook).
const V2_DRAFT_INCI: Record<string, string[]> = {
  "1A": ["Aqua", "Glycerin", "Niacinamide", "Acetyl Hexapeptide-8", "Propanediol", "Pentylene Glycol", "Palmitoyl Tripeptide-1", "Palmitoyl Tetrapeptide-7", "Panthenol", "Hydrolyzed Collagen", "Phenoxyethanol (and) Ethylhexylglycerin", "Sodium PCA", "Bifida Ferment Lysate", "Sodium Hyaluronate (high MW)", "Decapeptide-52", "Sodium Hyaluronate (low MW)", "Beta-Glucan", "Disodium EDTA", "Sodium Citrate", "Xanthan Gum", "Citric Acid", "Parfum (CHIAREL accord)"],
  "2A": ["Aqua", "Squalane", "Glycerin", "Niacinamide", "Caprylic/Capric Triglyceride", "Cetearyl Alcohol", "Simmondsia Chinensis Seed Oil", "Panthenol", "Glyceryl Stearate SE", "Butyrospermum Parkii Butter", "Ascorbyl Glucoside", "Cetyl Palmitate", "Ceramide NP", "Phenoxyethanol (and) Ethylhexylglycerin", "Cholesterol", "Phytosphingosine", "Copper Tripeptide-1", "Lecithin", "Tocopherol", "Ceramide AP", "Ceramide EOP", "Bifida Ferment Lysate", "Sodium Hyaluronate", "Alpha-Glucan Oligosaccharide", "Sclerotium Gum", "Xanthan Gum", "Sh-Oligopeptide-1", "Sodium Citrate", "Citric Acid", "Palmitoyl Tripeptide-38", "Parfum (CHIAREL accord)"],
  N1: ["Aqua", "Squalane", "Glycerin", "Niacinamide", "Caprylic/Capric Triglyceride", "Cetearyl Alcohol", "Simmondsia Chinensis Seed Oil", "Panthenol", "Glyceryl Stearate SE", "Butyrospermum Parkii Butter", "Ascorbyl Glucoside", "Cetyl Palmitate", "Ceramide NP", "Phenoxyethanol (and) Ethylhexylglycerin", "Alpha-Glucan Oligosaccharide", "Cholesterol", "Phytosphingosine", "Copper Tripeptide-1", "Lecithin", "Tocopherol", "Ceramide AP", "Ceramide EOP", "Bifida Ferment Lysate", "Sodium Hyaluronate", "Sclerotium Gum", "Xanthan Gum", "Sh-Oligopeptide-1", "Sodium Citrate", "Citric Acid", "Palmitoyl Tripeptide-38", "Parfum (CHIAREL accord)"],
  "4A": ["Aqua", "Glycerin", "Niacinamide", "Squalane", "Simmondsia Chinensis Seed Oil", "Caprylic/Capric Triglyceride", "Palmitoyl Tetrapeptide-7", "Aloe Barbadensis Leaf Juice", "Bakuchiol", "Acetyl Hexapeptide-8", "Palmitoyl Tripeptide-38", "Propanediol", "Ornithine", "Cetearyl Alcohol", "Glyceryl Stearate SE", "Palmitoyl Tripeptide-1", "Copper Tripeptide-1", "Panthenol", "Cetyl Palmitate", "Phenoxyethanol (and) Ethylhexylglycerin", "Nicotinamide Mononucleotide", "Adenosine", "Lecithin", "Tocopherol", "Decapeptide-52", "Sodium Hyaluronate (high MW)", "Sclerotium Gum", "Ceramide NP", "Sodium Hyaluronate (low MW)", "Cholesterol", "Xanthan Gum", "Disodium EDTA", "Sodium Citrate", "Citric Acid", "Parfum (CHIAREL accord)"],
  "7A": ["Aqua", "Glycerin", "Niacinamide", "Propanediol", "Caffeine", "Acetyl Tetrapeptide-5", "Palmitoyl Tetrapeptide-7", "Dipeptide-2", "Panthenol", "Mica (CI 77019)", "Palmitoyl Tripeptide-1", "Phenoxyethanol (and) Ethylhexylglycerin", "Sodium PCA", "Phytonadione", "Boron Nitride", "Sodium Hyaluronate (high MW)", "Sodium Hyaluronate (low MW)", "Bisabolol", "Sodium Hyaluronate", "Bifida Ferment Lysate", "Xanthan Gum", "Sodium Citrate", "Disodium EDTA", "Citric Acid", "Parfum (CHIAREL accord)"],
};

describe("free-from claim", () => {
  it("every category absent from all five v2 draft INCI lists", () => {
    for (const [sku, list] of Object.entries(V2_DRAFT_INCI)) {
      for (const [category, re] of Object.entries(VERIFIED_ABSENT)) {
        const hit = list.find((i) => re.test(i));
        expect(hit, `${sku} contains ${category}: ${hit}`).toBeUndefined();
      }
    }
  });

  it("the site's draft INCI data matches the workbook-derived lists", () => {
    const bySku: Record<string, string> = { "1A": "chiarel-essence", "2A": "terra-radiance-creme", N1: "n1-neck-decollete", "4A": "recovery-masque", "7A": "eye-contour-concentrate" };
    for (const [sku, slug] of Object.entries(bySku)) {
      const p = products.find((x) => x.slug === slug)!;
      expect(p.ingredientsInci, sku).toEqual(V2_DRAFT_INCI[sku]);
    }
  });

  it("the sentence names only verified-absent categories, scoped to the five launch formulas", () => {
    const named = FREE_FROM_CATEGORIES.map((c) => c.toLowerCase());
    for (const c of named) expect(Object.keys(VERIFIED_ABSENT)).toContain(c);
    for (const c of named) expect(FREE_FROM_SENTENCE).toContain(c);
    expect(FREE_FROM_SENTENCE).toContain("five launch formulas");
    expect(FREE_FROM_SENTENCE).not.toMatch(/cleanser|mist|colou?rant|alcohol-free/i);
    expect(LAUNCH_FORMULA_SLUGS).toHaveLength(5);
  });

  it("'listed in full' wording only when INCI lists are published", () => {
    const anyFinal = products.some((p) => p.ingredientsInciStatus === "final");
    expect(formulationLine().includes("listed in full")).toBe(anyFinal);
    expect(formulationLine().startsWith("Formulation first. Every ingredient has a job.")).toBe(true);
  });
});

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(tsx?|json)$/.test(name) && !/\.test\.tsx?$/.test(name)) out.push(full);
  }
  return out;
}

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(?<![:\w"'`])\/\/.*$/gm, "");
}

describe("footer", () => {
  it("is deliberately untouched by the Eye rename / free-from change (owner instruction)", () => {
    const footer = readFileSync("components/Footer.tsx", "utf8");
    expect(footer).not.toContain("Eye Treatment");
    expect(footer).not.toContain(FREE_FROM_SENTENCE);
  });
});

describe("banned words", () => {
  const banned = /\b(pure|clean|chemical-free|natural-only|unlike other brands|no manipulation)\b/i;

  it("none appear in site source (comments excluded)", () => {
    const offenders: string[] = [];
    for (const dir of ["app", "components", "lib", "data"]) {
      for (const file of walk(dir)) {
        const m = stripComments(readFileSync(file, "utf8")).match(banned);
        if (m) offenders.push(`${file}: ${m[0]}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("the product copy never says plain 'Ornithine' to customers", () => {
    for (const p of products) {
      const copy = JSON.stringify({ ...p, ingredientsInci: undefined });
      expect(copy, p.slug).not.toMatch(/(?<!L-)\bOrnithine\b/);
    }
  });
});
