// Shop Phase 1 (claudedocs/specs/store-enhancement/SPEC-AND-PLAN.md): /shop surfaces the guided
// paths and a service strip using existing pages only, with no new claim, price or offer.
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (p: string) => readFileSync(p, "utf8");
const shop = read("app/shop/page.tsx");
const band = read("components/shop/FindYourRitual.tsx");
const strip = read("components/shop/ShopServiceStrip.tsx");

const hrefs = (src: string) => [...src.matchAll(/href[:=]\s*"([^"#]+)/g)].map((m) => m[1]);

describe("/shop storefront shell", () => {
  it("renders breadcrumb, the Find Your Ritual band above the grids, and the service strip last", () => {
    expect(shop).toContain('aria-label="Breadcrumb"');
    const iBand = shop.indexOf("<FindYourRitual />");
    const iGrid = shop.indexOf("The Morning Ritual");
    const iStrip = shop.indexOf("<ShopServiceStrip />");
    expect(iBand).toBeGreaterThan(-1);
    expect(iBand).toBeLessThan(iGrid);
    expect(iStrip).toBeGreaterThan(shop.indexOf("The Evening Ritual"));
  });

  it("the band links the quiz and the builder; the heading is ochre section size", () => {
    expect(hrefs(band)).toEqual(expect.arrayContaining(["/assessment", "/build-your-ritual"]));
    expect(band).toMatch(/<Heading level="h2"[^>]*className="mt-4 text-ochre"/);
  });

  it("every link target is an existing page", () => {
    const targets = [...hrefs(band), ...hrefs(strip)];
    expect(targets.length).toBeGreaterThanOrEqual(5);
    for (const t of targets) {
      const dir = t === "/" ? "app/page.tsx" : `app${t}/page.tsx`;
      expect(existsSync(dir), `${t} -> ${dir}`).toBe(true);
    }
  });

  it("invents no offer, price, delivery time or review language", () => {
    const copy = `${band}\n${strip}`;
    expect(copy).not.toMatch(/discount|% off|free shipping|free delivery|days|reviews?\b|rated|\$\d/i);
  });
});
