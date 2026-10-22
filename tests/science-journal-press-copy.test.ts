import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Launch fixes round 2, workstream R: science, journal and press copy.
function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(tsx?|mjs|txt)$/.test(name) && !/\.test\./.test(name)) out.push(full);
  }
  return out;
}

const copyFiles = [
  ...walk("app/science"),
  ...walk("app/journal"),
  "app/press/page.tsx",
];
const read = (f: string) => readFileSync(f, "utf8");

describe("How CHIAREL Compares page is down", () => {
  it("has no comparison route and no link to it anywhere in app, components or lib", () => {
    expect(existsSync("app/science/comparison")).toBe(false);
    for (const f of [...walk("app"), ...walk("components"), ...walk("lib")]) {
      const src = read(f);
      expect(src, f).not.toMatch(/["'`]\/science\/comparison/);
      expect(src, f).not.toMatch(/How CHIAREL Compares/);
    }
  });

  it("redirects the old address to /science", () => {
    expect(read("next.config.mjs")).toMatch(
      /source:\s*"\/science\/comparison",\s*destination:\s*"\/science",\s*permanent:\s*true/,
    );
  });
});

describe("science, journal and press copy", () => {
  it("links to no PubMed search pages", () => {
    for (const f of copyFiles) expect(read(f), f).not.toMatch(/pubmed\.ncbi\.nlm\.nih\.gov/i);
  });

  it("uses no retired family names or removed claims", () => {
    for (const f of copyFiles) {
      const src = read(f);
      expect(src, f).not.toMatch(/CHIAREL (Rose|Verde)/);
      expect(src, f).not.toMatch(/never discontinued/i);
      expect(src, f).not.toMatch(/ectoine?/i);
      expect(src, f).not.toMatch(/\b(reinforces?|strengthens?)\b/i);
      expect(src, f).not.toMatch(/marine|fish collagen/i);
    }
  });

  it("press page has no Also Available section", () => {
    const src = read("app/press/page.tsx");
    expect(src).not.toMatch(/Also Available/);
    expect(src).not.toMatch(/otherSkus/);
  });
});

describe("ritual order", () => {
  it("states the five-product morning and evening order", () => {
    const guide = read("app/journal/chiarel-ritual-guide/page.tsx");
    const app = read("app/science/application/page.tsx");
    for (const src of [guide, app]) {
      expect(src).toMatch(/Clarity Day Crème/);
      expect(src).toMatch(/SPF/);
      expect(src).toMatch(/Clarity Eye Contour Concentrate/);
      expect(src).toMatch(/Clarity Neck (&|&amp;) Décolleté Crème/);
      expect(src).toMatch(/morning or\s+night/);
    }
  });

  it("lists exactly the four Bifida products and Night Crème only for L-Ornithine", () => {
    const bifida = read("app/science/bifida-ferment-lysate/page.tsx");
    expect(bifida).toMatch(/not in Clarity Night Crème/);
    const orn = read("app/science/l-ornithine/page.tsx");
    expect(orn).toMatch(/Clarity Night Crème only/);
  });
});
