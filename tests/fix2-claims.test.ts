import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Launch fixes round 2 (FIX2.md): claim removals on shop pages and the home
// page, plus the five product page data strings.
function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(tsx?|json)$/.test(name) && !/\.test\./.test(name)) out.push(full);
  }
  return out;
}
const read = (f: string) => readFileSync(f, "utf8");

const shopAndHome = [
  ...walk("app/shop"),
  ...walk("components/home"),
  "components/PurchaseOptions.tsx",
  "components/ProductAccordions.tsx",
  "components/CartDrawer.tsx",
  "app/page.tsx",
  "lib/skin-assessment.ts",
  "data/products.json",
];

describe("removed claims stay removed", () => {
  const banned: [string, RegExp][] = [
    ["Customer Tested", /customer[- ]tested|customer testing/i],
    ["category norm comparison", /category norm/i],
    ["reinforces", /reinforc/i],
    ["repairs", /\brepairs?\b/i],
    ["Every active ingredient disclosed", /every active ingredient disclosed/i],
    ["before-and-after photos", /subject-\d-(before|after)|ResultsSection/],
    ["retinol comparison", /alternative to retinol|harsher on sensiti[sz]ed/i],
    ["formulation record promise", /formulation record will be published/i],
  ];
  for (const [label, re] of banned) {
    it(`no "${label}" in app/shop, components/home or the PDP-facing files`, () => {
      const hits = shopAndHome.filter((f) => re.test(read(f)));
      expect(hits).toEqual([]);
    });
  }

  it("no PubMed search-results links in app/ or components/ (science pages are a separate workstream)", () => {
    const files = [...walk("app"), ...walk("components")].filter(
      (f) => !f.split("\\").join("/").startsWith("app/science/"),
    );
    const hits = files.filter((f) => /pubmed\.ncbi\.nlm\.nih\.gov\/\?term=/i.test(read(f)));
    expect(hits).toEqual([]);
  });
});

describe("PDP data strings match FIX2.md", () => {
  const catalog = JSON.parse(read("data/products.json")) as {
    slug: string;
    size: string;
    color: { name: string };
    actives?: { name: string }[];
    howToUse?: string[];
    descriptor: string;
  }[];
  const expected: Record<string, { size: RegExp; colour: string; ingredients: string[] }> = {
    "chiarel-essence": { size: /^40 ml\b/, colour: "Red Ochre", ingredients: ["Peptides", "Niacinamide", "Hyaluronic Acid"] },
    "terra-radiance-creme": { size: /^50 g\b/, colour: "Red Ochre", ingredients: ["Ceramides", "Cholesterol", "Squalane"] },
    "recovery-masque": { size: /^50 g\b/, colour: "Formal Garden", ingredients: ["Bakuchiol", "Peptides", "Niacinamide"] },
    "n1-neck-decollete": { size: /^40 ml\b/, colour: "Formal Garden", ingredients: ["Copper Peptide", "Ceramides", "Squalane"] },
    "eye-contour-concentrate": { size: /^40 ml\b/, colour: "Peach Dust", ingredients: ["Caffeine", "Peptides", "Hyaluronic Acid"] },
  };
  for (const [slug, want] of Object.entries(expected)) {
    it(`${slug}: size, glass colour and key ingredients`, () => {
      const p = catalog.find((c) => c.slug === slug)!;
      expect(p.size).toMatch(want.size);
      expect(p.color.name).toBe(want.colour);
      expect((p.actives ?? []).map((a) => a.name)).toEqual(want.ingredients);
    });
  }

  it("Day Crème says 'Follow with SPF.' and keeps its concern line", () => {
    const p = catalog.find((c) => c.slug === "terra-radiance-creme")!;
    expect(p.howToUse).toContain("Follow with SPF.");
    expect(p.descriptor.replace(/\.$/, "")).toBe("For dry skin under daily stress");
  });

  it("no ingredient percentages in product copy", () => {
    expect(JSON.stringify(catalog.map((c) => ({ ...c, ingredientsInci: undefined })))).not.toMatch(/\d\s?%/);
  });
});
