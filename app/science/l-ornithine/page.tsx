import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "L-Ornithine, Explained",
  description:
    "What L-Ornithine is, its role in the skin's Natural Moisturizing Factor, and where CHIAREL uses it: Clarity Night Crème. A transparent, third-person explainer.",
  alternates: { canonical: "/science/l-ornithine" },
};

const faqs = [
  {
    q: "What is L-Ornithine?",
    a: "L-Ornithine is an amino acid and a natural component of skin's Natural Moisturizing Factor (NMF). It is an established INCI ingredient, not a CHIAREL-exclusive ingredient.",
  },
  {
    q: "What does it do for skin?",
    a: "It is linked to the urea cycle and polyamine pathways involved in barrier maintenance, and is understood to contribute to hydration-feel and softness as part of the skin's own moisture-regulation system.",
  },
  {
    q: "Which CHIAREL product contains it?",
    a: "Clarity Night Crème, alongside bakuchiol, peptides and niacinamide, to smooth the look of texture overnight.",
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

      <Link href="/science" className="text-[12px] text-ink/65 hover:text-ochre">
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
          <p className="mt-3 text-[12px] text-ink/65">
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
            <li>Hydration feel and softness</li>
            <li>The look of smoother texture</li>
          </ul>
        </div>
        <div className="border-l-2 border-ochre pl-6">
          <h2 className="font-serif text-2xl">How CHIAREL formulates with it</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            Found in Clarity Night Crème, alongside bakuchiol, peptides and
            niacinamide, to smooth the look of texture overnight. See{" "}
            <Link href="/science" className="border-b border-ochre text-ochre">
              The Science
            </Link>
            .
          </p>
        </div>
      </section>

      <p className="mt-14 max-w-2xl text-[11px] leading-relaxed text-ink/65">
        L-Ornithine is an INCI ingredient name, not a CHIAREL trademark. This
        page reflects published cosmetic-science understanding of the
        ingredient category and is not a guarantee of individual results.
      </p>

      <div className="mt-8 flex flex-wrap gap-6 border-t border-ink/10 pt-8 text-[12px] uppercase tracking-[0.16em]">
        <Link href="/science/bifida-ferment-lysate" className="border-b border-ochre pb-0.5 text-ochre">
          Bifida Ferment Lysate, Explained →
        </Link>
        <Link href="/shop/recovery-masque" className="border-b border-ink/30 pb-0.5 text-ink/60">
          Shop Clarity Night Crème
        </Link>
      </div>
    </div>
  );
}
