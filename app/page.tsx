import type { Metadata } from "next";
import { products, isPurchasable } from "@/lib/products";
import HeroIntro from "@/components/HeroIntro";
import HomeHero from "@/components/home/HomeHero";
import HomeRitual from "@/components/home/HomeRitual";
import HomeFitGuidance from "@/components/home/HomeFitGuidance";
import HomeN1Feature from "@/components/home/HomeN1Feature";
import HomeProvenance from "@/components/home/HomeProvenance";
import HomeProof from "@/components/home/HomeProof";
import HomeFormulationRecord from "@/components/home/HomeFormulationRecord";
import HomeFaq from "@/components/home/HomeFaq";
import { HomeBeyondRitual, HomeFinalCta, HomePhilosophy } from "@/components/home/HomeClosing";
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
      "A focused morning and evening skincare ritual built around CHIAREL Essence™, made fresh to order in Isola del Liri, Italy. Every active and its percentage disclosed.",
    url: SITE_URL,
    images: [{ url: "/assets/editorial/hero-shore-duo.png", width: 1536, height: 934 }],
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
      "Every formula discloses its actives and concentrations plainly. CHIAREL Essence™ is built around Palmitoyl Pentapeptide-4 (3%) and Bioactive Ferment Lysate (0.30%); Terra Radiance Crème™ carries Ceramide NP (0.8%) and Niacinamide (3.0%). Each product page states its complete active ingredient list and percentage where applicable.",
  },
  {
    question: "Who formulates CHIAREL?",
    answer:
      "CHIAREL is formulated by Grazia Savoriti, a pharmacist specializing in cosmetic and nutraceutical research. She develops every formulation directly, from CHIAREL Essence™'s peptide complex to Terra Radiance Crème™'s barrier-support blend. Each batch is then produced fresh, to order, in Isola del Liri, Italy — never manufactured in bulk ahead of demand. Savoriti also reviews the published, peer-reviewed research behind each active ingredient before it's formulated into a product. Every formula lists its actives and exact percentages; nothing is grouped into an undisclosed blend.",
  },
  {
    question: "Where can I buy CHIAREL?",
    answer:
      "CHIAREL is sold only at chiarel.com. It is not available in retail stores, department stores, or through third-party marketplaces or resellers. Buying direct means each order is made fresh in Isola del Liri, Italy and shipped straight to you, with no retail markup layers. It also lets CHIAREL list every active ingredient and its exact concentration on the product page, since pricing and formulation stay fully in-house.",
  },
  {
    question: "How does the CHIAREL subscription work?",
    answer:
      "Choosing subscription pricing sets a recurring delivery every 45 days, timed to how fast most people use a bottle of serum or crème, at a discounted rate. Every product is also available as a one-time purchase at full price, with no subscription required. Self-service subscription management (pause, skip, or cancel) is coming to the account experience. Until then, email orders@chiarel.com for any change.",
  },
  {
    question: "Where is CHIAREL made?",
    answer:
      "CHIAREL formulas are produced in Isola del Liri, Italy, with manufacturing partner Natural You Srl. Formulation uses water drawn where the Liri meets the Fibreno — a river fed entirely by limestone karst springs, with no surface tributaries of its own. That confluence of newly filtered spring water gives The Cascata Complex™ its name. Formulation happens on-site, so every CHIAREL batch is produced fresh, to order — never held in standing inventory.",
  },
  {
    question: "What is the CHIAREL Four-Product Ritual?",
    answer:
      "A focused morning and evening practice: mornings pair CHIAREL Essence™ with Terra Radiance Crème™; evenings pair CHIAREL Essence™ with Recovery Masque™ and N1 Neck & Décolleté Renewal Emulsion™. Cellular Cleanser™ and Cellular Mist™ remain available as optional preparation steps, and CHIAREL Lip Concentrate™ remains available beyond the core ritual.",
  },
];

// Mirrors the visible "Step 1 → Step 2 [→ Step 3]" AM/PM copy in the
// ritual section (components/home/HomeRitual.tsx) exactly — do not drift the two out of
// sync if that section's copy changes.
const amRitualHowTo = howToJsonLd({
  name: "CHIAREL Morning Ritual",
  description:
    "The CHIAREL morning routine: CHIAREL Essence™ followed by Terra Radiance Crème™.",
  steps: [
    { name: "CHIAREL Essence™", text: "Apply CHIAREL Essence™ as the treatment serum step." },
    { name: "Terra Radiance Crème™", text: "Follow with Terra Radiance Crème™ for daytime barrier support." },
  ],
});
const pmRitualHowTo = howToJsonLd({
  name: "CHIAREL Evening Ritual",
  description:
    "The CHIAREL evening routine: CHIAREL Essence™, then Recovery Masque™, then N1 Neck & Décolleté Renewal Emulsion™.",
  steps: [
    { name: "CHIAREL Essence™", text: "Apply CHIAREL Essence™ as the treatment serum step." },
    { name: "Recovery Masque™", text: "Follow with Recovery Masque™ as the evening face-recovery step, before N1." },
    { name: "N1 Neck & Décolleté Renewal Emulsion™", text: "Finish with N1 Neck & Décolleté Renewal Emulsion™ on the neck and décolleté." },
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
                "CHIAREL's focused morning and evening ritual, built around CHIAREL Essence and including N1 Neck & Décolleté Renewal Emulsion. Skincare formulated in Isola del Liri, Italy, with every active ingredient and concentration disclosed on each product page as it becomes available.",
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
      <HomeFitGuidance />
      <HomeN1Feature />
      <HomeProvenance />
      <HomeProof />
      <HomePhilosophy />
      <HomeFormulationRecord />
      <HomeBeyondRitual />
      <HomeFaq faqs={faqs} />
      <HomeFinalCta />
      {/* Email-signup slot: place the signup component here. */}

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
