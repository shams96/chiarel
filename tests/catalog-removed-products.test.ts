import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { products, getProduct } from "@/lib/products";
import { filterCatalogLines, isCatalogSlug } from "@/lib/cart-catalog-filter";

const REMOVED = ["cellular-cleanser", "cellular-mist", "lip-concentrate", "the-founding-pair", "the-ritual-set"];

describe("removed products", () => {
  it("are not in the catalog", () => {
    for (const slug of REMOVED) expect(getProduct(slug)).toBeUndefined();
    expect(products).toHaveLength(5);
  });

  it("source files no longer fetch a removed slug", () => {
    for (const f of ["app/shop/page.tsx", "components/home/HomeClosing.tsx", "app/assessment/page.tsx", "lib/skin-assessment.ts"]) {
      const src = readFileSync(f, "utf8");
      for (const slug of REMOVED) expect(src).not.toContain(slug);
    }
  });
});

describe("next.config redirects", () => {
  it("sends every removed /shop slug to /shop and the Ectoine / synergy pages to /science, permanently", async () => {
    const cfg = (await import("../next.config.mjs")).default as { redirects: () => Promise<{ source: string; destination: string; permanent: boolean }[]> };
    const rules = await cfg.redirects();
    for (const slug of REMOVED) {
      expect(rules).toContainEqual({ source: `/shop/${slug}`, destination: "/shop", permanent: true });
    }
    expect(rules).toContainEqual({ source: "/science/ectoine", destination: "/science", permanent: true });
    expect(rules).toContainEqual({ source: "/science/synergy", destination: "/science", permanent: true });
    expect(rules.every((r) => r.permanent)).toBe(true);
  });
});

describe("cart catalog filter", () => {
  it("recognises only catalog slugs", () => {
    expect(isCatalogSlug("chiarel-essence")).toBe(true);
    expect(isCatalogSlug("cellular-cleanser")).toBe(false);
    expect(isCatalogSlug(undefined)).toBe(false);
    expect(isCatalogSlug(42)).toBe(false);
  });

  it("drops lines whose slug is not in the catalog and keeps the rest in order", () => {
    const lines = [{ slug: "cellular-mist" }, { slug: "chiarel-essence" }, { slug: "the-ritual-set" }, { slug: "recovery-masque" }];
    expect(filterCatalogLines(lines).map((l) => l.slug)).toEqual(["chiarel-essence", "recovery-masque"]);
  });
});

describe("API exposes only catalog slugs", () => {
  it("GET /api/products omits database rows for removed products", async () => {
    vi.resetModules();
    const row = (slug: string) => ({
      slug, sku: "x", name: slug, descriptor: "d", step: "s", ritualOrder: 1, family: "f", colorName: "c", colorHex: "#000",
      complex: "", line: "", size: "", priceSub: 1, priceOneTime: 2, image: "/i.png", blurb: "b", role: null, badge: null,
      isSet: false, isIcon: true, actives: null,
    });
    vi.doMock("@/lib/db", () => ({
      db: { product: { findMany: async () => [row("cellular-cleanser"), row("chiarel-essence"), row("the-founding-pair")] } },
    }));
    const { GET } = await import("@/app/api/products/route");
    const body = await (await GET()).json();
    expect(body.map((p: { slug: string }) => p.slug)).toEqual(["chiarel-essence"]);
    vi.doUnmock("@/lib/db");
  });
});
