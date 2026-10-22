import { products, isPurchasable, productHref } from "@/lib/products";
import { SITE_URL } from "@/lib/seo";
import { isStaging } from "@/lib/app-env";

export const dynamic = "force-static";

function buildLlmsTxt(): string {
  const productLines = products
    .map((p) => {
      const pricing = isPurchasable(p)
        ? `$${p.price.oneTime} one-time / $${p.price.subscription} on 45-day subscription`
        : "price to be announced, not yet available for purchase";
      return `- [${p.name}](${SITE_URL}${productHref(p.slug)}): ${p.descriptor} — ${pricing}.`;
    })
    .join("\n");

  return `# CHIAREL™

> CHIAREL™ is a direct-to-consumer luxury skincare house — The House of Clarity™ — formulating customer-tested serums, moisturizers, and treatments in Isola del Liri, Italy, under pharmacist Grazia Savoriti. Each product page names its key ingredients. Products are sold exclusively at chiarel.com, either one-time or on a 45-day subscription cadence.

## Key pages

- [Homepage](${SITE_URL}/): brand overview, FAQ (pricing, formulation, sourcing, availability), and the core product lineup.
- [The Shop](${SITE_URL}/shop): full product catalog with pricing.
- [The Ritual](${SITE_URL}/ritual): five products, two moments in the day: Clarity Essence and Clarity Day Crème in the morning; Clarity Essence, Clarity Eye Contour Concentrate, Clarity Night Crème and Clarity Neck & Décolleté Crème in the evening.
- [The Science](${SITE_URL}/science): what each formulation answers, naming its real ingredients.
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
  if (isStaging()) {
    return new Response("# Staging\n\nThis is a non-public staging copy. Do not index or cite.\n", {
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });
  }
  return new Response(buildLlmsTxt(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
