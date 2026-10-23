import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "L-Ornithine, Explained",
  description:
    "What L-Ornithine is, its role in the skin's Natural Moisturising Factor, and where CHIAREL uses it: Clarity Night Crème only. A transparent, third-person explainer.",
  alternates: { canonical: "/science/l-ornithine" },
};

const faqs = [
  {
    q: "What is L-Ornithine?",
    a: "L-Ornithine is an amino acid and a natural component of skin's Natural Moisturising Factor (NMF). It is an established ingredient, not a CHIAREL-exclusive ingredient.",
  },
  {
    q: "What does it do for skin?",
    a: "It is used here for the look and feel of soft, hydrated skin.",
  },
  {
    q: "Which CHIAREL product contains it?",
    a: "Clarity Night Crème only, alongside bakuchiol, peptides and niacinamide, for the look of smoother texture overnight.",
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
            Moisturising Factor (NMF) — the mix of small molecules the
            skin itself produces.
          </p>
        </div>
        <div className="border-l-2 border-champagne pl-6">
          <h2 className="font-serif text-2xl">How it works</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            Used in Clarity Night Crème for the look and feel of soft,
            hydrated skin.
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
            Found in Clarity Night Crème only, alongside bakuchiol, peptides and
            niacinamide, for the look of smoother texture overnight. See{" "}
            <Link href="/science" className="border-b border-ochre text-ochre">
              The Science
            </Link>
            .
          </p>
        </div>
      </section>

      <p className="mt-14 max-w-2xl text-[11px] leading-relaxed text-ink/65">
        L-Ornithine is an ingredient name, not a CHIAREL trademark. This
        page is an educational reference and is not a guarantee of individual
        results.
      </p>

      <div className="mt-8 flex flex-wrap gap-6 border-t border-ink/10 pt-8 text-[12px] uppercase tracking-[0.16em]">
        <Link href="/science/bifida-ferment-lysate" className="border-b border-ochre pb-0.5 text-ochre">
          Bifida Ferment Lysate, Explained →
        </Link>
        <Link href="/shop/clarity-night-creme" className="border-b border-ink/30 pb-0.5 text-ink/60">
          Shop Clarity Night Crème
        </Link>
      </div>
    </div>
  );
}
