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
    const rows = [...html.matchAll(/<span data-w="([^"]+)"><\/span>/g)].map((m) => m[1]);
    expect(rows).toHaveLength(6);
    expect(rows.slice(0, 5).every((r) => r === "Clarity")).toBe(true);
    expect(rows[5]).toBe("Clarity™");
    // the words are generated content, not text nodes: nothing for crawlers or contrast checkers to read
    expect(html.replace(/<[^>]+>/g, "").trim()).toBe("");
    expect(src("app/globals.css")).toContain(".ladder > span::before { content: attr(data-w); }");
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
    expect(html.replace(/<[^>]+>/g, "")).toContain("Advancing Cellular Clarity™.");
    expect(html).toContain('href="/ritual"');
    expect(text(html)).toContain("Begin the Ritual");
    expect(text(html)).toMatch(/From \$[\d.]+ a day/);
    expect(text(html)).toContain("every 45 days with subscription");
  });
  it("sets the h1 as a three-word poster (big / small / big) on the column grid, with no ladder", () => {
    expect(html).toMatch(/<h1 class="poster font-serif"><span class="poster-a">Advancing<\/span> <span class="poster-b">Cellular<\/span> <span class="poster-c">Clarity<span class="poster-tm">™<\/span>\.<\/span><\/h1>/);
    expect(html).not.toContain("ladder-wrap");
    const css = src("app/globals.css");
    expect(css).toMatch(/\.poster \{[^}]*container-type: inline-size/);
    expect(css).toMatch(/\.poster \{[^}]*background-size: calc\(100% \/ 6\) 100%/);
    expect(css).toMatch(/\.poster-b \{[^}]*margin-left: auto/);
  });
  it("keeps the scale contrast of the poster: the small word is at most 40% of the big ones", () => {
    const css = src("app/globals.css");
    const size = (k: string) => Number(css.match(new RegExp(String.raw`\.poster-${k} \{ font-size: ([\d.]+)cqw`))?.[1]);
    expect(size("a")).toBeGreaterThan(0);
    expect(size("b")).toBeGreaterThan(0);
    expect(size("b") / size("a")).toBeLessThanOrEqual(0.4);
    expect(size("b") / size("c")).toBeLessThanOrEqual(0.4);
  });
  it("makes the photo the hero: a half-width frame on a deepened Red Ochre block, the jar on a mirror", () => {
    expect(html).toContain("bg-ochre");
    expect(html).toContain("lg:col-span-6 lg:col-start-7");
    expect(html).toContain("linear-gradient(155deg");
    expect(html).toContain('fetchPriority="high"');
    expect(html).toContain("clarity-essence-mirror-scene-960.jpg");
    expect(html).toContain("standing on a mirror");
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
    expect(html).toContain("Advancing Cellular Clarity™ </span><span>against Modern Biological Stress™.");
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
    // the space between lines is real markup, so assistive tech and crawlers read "Notes from the House"
    expect(html).toContain("Notes from </span><span>the House");
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
  it("puts a vertical thumbnail rail on the left from lg and below the image at md, with the rail first in the DOM", () => {
    expect(g).toContain("flex flex-col lg:grid lg:grid-cols-[5rem_1fr]");
    expect(g).toContain("order-2 mt-3 hidden gap-2");
    expect(g).toContain("lg:order-none");
    expect(g).toContain("lg:flex-col");
    // keyboard and screen-reader order: the thumbnail buttons come before the image frame
    expect(g.indexOf("View image ${i + 1} of ${images.length}")).toBeGreaterThan(-1);
    expect(g.indexOf("View image ${i + 1} of ${images.length}")).toBeLessThan(g.indexOf("relative order-1 aspect-[5/4]"));
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

describe("Primary buttons meet the 44px tap-target contract (found by the page matrix)", () => {
  it.each([
    ["app/shop/page.tsx", "Discover the Crème"],
    ["components/StickyPurchaseBar.tsx", "Add to Bag"],
    ["app/build-your-ritual/page.tsx", "Add to Bag"],
    ["components/home/HomeClosing.tsx", "Begin the Ritual"],
  ])("%s: the %s control is at least 44px tall", (file, label) => {
    const s = src(file);
    const at = s.indexOf(label);
    expect(at, label).toBeGreaterThan(-1);
    // the opening tag that precedes the label carries the minimum height
    const open = s.lastIndexOf("className=", at);
    expect(s.slice(open, at)).toContain("min-h-[44px]");
  });
});

describe("Day Crème studio scene (replaced the terracotta scene as the shared hero image)", () => {
  const NEW = "/assets/products/clarity-day-creme-studio-scene.jpg";
  const OLD = "/assets/products/clarity-day-creme-ribbon-scene-v2.jpg";
  const products = JSON.parse(src("data/products.json")) as { path: string; studio?: string; gallery?: { src: string; alt: string }[] }[];
  const list = Array.isArray(products) ? products : (products as unknown as { products: typeof products }).products;
  const day = list.find((p) => p.path === "clarity-day-creme");
  it("is the product's studio image and its first gallery image; the terracotta scene stays as a later gallery image", () => {
    expect(day?.studio).toBe(NEW);
    expect(day?.gallery?.[0].src).toBe(NEW);
    expect(day?.gallery?.map((g) => g.src)).toContain(OLD);
    expect(existsSync("public" + NEW)).toBe(true);
    expect(existsSync("public" + NEW.replace(".jpg", "-640.jpg"))).toBe(true);
  });
  it("is used by the home tiles, and the old scene is no longer hard-coded in any component", () => {
    expect(src("components/home/HomeFaceBeyond.tsx")).toContain(NEW);
    expect(src("components/home/HomeFitGuidance.tsx")).toContain(NEW);
    for (const f of ["components/home/HomeFaceBeyond.tsx", "components/home/HomeFitGuidance.tsx", "components/home/HomeClosing.tsx", "components/RoutineBand.tsx"]) {
      expect(src(f), f).not.toContain(OLD);
    }
  });
  it("has descriptive alt text that implies no results", () => {
    expect(day?.gallery?.[0].alt).toMatch(/jar on a pale plinth in a soft peach studio/);
    expect(day?.gallery?.[0].alt).not.toMatch(/before|after|results|younger|wrinkle/i);
  });
});

describe("Outlined display type has a visible stroke (regression: it was transparent)", () => {
  const css = src("app/globals.css");
  it(".out sets its own stroke colour and does not fall back to currentColor (the fill is transparent)", () => {
    const rule = css.match(/\.out \{[^}]*\}/)?.[0] ?? "";
    expect(rule).toContain("-webkit-text-stroke: 1px var(--out-stroke, rgb(28 26 23))");
    expect(rule).not.toMatch(/currentColor/i);
  });
  it("the ladder keeps an opaque text colour and paints its faint fill with text-fill-color", () => {
    const rule = css.match(/\.ladder > span \{[^}]*\}/)?.[0] ?? "";
    expect(rule).toContain("color: rgb(28 26 23);");
    expect(rule).toContain("-webkit-text-fill-color: rgb(28 26 23 / var(--fill))");
  });
  it("the ladder hard-codes an opaque ink stroke", () => {
    expect(css).toMatch(/\.ladder > span \{[^}]*-webkit-text-stroke: 1px rgb\(28 26 23\)/);
  });
  it("light-on-ochre outline type overrides the stroke colour", () => {
    expect(src("components/home/HomeItaly.tsx")).toContain("[--out-stroke:#F8F6F1]");
  });
  it("every outlined element is decorative: an aria-hidden ancestor within a few lines", () => {
    for (const f of ["components/RoutineBand.tsx", "components/home/HomeItaly.tsx"]) {
      const s2 = src(f);
      const at = s2.search(/className="[^"]*\bout\b/);
      expect(at, f).toBeGreaterThan(-1);
      expect(s2.slice(Math.max(0, at - 260), at + 40), f).toContain('aria-hidden="true"');
    }
  });
});

describe("Closed panels, landmarks and the intro overlay", () => {
  it("labels the header navigation landmarks", () => {
    const h = src("components/Header.tsx");
    expect(h).toContain('aria-label="Primary"');
    expect(h).toContain('aria-label="Menu" className="flex flex-1 flex-col');
  });
  it("the intro overlay is a modal dialog only while it plays", () => {
    const i = src("components/HeroIntro.tsx");
    expect(i).toContain('role={showContent ? "dialog" : undefined}');
    expect(i).toContain("aria-hidden={showContent ? undefined : true}");
  });
});

describe("Grid guides gating", () => {
  it("is available only with ?grid, and ignores key repeat, composition and ARIA text widgets", async () => {
    const { gridEnabled } = await import("@/components/GridGuides");
    expect(gridEnabled("?grid")).toBe(true);
    expect(gridEnabled("?x=1&grid=1")).toBe(true);
    expect(gridEnabled("")).toBe(false);
    expect(gridEnabled("?other")).toBe(false);
    expect(isGridToggle({ key: "g", repeat: true })).toBe(false);
    expect(isGridToggle({ key: "g", isComposing: true })).toBe(false);
    expect(isGridToggle({ key: "g", target: { tagName: "DIV", getAttribute: () => "combobox" } })).toBe(false);
    expect(isGridToggle({ key: "g", target: { tagName: "DIV", getAttribute: () => null } })).toBe(true);
    expect(src("components/GridGuides.tsx")).toContain("if (!gridEnabled(window.location.search)) return;");
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
    expect(cfg).not.toContain("      numeral:");
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
