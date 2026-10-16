import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import products from "@/data/products.json";
import { COUNTRIES } from "@/lib/countries";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

describe("content QA polish", () => {
  it("only countries without a postal system make the code optional", () => {
    expect(COUNTRIES.AE.postalRequired).toBe(false);
    expect(COUNTRIES.US.postalRequired).toBe(true);
    expect(COUNTRIES.CA.postalRequired).toBe(true);
    expect(COUNTRIES.IT.postalRequired).toBe(true);
  });

  it("shop does not label purchasable products Coming Soon", () => {
    const src = read("app/shop/page.tsx");
    expect(src).not.toMatch(/Coming Soon/);
    expect(src).toContain("More from the House");
  });

  it("account page names no third-party platform and shows no fake preview", () => {
    const src = read("app/account/page.tsx");
    expect(src).not.toMatch(/Shopify|preview|Preview/);
    expect(src).toContain("ORDERS_EMAIL");
    expect(src).toContain("index: false");
  });

  it("sets use the brand hero as og:image, and the file exists", () => {
    for (const slug of ["the-founding-pair", "the-ritual-set"]) {
      const p = (products as { slug: string; og?: string }[]).find((x) => x.slug === slug);
      expect(p?.og).toBe("/assets/editorial/hero-shore-duo.jpg");
      expect(() => readFileSync(join(process.cwd(), "public", p!.og!))).not.toThrow();
    }
  });
});
