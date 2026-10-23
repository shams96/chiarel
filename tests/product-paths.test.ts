import { describe, expect, it } from "vitest";
import { products, getProduct, getProductByPath, productHref } from "@/lib/products";

const EXPECTED: Record<string, string> = {
  "chiarel-essence": "clarity-essence",
  "terra-radiance-creme": "clarity-day-creme",
  "recovery-masque": "clarity-night-creme",
  "n1-neck-decollete": "clarity-neck-decollete-creme",
  "eye-contour-concentrate": "clarity-eye-contour-concentrate",
};

describe("product public paths", () => {
  it("every product has the agreed unique path", () => {
    expect(new Set(products.map((p) => p.path)).size).toBe(products.length);
    for (const p of products) expect(p.path).toBe(EXPECTED[p.slug]);
  });

  it("productHref and getProductByPath round-trip; old slugs do not resolve as paths", () => {
    for (const [slug, path] of Object.entries(EXPECTED)) {
      expect(productHref(slug)).toBe(`/shop/${path}`);
      expect(getProductByPath(path)).toBe(getProduct(slug));
      expect(getProductByPath(slug)).toBeUndefined();
    }
  });

  it("glass colours and vessel sizes follow the brief", () => {
    const by = (s: string) => getProduct(s)!;
    expect(by("chiarel-essence").color.name).toBe("Red Ochre");
    expect(by("terra-radiance-creme").color.name).toBe("Red Ochre");
    expect(by("recovery-masque").color.name).toBe("Formal Garden");
    expect(by("n1-neck-decollete").color.name).toBe("Formal Garden");
    expect(by("eye-contour-concentrate").color.name).toBe("Peach Dust");
    expect(products.map((p) => p.size)).toEqual(
      ["40 ml bottle", "50 g jar", "50 g jar", "40 ml bottle", "40 ml bottle"],
    );
    for (const p of products) expect(p.family).not.toMatch(/Rose|Verde|Terra/);
  });

  it("next.config permanently redirects every old slug to its new path", async () => {
    const cfg = (await import("../next.config.mjs")).default as {
      redirects: () => Promise<{ source: string; destination: string; permanent: boolean }[]>;
    };
    const rules = await cfg.redirects();
    for (const [slug, path] of Object.entries(EXPECTED)) {
      expect(rules).toContainEqual({ source: `/shop/${slug}`, destination: `/shop/${path}`, permanent: true });
    }
    expect(rules).toContainEqual({ source: "/shop/cellular-mist", destination: "/shop", permanent: true });
  });
});
