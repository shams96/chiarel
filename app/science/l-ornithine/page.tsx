import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "L-Ornithine, Explained",
  description:
    "What L-Ornithine is, its role in the skin's Natural Moisturizing Factor, and how CHIAREL formulates with it. A transparent, third-person explainer.",
  alternates: { canonical: "/science/l-ornithine" },
};

const faqs = [
  {
    q: "What is L-Ornithine?",
    a: "L-Ornithine is an amino acid and a natural component of skin's Natural Moisturizing Factor (NMF). It is an established INCI ingredient, not a CHIAREL-exclusive ingredient.",
  },
  {
    q: "What does it do for skin?",
    a: "It is linked to the urea cycle and polyamine pathways involved in barrier maintenance, and is understood to contribute to hydration-feel, softness, and texture as part of the skin's own moisture-regulation system.",
  },
  {
    q: "Why pair an amino acid with an extremolyte and a postbiotic?",
    a: "Each addresses a different layer of barrier and hydration support — cellular water organization, barrier-protein expression, and NMF-level nourishment. CHIAREL formulates all three inside one delivery vehicle rather than relying on a single mechanism.",
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

export default function LOrnithinePage() {
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
        L-Ornithine, Explained
      </h1>
      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink/75">
        An amino acid already native to skin&rsquo;s own moisture system.
        Explained here in the third person, as an educational reference.
      </p>

      <section className="mt-12 space-y-10">
        <div className="border-l-2 border-champagne pl-6">
          <h2 className="font-serif text-2xl">What it is</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            An amino acid and component of the skin&rsquo;s Natural
            Moisturizing Factor (NMF) — the mix of small molecules the
            skin itself produces to hold hydration.
          </p>
        </div>
        <div className="border-l-2 border-champagne pl-6">
          <h2 className="font-serif text-2xl">How it works</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            Linked to the urea cycle and polyamine pathways associated with
            collagen and barrier maintenance — supporting processes skin
            already runs, rather than introducing a synthetic mechanism.
          </p>
          <p className="mt-3 text-[12px] text-ink/50">
            Source:{" "}
            <a
              href="https://pubmed.ncbi.nlm.nih.gov/?term=ornithine+skin+barrier"
              target="_blank"
              rel="noopener noreferrer"
              className="border-b border-ink/30 hover:border-ochre hover:text-ochre"
            >
              Published research on Ornithine and skin barrier function, PubMed (NIH)
            </a>
          </p>
        </div>
        <div className="border-l-2 border-champagne pl-6">
          <h2 className="font-serif text-2xl">Associated outcomes</h2>
          <ul className="mt-2 max-w-xl list-disc space-y-1 pl-5 text-sm leading-relaxed text-ink/70">
            <li>Enhanced hydration feel and softness</li>
            <li>Support for barrier integrity</li>
            <li>Contribution to smoother texture and resilience</li>
          </ul>
        </div>
        <div className="border-l-2 border-ochre pl-6">
          <h2 className="font-serif text-2xl">How CHIAREL formulates with it</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            Positioned as the completing layer of the hydration–barrier–repair
            cascade, delivered inside the same occlusive vehicle as Ectoine
            and Bifida Ferment Lysate. See the{" "}
            <Link href="/science/barrier-resilience" className="border-b border-ochre text-ochre">
              full synergy
            </Link>
            .
          </p>
        </div>
      </section>

      <p className="mt-14 max-w-2xl text-[11px] leading-relaxed text-ink/45">
        L-Ornithine is an INCI ingredient name, not a CHIAREL trademark. This
        page reflects published cosmetic-science understanding of the
        ingredient category and is not a guarantee of individual results.
      </p>

      <div className="mt-8 flex flex-wrap gap-6 border-t border-ink/10 pt-8 text-[12px] uppercase tracking-[0.16em]">
        <Link href="/science/synergy" className="border-b border-ochre pb-0.5 text-ochre">
          The Synergy →
        </Link>
        <Link href="/shop/chiarel-essence" className="border-b border-ink/30 pb-0.5 text-ink/60">
          Shop CHIAREL Essence™
        </Link>
      </div>
    </div>
  );
}
