import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ectoine, Explained",
  description:
    "What Ectoine is, how it works, and why CHIAREL formulates with it inside a lipid/occlusive delivery system. A transparent, third-person explainer — no exclusivity claims.",
  alternates: { canonical: "/science/ectoine" },
};

const faqs = [
  {
    q: "What is Ectoine?",
    a: "Ectoine is an extremolyte — a small organic molecule originally identified in microorganisms that survive extreme dehydration and osmotic stress. It is a well-studied, widely used ingredient in cosmetic formulation, not a CHIAREL-exclusive technology.",
  },
  {
    q: "How does Ectoine work on skin?",
    a: "Published research describes Ectoine as forming a preferential hydration shell around proteins and cell membranes, helping stabilize them against water loss, UV exposure, and pollution stress — without penetrating deeply or acting as a classic antioxidant.",
  },
  {
    q: "Does CHIAREL own or trademark Ectoine?",
    a: "No. Ectoine is an INCI (International Nomenclature of Cosmetic Ingredients) name, freely used across the industry. CHIAREL does not claim exclusive rights to the ingredient — only to how we formulate, dose, and deliver it within our own products.",
  },
  {
    q: "Which CHIAREL products contain Ectoine?",
    a: "Dosage is disclosed per product on each product page's transparency panel. Check the individual product listing in The Shop for current formulation details.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function EctoinePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Link href="/science" className="text-[12px] text-ink/50 hover:text-ochre">
        ← The Science
      </Link>
      <h1 className="mt-2 font-serif text-4xl leading-tight">
        Ectoine, Explained
      </h1>
      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink/75">
        Ectoine is an established ingredient with a well-documented
        mechanism. This page explains what it is and how it works — in the
        third person, as an educational reference, not a proprietary claim.
      </p>

      <section className="mt-12 space-y-10">
        <div className="border-l-2 border-champagne pl-6">
          <h2 className="font-serif text-2xl">What it is</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            Ectoine is an extremolyte, first identified in halophilic
            (salt-tolerant) microorganisms that use it to survive extreme
            dehydration and osmotic stress. It has since been widely adopted
            across cosmetic formulation as a stabilizing, hydration-supporting
            ingredient.
          </p>
        </div>
        <div className="border-l-2 border-champagne pl-6">
          <h2 className="font-serif text-2xl">How it works</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            Research describes Ectoine as forming a preferential hydration
            shell around proteins and cell membranes — organizing water at
            the molecular level to stabilize structures against dehydration,
            UV exposure, and pollution-related stress. It does not penetrate
            deeply and is not classified as a traditional antioxidant.
          </p>
        </div>
        <div className="border-l-2 border-champagne pl-6">
          <h2 className="font-serif text-2xl">Associated outcomes</h2>
          <ul className="mt-2 max-w-xl list-disc space-y-1 pl-5 text-sm leading-relaxed text-ink/70">
            <li>Reduced transepidermal water loss under stress</li>
            <li>Improved barrier stability</li>
            <li>Lower visible reactivity</li>
            <li>Smoother, longer-lasting hydration</li>
          </ul>
        </div>
        <div className="border-l-2 border-ochre pl-6">
          <h2 className="font-serif text-2xl">How CHIAREL formulates with it</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            CHIAREL does not claim exclusivity over Ectoine as an ingredient.
            What we describe transparently is our formulation approach:
            Ectoine paired with a lipid/occlusive delivery vehicle, alongside
            Bifida Ferment Lysate and L-Ornithine, dosed and disclosed on each
            product page. See{" "}
            <Link href="/science/barrier-resilience" className="border-b border-ochre text-ochre">
              Barrier Resilience
            </Link>{" "}
            for how the three work together.
          </p>
        </div>
      </section>

      <p className="mt-14 max-w-2xl text-[11px] leading-relaxed text-ink/45">
        Ectoine is an INCI ingredient name, not a CHIAREL trademark. This page
        is educational and reflects published cosmetic-science understanding
        of the ingredient category; it is not a guarantee of individual
        results and is not intended as medical or drug claim language.
      </p>

      <div className="mt-8 flex flex-wrap gap-6 border-t border-ink/10 pt-8 text-[12px] uppercase tracking-[0.16em]">
        <Link href="/science/lasting-hydration" className="border-b border-ochre pb-0.5 text-ochre">
          Controlled, Long-Lasting Hydration →
        </Link>
        <Link href="/shop/chiarel-essence" className="border-b border-ink/30 pb-0.5 text-ink/60">
          Shop CHIAREL Essence™
        </Link>
      </div>
    </div>
  );
}
