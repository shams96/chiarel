import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import HomeRitual from "@/components/home/HomeRitual";
import { RoutineBand, eveningRoute, morningRoute } from "@/components/RoutineBand";
import { products } from "@/lib/products";

const home = renderToStaticMarkup(<HomeRitual />);
const unesc = (t: string) => t.replace(/&amp;/g, "&").replace(/&#x27;/g, "'");
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
    slug: products.find((p) => p.path === m[3])?.slug ?? m[3],
  }));

describe("home ritual bands", () => {
  it("keeps the section anchor and drops the optional preparation link", () => {
    expect(home).toContain('id="four-product-ritual"');
    expect(home).not.toContain("optional-preparation");
    expect(home).not.toMatch(/Cleanser|Cellular Mist|Lip Concentrate/);
  });

  it("morning and evening tile order match the real routes (Eye second in the evening)", () => {
    expect(tiles(band(home, "home-morning")).map((t) => t.slug)).toEqual(morningRoute);
    expect(tiles(band(home, "home-evening")).map((t) => t.slug)).toEqual([
      "chiarel-essence",
      "eye-contour-concentrate",
      "recovery-masque",
      "n1-neck-decollete",
    ]);
  });

  it("Essence leads both bands and the Neck & Décolleté Crème closes the evening band, by size", () => {
    expect(tiles(band(home, "home-morning")).map((t) => t.size)).toEqual(["lead", "standard"]);
    expect(tiles(band(home, "home-evening")).map((t) => t.size)).toEqual(["lead", "standard", "standard", "lead"]);
  });

  it("avoids superlative wording", () => {
    expect(home).not.toMatch(/(best|hero)/i);
  });

  it("Eye is a normal numbered evening step, not optional", () => {
    const pm = band(home, "home-evening");
    expect(pm).not.toContain("Optional");
    expect(pm).not.toContain("data-optional");
    expect(pm.match(/Step \d/g)).toHaveLength(4);
    expect(band(home, "home-morning").match(/Step \d/g)).toHaveLength(2);
  });

  it("evening is the cool light band and morning the warm one", () => {
    expect(band(home, "home-evening")).toContain("border-y border-ink/20 bg-cloud text-ink");
    expect(band(home, "home-morning")).toContain("bg-champagne/25");
  });

  it("every tile image has alt text and sits on the neutral frame", () => {
    expect(home).not.toMatch(/alt=""/);
    expect(home).toContain("background-color");
  });

  it("JSON-LD HowTo steps match the visible numbered steps", () => {
    const visible = (id: string) =>
      [...band(home, id).matchAll(/Step (\d)<\/span> ([^<]+)</g)].map((m) => [m[1], unesc(m[2]).trim()]);
    expect(visible("home-morning")).toEqual([
      ["1", "Clarity Essence"],
      ["2", "Clarity Day Crème"],
    ]);
    expect(visible("home-evening")).toEqual([
      ["1", "Clarity Essence"],
      ["2", "Clarity Eye Contour Concentrate"],
      ["3", "Clarity Night Crème"],
      ["4", "Clarity Neck & Décolleté Crème"],
    ]);
    const howTo = pageSrc.slice(pageSrc.indexOf("const amRitualHowTo"), pageSrc.indexOf("export default function Home"));
    const am = howTo.slice(0, howTo.indexOf("const pmRitualHowTo"));
    const pm = howTo.slice(howTo.indexOf("const pmRitualHowTo"));
    const names = (src: string) => [...src.matchAll(/name: "([^"]+)", text:/g)].map((m) => m[1]);
    expect(names(am)).toEqual(visible("home-morning").map(([, n]) => n));
    expect(names(pm)).toEqual(visible("home-evening").map(([, n]) => n));
  });
});

describe("full ritual band", () => {
  it("renders the evening route in order with the owner copy", () => {
    const full = renderToStaticMarkup(
      <RoutineBand
        id="evening"
        time="Evening"
        title="x"
        dark
        steps={[
          { n: 1, label: "Clarity Essence", slug: "chiarel-essence" },
          { n: 2, label: "Clarity Eye Contour Concentrate", slug: "eye-contour-concentrate", purpose: "For puffiness.", note: "Made for the evening, and it may be used morning or night." },
        ]}
        slugs={eveningRoute}
      />
    );
    expect(full).not.toContain("Optional");
    const heads = [...full.matchAll(/<h3[^>]*>([^<]+)</g)].map((m) => unesc(m[1]));
    expect(heads[0]).toBe("Clarity Essence");
    expect(heads[1]).toBe("Clarity Eye Contour Concentrate");
    expect(heads).toHaveLength(4);
    expect(full).toContain("Made for the evening, and it may be used morning or night.");
  });

  it("build-your-ritual treats Eye as a normal step, not an optional add-on", () => {
    const src = readFileSync("app/build-your-ritual/page.tsx", "utf8");
    expect(src).toContain('"eye-contour-concentrate"');
    expect(src).not.toMatch(/optional|Optional/);
  });
});
