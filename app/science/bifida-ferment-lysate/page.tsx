import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bifida Ferment Lysate, Explained",
  description:
    "What Bifida Ferment Lysate is, how it supports barrier proteins and microbiome balance, and how CHIAREL formulates with it. A transparent, third-person explainer.",
  alternates: { canonical: "/science/bifida-ferment-lysate" },
};

const faqs = [
  {
    q: "What is Bifida Ferment Lysate?",
    a: "Bifida Ferment Lysate is a postbiotic — the lysate of fermented Bifidobacterium species. It is an established INCI ingredient used across cosmetic formulation, not a CHIAREL-exclusive ingredient.",
  },
  {
    q: "What does a postbiotic do for skin?",
    a: "Postbiotics are studied for their role in supporting the skin's surface microbiome balance and, in the case of this lysate, for upregulating barrier proteins such as filaggrin, involucrin, and tight-junction components.",
  },
  {
    q: "Is this different from a probiotic?",
    a: "Yes. A probiotic is a live microorganism; a postbiotic like a ferment lysate is the (non-living) byproduct of fermentation — often better suited to shelf-stable formulation.",
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

export default function BifidaPage() {
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
        Bifida Ferment Lysate, Explained
      </h1>
      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink/75">
        A postbiotic with a specific, studied role: supporting the proteins
        that hold the skin barrier together. Explained here in the third
        person, as an educational reference.
      </p>

      <section className="mt-12 space-y-10">
        <div className="border-l-2 border-champagne pl-6">
          <h2 className="font-serif text-2xl">What it is</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            A postbiotic lysate derived from fermented Bifidobacterium — a
            genus long studied for its role in the gut and, increasingly, in
            skin microbiome research. Widely used across cosmetic
            formulation.
          </p>
        </div>
        <div className="border-l-2 border-champagne pl-6">
          <h2 className="font-serif text-2xl">How it works</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            Studied for its role in upregulating barrier proteins —
            filaggrin, involucrin, and tight-junction components — and
            modulating inflammatory signaling associated with reactivity.
          </p>
          <p className="mt-3 text-[12px] text-ink/50">
            Source:{" "}
            <a
              href="https://pubmed.ncbi.nlm.nih.gov/?term=bifidobacterium+ferment+lysate+skin"
              target="_blank"
              rel="noopener noreferrer"
              className="border-b border-ink/30 hover:border-ochre hover:text-ochre"
            >
              Published research on Bifidobacterium ferment lysate and skin barrier proteins, PubMed (NIH)
            </a>
          </p>
        </div>
        <div className="border-l-2 border-champagne pl-6">
          <h2 className="font-serif text-2xl">Associated outcomes</h2>
          <ul className="mt-2 max-w-xl list-disc space-y-1 pl-5 text-sm leading-relaxed text-ink/70">
            <li>Stronger, more cohesive barrier</li>
            <li>Reduced sensitivity and reactivity</li>
            <li>Improved moisture retention and recovery</li>
          </ul>
        </div>
        <div className="border-l-2 border-ochre pl-6">
          <h2 className="font-serif text-2xl">How CHIAREL formulates with it</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            Delivered inside our occlusive vehicle, which is designed to
            protect the newly reinforced barrier while the postbiotic works
            underneath. See{" "}
            <Link href="/science/barrier-resilience" className="border-b border-ochre text-ochre">
              Barrier Resilience
            </Link>{" "}
            for the full mechanism.
          </p>
        </div>
      </section>

      <p className="mt-14 max-w-2xl text-[11px] leading-relaxed text-ink/45">
        Bifida Ferment Lysate is an INCI ingredient name, not a CHIAREL
        trademark. This page reflects published cosmetic-science
        understanding of the ingredient category and is not a guarantee of
        individual results.
      </p>

      <div className="mt-8 flex flex-wrap gap-6 border-t border-ink/10 pt-8 text-[12px] uppercase tracking-[0.16em]">
        <Link href="/science/l-ornithine" className="border-b border-ochre pb-0.5 text-ochre">
          L-Ornithine, Explained →
        </Link>
        <Link href="/shop/recovery-masque" className="border-b border-ink/30 pb-0.5 text-ink/60">
          Shop Recovery Masque™
        </Link>
      </div>
    </div>
  );
}
