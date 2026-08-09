import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Building a More Resilient Skin Barrier — CHIAREL™",
  description:
    "How preferential hydration, postbiotic barrier-protein support, and amino acid nourishment work inside CHIAREL's occlusive delivery system to support barrier resilience.",
  alternates: { canonical: "/science/barrier-resilience" },
};

const faqs = [
  {
    q: "What does 'barrier resilience' actually mean?",
    a: "The skin barrier is the outermost lipid matrix that controls water loss and resists environmental stress. Resilience refers to how well that matrix holds up and recovers under daily stressors — not a cosmetic effect like glow or plumpness.",
  },
  {
    q: "Does CHIAREL claim exclusive rights to these ingredients?",
    a: "No. Ectoine, Bifida Ferment Lysate, and L-Ornithine are established INCI ingredients used across the skincare industry. CHIAREL does not claim ownership or exclusivity over any ingredient name — our formulation approach and delivery system are what we describe and stand behind.",
  },
  {
    q: "How is barrier support measured?",
    a: "Common formulation-stage measures include transepidermal water loss (TEWL) and corneometry. These describe how an ingredient or formula is understood to work in published research — not a guarantee of individual results.",
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

export default function BarrierResiliencePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <p className="eyebrow">The Science</p>
      <h1 className="mt-2 font-serif text-4xl leading-tight">
        Building a More Resilient Skin Barrier
      </h1>
      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink/75">
        A resilient barrier is a functional outcome, not a marketing word. It
        means lower water loss under stress, a lipid matrix that holds
        together, and skin that recovers rather than reacts. CHIAREL
        formulates for this outcome by combining three well-studied
        mechanisms inside a laboratory-formulated occlusive vehicle.
      </p>

      <section className="mt-12 space-y-10">
        <div className="border-l-2 border-champagne pl-6">
          <h2 className="font-serif text-2xl">Preferential hydration</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            Ectoine is an extremolyte — a molecule organisms use to survive
            extreme dehydration and stress. In formulation, it is understood
            to form a preferential hydration shell around proteins and cell
            membranes, stabilizing them against water loss, UV, and pollution
            exposure without penetrating deeply.
          </p>
        </div>
        <div className="border-l-2 border-champagne pl-6">
          <h2 className="font-serif text-2xl">Barrier-protein support</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            Bifida Ferment Lysate is a postbiotic lysate studied for its role
            in upregulating barrier proteins — filaggrin, involucrin,
            tight-junction components — and supporting a balanced surface
            microbiome. The result researchers describe: a more cohesive
            barrier and reduced sensitivity over time.
          </p>
        </div>
        <div className="border-l-2 border-champagne pl-6">
          <h2 className="font-serif text-2xl">Amino acid nourishment</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            L-Ornithine is an amino acid component of skin&rsquo;s Natural
            Moisturizing Factor, linked to the urea cycle and polyamine
            pathways involved in barrier maintenance. It contributes to the
            hydration-feel and texture side of barrier support.
          </p>
        </div>
        <div className="border-l-2 border-ochre pl-6">
          <h2 className="font-serif text-2xl">Why the delivery vehicle matters</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            None of these mechanisms works in isolation. CHIAREL formulates
            them inside a lipid/occlusive vehicle designed for sustained
            release — the film slows evaporation while the actives work
            underneath, rather than sitting on the surface and evaporating
            with the water they arrived in.
          </p>
        </div>
      </section>

      <p className="mt-14 max-w-2xl text-[11px] leading-relaxed text-ink/45">
        Ectoine, Bifida Ferment Lysate, and L-Ornithine are established INCI
        ingredient names, not CHIAREL trademarks or proprietary technologies.
        Mechanism descriptions reflect published cosmetic-science
        understanding of these ingredient categories and describe how
        CHIAREL formulates — not individual guaranteed results.
      </p>

      <div className="mt-8 flex flex-wrap gap-6 border-t border-ink/10 pt-8 text-[12px] uppercase tracking-[0.16em]">
        <Link href="/science/lasting-hydration" className="border-b border-ochre pb-0.5 text-ochre">
          Controlled, Long-Lasting Hydration →
        </Link>
        <Link href="/science/comparison" className="border-b border-ink/30 pb-0.5 text-ink/60">
          How CHIAREL Compares
        </Link>
        <Link href="/shop" className="border-b border-ink/30 pb-0.5 text-ink/60">
          Visit The Shop
        </Link>
      </div>
    </div>
  );
}
