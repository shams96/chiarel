import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import HomeRitual from "@/components/home/HomeRitual";
import { RoutineBand, eveningRoute, morningRoute, EYE_LABEL } from "@/components/RoutineBand";
import { launchRitualProducts, getProduct } from "@/lib/products";

const home = renderToStaticMarkup(<HomeRitual />);
const pageSrc = readFileSync("app/page.tsx", "utf8");

function band(html: string, id: string) {
  const start = html.indexOf(`id="${id}"`);
  const end = html.indexOf("</section>", start);
  return html.slice(start, end);
}
const tiles = (html: string) =>
  [...html.matchAll(/<li data-size="(lead|standard)"([^>]*)>[\s\S]*?href="\/shop\/([a-z0-9-]+)"/g)].map((m) => ({
    size: m[1],
    optional: m[2].includes('data-optional="true"'),
    slug: m[3],
  }));

describe("home ritual bands", () => {
  it("keeps the section anchor and the optional preparation link", () => {
    expect(home).toContain('id="four-product-ritual"');
    expect(home).toContain('href="/ritual#optional-preparation"');
  });

  it("morning and evening tile order match the real routes (Eye between Masque and N1)", () => {
    expect(tiles(band(home, "home-morning")).map((t) => t.slug)).toEqual(morningRoute);
    expect(tiles(band(home, "home-evening")).map((t) => t.slug)).toEqual([
      "chiarel-essence",
      "recovery-masque",
      "eye-contour-concentrate",
      "n1-neck-decollete",
    ]);
  });

  it("Essence leads both bands and N1 closes the evening band, by size", () => {
    expect(tiles(band(home, "home-morning")).map((t) => t.size)).toEqual(["lead", "standard"]);
    expect(tiles(band(home, "home-evening")).map((t) => t.size)).toEqual(["lead", "standard", "standard", "lead"]);
  });

  it("keeps the existing badges and avoids superlative wording", () => {
    for (const label of ["Signature Serum", "Icon of the House", "Night Icon"]) {
      expect(home).toContain(label);
    }
    expect(home).not.toMatch(/\b(best|hero)\b/i);
  });

  it("Eye is optional, labelled, and not a numbered step", () => {
    const pm = band(home, "home-evening");
    expect(pm).toContain(EYE_LABEL);
    expect(pm.match(/Step \d/g)).toHaveLength(3);
    const steps = pm.slice(pm.indexOf("<ol"), pm.indexOf("</ol>"));
    expect(steps).not.toContain("Eye");
    expect(band(home, "home-morning")).not.toContain(EYE_LABEL);
  });

  it("evening is the cool light band and morning the warm one", () => {
    expect(band(home, "home-evening")).toContain("border-y border-ink/20 bg-cloud text-ink");
    expect(band(home, "home-morning")).toContain("bg-champagne/25");
  });

  it("every tile image has alt text and sits on the neutral frame", () => {
    expect(home).not.toMatch(/alt=""/);
    expect(home).toContain("background-color");
  });

  it("JSON-LD HowTo steps match the visible numbered steps and exclude Eye", () => {
    const visible = (id: string) =>
      [...band(home, id).matchAll(/Step (\d)<\/span> ([^<]+)</g)].map((m) => [m[1], m[2].replace(/&amp;/g, "&").trim()]);
    expect(visible("home-morning")).toEqual([
      ["1", "CHIAREL Essence™"],
      ["2", "Terra Radiance Crème™"],
    ]);
    expect(visible("home-evening")).toEqual([
      ["1", "CHIAREL Essence™"],
      ["2", "Recovery Masque™"],
      ["3", "N1 Neck & Décolleté Renewal Emulsion™"],
    ]);
    const howTo = pageSrc.slice(pageSrc.indexOf("const amRitualHowTo"), pageSrc.indexOf("export default function Home"));
    for (const [, name] of [...visible("home-morning"), ...visible("home-evening")]) {
      expect(howTo).toContain(`name: "${name}"`);
    }
    expect(howTo).not.toMatch(/Eye/);
  });
});

describe("eye contour stays optional", () => {
  it("is not a launchRitual product; full variant also places it between Masque and N1", () => {
    expect(launchRitualProducts.map((p) => p.slug)).not.toContain("eye-contour-concentrate");
    expect(getProduct("eye-contour-concentrate")?.launchStatus).toBe("launch");
    const full = renderToStaticMarkup(
      <RoutineBand id="evening" time="Evening" title="x" dark steps={[{ n: 1, label: "a" }]} slugs={eveningRoute} withEye />
    );
    expect(full).toContain(EYE_LABEL);
    const heads = [...full.matchAll(/<h3[^>]*>([^<]+)</g)].map((m) => m[1].replace(/&amp;/g, "&"));
    expect(heads).toEqual([
      "CHIAREL Essence™",
      "Recovery Masque™",
      "CHIAREL Eye Contour Concentrate™",
      "N1 Neck & Décolleté Renewal Emulsion™",
    ]);
  });

  it("build-your-ritual offers Eye as unselected-by-default optional", () => {
    const src = readFileSync("app/build-your-ritual/page.tsx", "utf8");
    expect(src).toContain('getProduct("eye-contour-concentrate")');
    expect(src).toContain("!optionalSlugs.has(p.slug)");
  });
});
