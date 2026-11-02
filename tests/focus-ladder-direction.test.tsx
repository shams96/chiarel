import { existsSync, readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import FocusLadder from "@/components/layout/FocusLadder";
import PageHead from "@/components/layout/PageHead";
import HomeHero from "@/components/home/HomeHero";
import HomeIntro from "@/components/home/HomeIntro";
import { isGridToggle } from "@/components/GridGuides";

const src = (p: string) => readFileSync(p, "utf8");
const text = (html: string) =>
  html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").replace(/&amp;/g, "&").replace(/&#x27;/g, "'").trim();

describe("Focus Ladder component", () => {
  const html = renderToStaticMarkup(<FocusLadder />);
  it("is decorative: aria-hidden, no heading, six rows ending in the trademarked word", () => {
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toMatch(/<h[1-6]/);
    const rows = [...html.matchAll(/<span>([^<]+)<\/span>/g)].map((m) => m[1]);
    expect(rows).toHaveLength(6);
    expect(rows.slice(0, 5).every((r) => r === "Clarity")).toBe(true);
    expect(rows[5]).toBe("Clarity™");
  });
  it("styles the six rows with falling sizes and rising fill, and stops the motion for reduced-motion", () => {
    const css = src("app/globals.css");
    const rows = [...css.matchAll(/\.ladder > span:nth-child\((\d)\) \{ --s: ([\d.]+)cqw;\s+--fill: (\d+)%/g)].map((m) => [
      Number(m[1]),
      Number(m[2]),
      Number(m[3]),
    ]);
    expect(rows).toHaveLength(6);
    for (let i = 1; i < 6; i++) {
      expect(rows[i][1]).toBeLessThan(rows[i - 1][1]);
      expect(rows[i][2]).toBeGreaterThan(rows[i - 1][2]);
    }
    expect(rows[5][2]).toBe(100);
    expect(css).toMatch(/prefers-reduced-motion: reduce\) \{\s*\.ladder > span \{ animation: none; \}/);
  });
});

describe("Hero", () => {
  const html = renderToStaticMarkup(<HomeHero />);
  it("keeps one h1 with the mission line, the single primary action and the price line", () => {
    expect([...html.matchAll(/<h1/g)]).toHaveLength(1);
    expect(text(html)).toContain("Advancing Cellular Clarity™.");
    expect(html).toContain('href="/ritual"');
    expect(text(html)).toContain("Begin the Ritual");
    expect(text(html)).toMatch(/From \$[\d.]+ a day/);
    expect(text(html)).toContain("every 45 days with subscription");
  });
  it("sets the ladder before the h1 and puts the photo on an ochre block with a priority image", () => {
    expect(html.indexOf("ladder-wrap")).toBeLessThan(html.indexOf("<h1"));
    expect(html).toContain("bg-ochre");
    expect(html).toContain('fetchPriority="high"');
    expect(html).toContain("clarity-essence-festive-scene-v2-960.jpg");
  });
  it("does not use the previous full-bleed ochre text panel", () => {
    expect(src("components/home/HomeHero.tsx")).not.toContain("bg-ochre px-margin");
  });
});

describe("Statement", () => {
  const html = renderToStaticMarkup(<HomeIntro />);
  it("keeps the approved sentence whole while splitting it into staggered lines", () => {
    expect(text(html)).toContain("Advancing Cellular Clarity™ against Modern Biological Stress™.");
    expect(html).toContain("stagger");
    expect([...html.matchAll(/<h2/g)]).toHaveLength(1);
  });
});

describe("Page heads", () => {
  it("renders an eyebrow, one h1 whose lines read as one sentence, and an optional intro", () => {
    const html = renderToStaticMarkup(
      <PageHead eyebrow="The Journal" lines={["Notes from", "the House"]}>
        <p>Intro</p>
      </PageHead>,
    );
    expect([...html.matchAll(/<h1/g)]).toHaveLength(1);
    expect(text(html.slice(html.indexOf("<h1"), html.indexOf("</h1>")))).toBe("Notes from the House");
    expect(text(html)).toContain("The Journal");
    expect(text(html)).toContain("Intro");
  });
  it.each([
    ["app/science/page.tsx", '["The Science"]'],
    ["app/journal/page.tsx", '["Notes from", "the House"]'],
    ["app/house/page.tsx", '["The House"]'],
    ["app/press/page.tsx", '["CHIAREL™", "Press Kit"]'],
    ["app/shop/page.tsx", '["Shop"]'],
    ["app/build-your-ritual/page.tsx", '["Build Your", "Ritual"]'],
  ])("%s uses the page head and keeps no second h1", (file, lines) => {
    const s = src(file);
    expect(s).toContain("<PageHead");
    expect(s).toContain(lines);
    expect(s).not.toMatch(/<h1\b/);
  });
});

describe("Ritual numerals, ochre field and specification sheet", () => {
  it("renders the ritual numerals as decorative outline display type", () => {
    const s = src("components/RoutineBand.tsx");
    expect(s).toContain('aria-hidden="true" className="mb-4 flex items-end gap-3 text-ink"');
    expect(s).toContain('className="out font-serif text-numeral-sm"');
  });
  it("has one full Red Ochre section on the homepage: Made in Italy, with decorative vertical type", () => {
    const italy = src("components/home/HomeItaly.tsx");
    expect(italy).toContain('className="bg-ochre text-ivory"');
    expect(italy).toMatch(/aria-hidden="true"\s+className="vert-word out/);
    expect(src("components/home/HomeClosing.tsx")).not.toMatch(/<section[^>]*bg-ochre/);
    for (const f of ["HomeFaceBeyond", "HomeIconProduct", "HomeFitGuidance", "HomeFormulationRecord", "HomeFormulator", "HomeObservations", "HomeProof"]) {
      expect(src(`components/home/${f}.tsx`), f).not.toMatch(/<section[^>]*\bbg-ochre\b/);
    }
  });
  it("shows the PDP facts as a ruled specification sheet with the same three facts", () => {
    const s = src("app/shop/[slug]/page.tsx");
    expect(s).toContain("Specification sheet");
    for (const label of ["Step", "Size", "Glass colour"]) expect(s).toMatch(new RegExp(`>${label}</dt>`));
    expect(s).toContain("{p.step}");
    expect(s).toContain("{p.size}");
    expect(s).toContain("{p.color.name}");
  });
});

describe("Gallery rail (image treatment D)", () => {
  const g = src("components/ProductGallery.tsx");
  it("puts a vertical thumbnail rail on the left from lg, below the image at md", () => {
    expect(g).toContain("lg:grid lg:grid-cols-[5rem_1fr]");
    expect(g).toContain("lg:order-first");
    expect(g).toContain("lg:flex-col");
  });
  it("uses one 4:5 module for every thumbnail and an ink border on the active frame", () => {
    expect(g).toContain("aspect-[4/5] w-14 flex-none");
    expect(g).toContain('i === active ? "border-ink"');
    expect(g).not.toContain('"border-ochre"');
  });
  it("keeps the phone swipe track with 44px dots, and the thumbnail buttons stay labelled", () => {
    expect(g).toContain("h-11 w-11");
    expect(g).toContain("View image ${i + 1} of ${images.length}");
  });
  it("the Eye Contour, Neck and Essence galleries include the generated views, each with its responsive copies", () => {
    const products = JSON.parse(src("data/products.json")) as { path: string; gallery?: { src: string }[] }[];
    const list = Array.isArray(products) ? products : (products as unknown as { products: typeof products }).products;
    const want: Record<string, string[]> = {
      "clarity-eye-contour-concentrate": ["clarity-eye-contour-concentrate-studio.jpg", "clarity-eye-contour-concentrate-detail.jpg"],
      "clarity-neck-decollete-creme": ["clarity-neck-decollete-creme-studio.jpg"],
      "clarity-essence": ["clarity-essence-detail.jpg"],
    };
    for (const [path, files] of Object.entries(want)) {
      const g = list.find((p) => p.path === path)?.gallery?.map((i) => i.src) ?? [];
      for (const f of files) {
        expect(g, `${path} gallery`).toContain(`/assets/products/${f}`);
        expect(existsSync(`public/assets/products/${f.replace(".jpg", "-640.jpg")}`), f).toBe(true);
      }
    }
    expect(list.find((p) => p.path === "clarity-eye-contour-concentrate")?.gallery?.length).toBeGreaterThanOrEqual(4);
  });
  it("every product ships a gallery of two or more published photographs that exist on disk", () => {
    const products = JSON.parse(src("data/products.json")) as { path: string; gallery?: { src: string }[] }[];
    const list = Array.isArray(products) ? products : (products as unknown as { products: typeof products }).products;
    for (const p of list) {
      expect(p.gallery?.length ?? 0, p.path).toBeGreaterThanOrEqual(2);
      for (const img of p.gallery ?? []) expect(existsSync(`public${img.src}`), img.src).toBe(true);
    }
  });
});

describe("Grid guides", () => {
  it("toggles on a bare G, ignores modified keys and form fields", () => {
    expect(isGridToggle({ key: "g" })).toBe(true);
    expect(isGridToggle({ key: "G" })).toBe(true);
    expect(isGridToggle({ key: "g", ctrlKey: true })).toBe(false);
    expect(isGridToggle({ key: "g", metaKey: true })).toBe(false);
    expect(isGridToggle({ key: "x" })).toBe(false);
    expect(isGridToggle({ key: "g", target: { tagName: "INPUT" } })).toBe(false);
    expect(isGridToggle({ key: "g", target: { tagName: "TEXTAREA" } })).toBe(false);
    expect(isGridToggle({ key: "g", target: { tagName: "DIV", isContentEditable: true } })).toBe(false);
    expect(isGridToggle({ key: "g", target: { tagName: "BODY" } })).toBe(true);
  });
  it("is hidden until toggled, decorative and mounted in the root layout", () => {
    const s = src("components/GridGuides.tsx");
    expect(s).toContain("if (!on) return null;");
    expect(s).toContain('aria-hidden="true"');
    expect(src("app/layout.tsx")).toContain("<GridGuides />");
    expect(src("app/globals.css")).toMatch(/\.grid-guides \{[^}]*pointer-events: none/);
  });
});

describe("Type rules for the new direction", () => {
  it("defines the poster-scale and numeral tokens", () => {
    const cfg = src("tailwind.config.ts");
    expect(cfg).toContain("mega:");
    expect(cfg).toContain("numeral:");
    expect(cfg).toContain('"numeral-sm":');
  });
  it("keeps the 12px floor in every new or rewritten file", () => {
    for (const f of [
      "components/layout/FocusLadder.tsx",
      "components/layout/PageHead.tsx",
      "components/GridGuides.tsx",
      "components/home/HomeHero.tsx",
      "components/home/HomeIntro.tsx",
      "components/home/HomeItaly.tsx",
    ]) {
      expect(src(f), f).not.toMatch(/text-\[(8|9|10|11)px\]/);
    }
  });
  it("only outlines display-size type (48px and above)", () => {
    expect(src("components/RoutineBand.tsx")).toContain("text-numeral-sm");
    expect(src("components/home/HomeItaly.tsx")).toContain("clamp(3.25rem");
    expect(src("tailwind.config.ts")).toMatch(/"numeral-sm": \["clamp\(3\.5rem/);
  });
});
