import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Owner decision: the site names key ingredients and (once confirmed) the full
// INCI list, but never publishes ingredient percentages or promises them.
function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(tsx?|json)$/.test(name) && !/\.test\./.test(name)) out.push(full);
  }
  return out;
}

const files = [...walk("app"), ...walk("components"), ...walk("lib"), "data/products.json"];

const NAMES = "(Palmitoyl|Acetyl|Bifida|Bioactive|Ceramide|Niacinamide|L-Ornithine|Panthenol|Ectoine)";

const FORBIDDEN: [string, RegExp][] = [
  ["percentage next to an ingredient name", new RegExp(`\\d+(\\.\\d+)?\\s?%\\s+(of\\s+)?${NAMES}`, "i")],
  ["ingredient name then percentage", new RegExp(`${NAMES}[A-Za-z0-9 ()-]{0,30}\\(?\\d+(\\.\\d+)?\\s?%`, "i")],
  ["clinically dosed wording", /clinically dosed/i],
  ["promise of exact percentages/concentrations", /(exact|its) (percentage|concentration)|actives and (their )?(exact )?(percentages|concentrations)|and percentages?\b/i],
  ["Palmitoyl Pentapeptide-4 is not in the v2 formulas", /Pentapeptide-4/],
  ["Bioactive Ferment Lysate is not the v2 INCI name", /Bioactive Ferment Lysate/],
];

describe("no ingredient percentages or percentage promises anywhere on the site", () => {
  for (const [label, re] of FORBIDDEN) {
    it(label, () => {
      const hits = files.filter((f) => re.test(readFileSync(f, "utf8")));
      expect(hits).toEqual([]);
    });
  }
});
