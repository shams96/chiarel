import type { Metadata } from "next";
import { products, isPurchasable, productHref } from "@/lib/products";
import HeroIntro from "@/components/HeroIntro";
import EmailSignup from "@/components/EmailSignup";
import HomeHero from "@/components/home/HomeHero";
import EditorialFeature from "@/components/EditorialFeature";
import HomeRitual from "@/components/home/HomeRitual";
import HomeFitGuidance from "@/components/home/HomeFitGuidance";
import HomeN1Feature from "@/components/home/HomeN1Feature";
import HomeProvenance from "@/components/home/HomeProvenance";
import HomeProof from "@/components/home/HomeProof";
import HomeFormulationRecord from "@/components/home/HomeFormulationRecord";
import HomeFaq from "@/components/home/HomeFaq";
import { HomeFinalCta, HomePhilosophy } from "@/components/home/HomeClosing";
import {
  faqJsonLd,
  offerCatalogJsonLd,
  webPageJsonLd,
  researchArticleJsonLd,
  howToJsonLd,
  SITE_URL,
  SITE_NAME,
  HOMEPAGE_LAST_UPDATED,
  HOMEPAGE_PUBLISHED,
  HOMEPAGE_LAST_UPDATED_DISPLAY,
  HOMEPAGE_PUBLISHED_DISPLAY,
  FORMULATOR_EXTERNAL_URL,
} from "@/lib/seo";

// Homepage-specific authorship metadata — see prior comment history for why
// this is repeated rather than inherited from layout.tsx. Title/description
// now lead with CHIAREL Essence and the ritual (owner decision, 2026-10-14);
// N1 is the featured new product further down the page.
export const metadata: Metadata = {
  authors: [{ name: "Grazia Savoriti", url: FORMULATOR_EXTERNAL_URL }],
  openGraph: {
    type: "article",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — The Ritual, Formulated in Isola del Liri`,
    description:
      "A five-product morning and evening skincare ritual built around Clarity Essence, made fresh to order in Isola del Liri, Italy. Key ingredients named across our product pages.",
    url: SITE_URL,
    images: [{ url: "/assets/editorial/og-n1-hands.jpg", width: 1200, height: 630 }],
    publishedTime: HOMEPAGE_PUBLISHED,
    modifiedTime: HOMEPAGE_LAST_UPDATED,
    authors: [FORMULATOR_EXTERNAL_URL],
  },
};

// FAQ pricing answer reworded: the prior version hardcoded specific dollar
// figures and called the Ritual Set "five-step" — both go stale under the
// four-product restructuring (N1 has no price yet, and "five-step"/"six-
// product" language is retired sitewide per
// CHIAREL_FOUR_PRODUCT_IMPLEMENTATION_PLAN.md). Uses the brief's own "see
// individual product pages" fallback rather than inventing new numbers.
const faqs = [
  {
    question: "How much does CHIAREL cost?",
    answer:
      "Pricing varies by product and by whether you choose subscription (recurring, every 45 days, at a discounted rate) or one-time purchase. See each product's page for its current price.",
  },
  {
    question: "What is CHIAREL made of?",
    answer:
      "Each product page names its key ingredients. Clarity Essence pairs peptides with niacinamide and hyaluronic acid; Clarity Day Crème carries ceramides, cholesterol and squalane; Clarity Night Crème is built around bakuchiol, peptides and niacinamide; Clarity Neck & Décolleté Crème pairs copper peptide with ceramides and squalane; Clarity Eye Contour Concentrate combines caffeine, peptides and hyaluronic acid.",
  },
  {
    question: "Who formulates CHIAREL?",
    answer:
      "CHIAREL is formulated by Grazia Savoriti, a pharmacist specializing in cosmetic and nutraceutical research. She develops every formulation directly, from Clarity Essence's peptides to Clarity Day Crème's ceramides. Each batch is then produced fresh, to order, in Isola del Liri, Italy — never manufactured in bulk ahead of demand. Savoriti also reviews the published, peer-reviewed research behind each active ingredient before it's formulated into a product.",
  },
  {
    question: "Where can I buy CHIAREL?",
    answer:
      "CHIAREL is sold only at chiarel.com. It is not available in retail stores, department stores, or through third-party marketplaces or resellers. Buying direct means each order is made fresh in Isola del Liri, Italy and shipped straight to you, with no retail markup layers. It also keeps pricing and formulation fully in-house.",
  },
  {
    question: "How does the CHIAREL subscription work?",
    answer:
      "Choosing subscription pricing sets a recurring delivery every 45 days, timed to how fast most people use a bottle of serum or crème, at a discounted rate. Every product is also available as a one-time purchase at full price, with no subscription required. Self-service subscription management (pause, skip, or cancel) is coming to the account experience. Until then, email orders@chiarel.com for any change.",
  },
  {
    question: "Where is CHIAREL made?",
    answer:
      "CHIAREL formulas are produced in Isola del Liri, Italy, with manufacturing partner Natural You Srl. Formulation uses water drawn where the Liri meets the Fibreno — a river fed entirely by limestone karst springs, with no surface tributaries of its own. Formulation happens on-site, so every CHIAREL batch is produced fresh, to order — never held in standing inventory.",
  },
  {
    question: "What is the CHIAREL ritual?",
    answer:
      "Five products, two moments in the day. Mornings pair Clarity Essence with Clarity Day Crème, followed by SPF. Evenings run lightest texture first: Clarity Essence, Clarity Eye Contour Concentrate (made for the evening, and it may be used morning or night), Clarity Night Crème, then Clarity Neck & Décolleté Crème.",
  },
];

// Mirrors the visible "Step 1 → Step 2 [→ Step 3]" AM/PM copy in the
// ritual section (components/home/HomeRitual.tsx) exactly — do not drift the two out of
// sync if that section's copy changes.
const amRitualHowTo = howToJsonLd({
  name: "CHIAREL Morning Ritual",
  description:
    "The CHIAREL morning routine: Clarity Essence followed by Clarity Day Crème.",
  steps: [
    { name: "Clarity Essence", text: "Apply Clarity Essence, for fine lines and firmness." },
    { name: "Clarity Day Crème", text: "Follow with Clarity Day Crème, for dry skin under daily stress, then SPF." },
  ],
});
const pmRitualHowTo = howToJsonLd({
  name: "CHIAREL Evening Ritual",
  description:
    "The CHIAREL evening routine, lightest texture first: Clarity Essence, Clarity Eye Contour Concentrate, Clarity Night Crème, then Clarity Neck & Décolleté Crème.",
  steps: [
    { name: "Clarity Essence", text: "Apply Clarity Essence." },
    { name: "Clarity Eye Contour Concentrate", text: "Follow with Clarity Eye Contour Concentrate, for puffiness, dark circles and fine lines. Made for the evening, and it may be used morning or night." },
    { name: "Clarity Night Crème", text: "Follow with Clarity Night Crème, for smoother-looking texture." },
    { name: "Clarity Neck & Décolleté Crème", text: "Finish with Clarity Neck & Décolleté Crème, for crepey-looking skin on the neck and chest." },
  ],
});

export default function Home() {
  return (
    <>
      <HeroIntro />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            webPageJsonLd({
              url: SITE_URL,
              name: "CHIAREL™ — The Ritual, Formulated in Isola del Liri",
              description:
                "CHIAREL's focused morning and evening ritual, five products, two moments in the day, built around Clarity Essence. Skincare formulated in Isola del Liri, Italy, with key ingredients named across our product pages.",
            })
          ),
        }}
      />
      {/* Only priced products get an Offer — N1 has no owner-approved price
          yet, so it's excluded here rather than publishing an inaccurate
          Offer. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(offerCatalogJsonLd(products.filter(isPurchasable))),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(researchArticleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(amRitualHowTo) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pmRitualHowTo) }}
      />

      {/* Emotion first, proof second:
          hero -> ritual -> featured new product -> provenance & formulator
          -> proof -> philosophy -> formulation record (collapsed) -> FAQ
          -> final CTA. */}
      <HomeHero />
      <HomeRitual />
      <EditorialFeature
        src="/assets/products/terra-radiance-creme-editorial.jpg"
        alt="A woman holding Clarity Day Crème against the Capri coastline"
        kicker="The Icon Product"
        headline="The daily crème of the morning ritual."
        body="Clarity Day Crème: the moisturising step of the AM ritual, finished in Italian light."
        href={productHref("terra-radiance-creme")}
        cta="Discover Clarity Day Crème"
      />
      <HomeFitGuidance />
      <HomeN1Feature />
      <HomeProvenance />
      <HomeProof />
      <HomePhilosophy />
      <HomeFormulationRecord />
      <HomeFaq faqs={faqs} />
      <HomeFinalCta />
      <div className="mx-auto max-w-xl px-6 pb-10">
        <EmailSignup source="home" />
      </div>

      <p className="pb-10 pt-6 text-center text-[11px] text-ink/65">
        Written by{" "}
        <a
          href={FORMULATOR_EXTERNAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="border-b border-ink/30 hover:border-ochre hover:text-ochre"
        >
          Grazia Savoriti
        </a>
        , CHIAREL&rsquo;s formulating pharmacist. Published{" "}
        {HOMEPAGE_PUBLISHED_DISPLAY}, last reviewed{" "}
        {HOMEPAGE_LAST_UPDATED_DISPLAY}.
      </p>
    </>
  );
}
