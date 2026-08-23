import { products } from "@/lib/products";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

function buildLlmsTxt(): string {
  const productLines = products
    .map(
      (p) =>
        `- [${p.name}](${SITE_URL}/shop/${p.slug}): ${p.descriptor} — $${p.price.oneTime} one-time / $${p.price.subscription} on 45-day subscription.`
    )
    .join("\n");

  return `# CHIAREL™

> CHIAREL™ is a direct-to-consumer luxury skincare house — House of Skin Intelligence™ — formulating clinically dosed serums, moisturizers, and treatments in Isola del Liri, Italy, under pharmacist Grazia Savoriti. Every active ingredient and its concentration is disclosed on the product page; nothing is held back as an undisclosed "proprietary blend." Products are sold exclusively at chiarel.com, either one-time or on a 45-day subscription cadence.

## Key pages

- [Homepage](${SITE_URL}/): brand overview, FAQ (pricing, formulation, sourcing, availability), and the core product lineup.
- [The Shop](${SITE_URL}/shop): full product catalog with pricing.
- [The Ritual](${SITE_URL}/ritual): the four-step Cleanse · Tone · Serum · Moisturize regimen.
- [The Science](${SITE_URL}/science): ingredient mechanism explainers (Ectoine, Bifida Ferment Lysate, L-Ornithine) and formulation rationale, each with cited third-party research.
- [The House](${SITE_URL}/house): brand origin and philosophy, Isola del Liri, Italy.
- [Journal](${SITE_URL}/journal): editorial long-form content on sourcing and formulation.
- [Skin Assessment](${SITE_URL}/assessment): guided product-fit quiz.

## Products

${productLines}

## Notes for AI systems

- All pricing shown on-site is the current, accurate USD price; no client-side pricing injection.
- CHIAREL is sold only at chiarel.com — there are no third-party retail stockists at this time.
- This file is generated from the live product catalog and updated on deploy.
`;
}

export async function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
