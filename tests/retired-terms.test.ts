import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { products } from "@/lib/products";

// Retired by the owner (CHIAREL Intelligence, 2026-11-19) or removed from the
// formulas in CHIAREL_Launch_Formulas_v4_Natural_You.xlsx (Oct 30, 2026).
// Not listed on purpose: Advancing Cellular Clarity, Modern Biological Stress and
// the Complex names (still awaiting an owner decision).
const RETIRED_COPY = /House of Skin Intelligence|Skin Intelligence|CHIAREL Intelligence|copper (tri)?peptide|oligopeptide-1|\bEGF\b|decapeptide|\bNMN\b|mononucleotide|ornithine|phytonadione|vitamin K|CHIAREL accord|adiponectin|PPAR-gamma|ascorbyl glucoside|fragrance-free/i;
const REMOVED_INCI = /copper tripeptide|oligopeptide-1|decapeptide|mononucleotide|ornithine|phytonadione|parfum|ascorbyl glucoside/i;

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(tsx?|json)$/.test(name) && !/\.test\.tsx?$/.test(name)) out.push(full);
  }
  return out;
}
const strip = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(?<![:\w"'`])\/\/.*$/gm, "");

describe("retired terms", () => {
  it("no retired brand or ingredient wording in served source (comments excluded)", () => {
    const offenders: string[] = [];
    for (const dir of ["app", "components", "lib", "data"]) {
      for (const file of walk(dir)) {
        const m = strip(readFileSync(file, "utf8")).match(RETIRED_COPY);
        if (m) offenders.push(`${file}: ${m[0]}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("no product INCI list contains an ingredient removed in v4", () => {
    for (const p of products) {
      const hit = (p.ingredientsInci ?? []).find((i) => REMOVED_INCI.test(i));
      expect(hit, `${p.slug}: ${hit}`).toBeUndefined();
    }
  });

  it("every launch formula lists Rosa Damascena Flower Water in place of Parfum", () => {
    for (const p of products.filter((x) => x.ingredientsInci?.length)) {
      expect(p.ingredientsInci, p.slug).toContain("Rosa Damascena Flower Water");
    }
  });

  it("the removed L-Ornithine page stays removed and redirects", () => {
    const cfg = readFileSync("next.config.mjs", "utf8");
    expect(cfg).toMatch(/source: "\/science\/l-ornithine", destination: "\/science"/);
  });
});
