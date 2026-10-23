import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import robots from "@/app/robots";
import { products, isPurchasable } from "@/lib/products";
import { productJsonLd, productPageTitle, SITE_URL } from "@/lib/seo";

const TEMPLATE_SUFFIX = " — CHIAREL™";

describe("product page titles", () => {
  it("keeps the rendered title within 60 characters for every product", () => {
    for (const p of products) {
      const rendered = productPageTitle(p.name, p.descriptor) + TEMPLATE_SUFFIX;
      expect(rendered.length, p.slug).toBeLessThanOrEqual(60);
    }
  });

  it("keeps the descriptor when it fits and drops it whole when it does not", () => {
    expect(productPageTitle("Short", "Brief")).toBe("Short — Brief");
    expect(productPageTitle("N1 Neck & Décolleté Renewal Emulsion™", "Nightly Neck & Décolleté Renewal Emulsion")).toBe(
      "N1 Neck & Décolleté Renewal Emulsion™",
    );
  });
});

describe("product JSON-LD", () => {
  const purchasable = products.filter(isPurchasable);

  it("covers at least the launch products", () => {
    expect(purchasable.length).toBeGreaterThanOrEqual(5);
  });

  it("is JSON-serialisable with the fields rich results need", () => {
    for (const p of purchasable) {
      const ld = JSON.parse(JSON.stringify(productJsonLd(p)));
      expect(ld["@context"]).toBe("https://schema.org");
      expect(ld["@type"]).toBe("Product");
      expect(ld.sku, p.slug).toBe(p.sku);
      expect(ld.url).toBe(`${SITE_URL}/shop/${p.path}`);
      expect(ld.image.startsWith("https://"), p.slug).toBe(true);
      expect(ld.offers.priceCurrency).toBe("USD");
      expect(typeof ld.offers.price).toBe("number");
      expect(ld.offers.price, p.slug).toBeGreaterThan(0);
      expect(ld.offers.itemCondition).toBe("https://schema.org/NewCondition");
    }
  });

  it("only references product images that exist in public/", () => {
    for (const p of products) {
      expect(fs.existsSync(path.join(process.cwd(), "public", p.image)), p.image).toBe(true);
    }
  });
});

describe("robots", () => {
  const rules = robots().rules as { userAgent: string; allow?: string; disallow?: string | string[] }[];
  const byAgent = (ua: string) => rules.find((r) => r.userAgent === ua);

  it("explicitly allows the major AI and answer-engine crawlers", () => {
    for (const ua of [
      "GPTBot",
      "OAI-SearchBot",
      "ChatGPT-User",
      "ClaudeBot",
      "Claude-SearchBot",
      "Claude-User",
      "PerplexityBot",
      "Google-Extended",
      "Applebot-Extended",
    ]) {
      expect(byAgent(ua)?.allow, ua).toBe("/");
    }
  });

  it("keeps checkout and account out of the index", () => {
    expect(byAgent("*")?.disallow).toEqual(expect.arrayContaining(["/checkout", "/account"]));
  });
});
