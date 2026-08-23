import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Presence Complex™: Extremolyte + Postbiotic + Amino Acid",
  description:
    "Presence Complex™ is CHIAREL's name for its lipid/occlusive delivery system — how Ectoine, Bifida Ferment Lysate, and L-Ornithine work together to produce sustained barrier, hydration, and resilience outcomes.",
  alternates: { canonical: "/science/synergy" },
};

const faqs = [
  {
    q: "What is Presence Complex™?",
    a: "Presence Complex™ is CHIAREL's name for its formulation and delivery system — the lipid/occlusive vehicle that combines Ectoine, Bifida Ferment Lysate, and L-Ornithine for sustained release. It names our formulation approach, not any individual ingredient.",
  },
  {
    q: "Why formulate with three actives instead of one 'hero' ingredient?",
    a: "Barrier resilience, hydration, and reactivity are three related but distinct functions. CHIAREL formulates for each mechanism separately — cellular water organization, barrier-protein support, NMF-level nourishment — then combines them inside one delivery vehicle rather than relying on a single ingredient to do everything.",
  },
  {
    q: "What is 'Presence'?",
    a: "Presence is the felt and measurable result of Presence Complex™: a cushioned, resilient, sustained finish rather than an immediate effect that fades. It describes an experience produced by the formulation system, not a proprietary ingredient.",
  },
  {
    q: "Does CHIAREL claim exclusive rights to Ectoine, Bifida Ferment Lysate, or L-Ornithine?",
    a: "No. These are established INCI ingredients used across the industry. Presence Complex™ names CHIAREL's specific formulation approach — the ratio, dosing, and lipid/occlusive delivery vehicle — not the ingredients themselves.",
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

export default function SynergyPage() {
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
        Presence Complex™
      </h1>
      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink/75">
        Three mechanisms, one delivery vehicle. Presence Complex™ is
        CHIAREL&rsquo;s name for this formulation system — the combination we
        formulate for, and the reason the result is more than the sum of its
        parts.
      </p>

      <section className="mt-12 space-y-6">
        <div className="flex gap-4">
          <span className="font-serif text-xl text-ochre">1</span>
          <p className="text-sm leading-relaxed text-ink/75">
            A protective lipid film that reduces water loss —{" "}
            <Link href="/science/lasting-hydration" className="border-b border-ochre text-ochre">
              the occlusive foundation
            </Link>
            .
          </p>
        </div>
        <div className="flex gap-4">
          <span className="font-serif text-xl text-ochre">2</span>
          <p className="text-sm leading-relaxed text-ink/75">
            Cellular-level water organization from Ectoine —{" "}
            <Link href="/science/ectoine" className="border-b border-ochre text-ochre">
              preferential hydration
            </Link>
            .
          </p>
        </div>
        <div className="flex gap-4">
          <span className="font-serif text-xl text-ochre">3</span>
          <p className="text-sm leading-relaxed text-ink/75">
            Active barrier-protein support from Bifida Ferment Lysate —{" "}
            <Link href="/science/bifida-ferment-lysate" className="border-b border-ochre text-ochre">
              the postbiotic layer
            </Link>
            .
          </p>
        </div>
        <div className="flex gap-4">
          <span className="font-serif text-xl text-ochre">4</span>
          <p className="text-sm leading-relaxed text-ink/75">
            Amino-acid-level nourishment from L-Ornithine —{" "}
            <Link href="/science/l-ornithine" className="border-b border-ochre text-ochre">
              the NMF layer
            </Link>
            .
          </p>
        </div>
        <div className="flex gap-4">
          <span className="font-serif text-xl text-ochre">5</span>
          <p className="text-sm leading-relaxed text-ink/75">
            Sustained delivery over hours, not minutes — the mechanism
            behind the signature Presence.
          </p>
        </div>
      </section>

      <div className="mt-14 border-l-2 border-ochre pl-6">
        <h2 className="font-serif text-2xl">What this produces</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
          A cushioned, resilient, long-lasting finish — the kind educated
          users can feel, and the kind formulation science can describe in
          terms of lower transepidermal water loss and improved barrier
          measures. Not a claim of ingredient exclusivity; a claim about how
          we formulate.
        </p>
      </div>

      <p className="mt-14 max-w-2xl text-[11px] leading-relaxed text-ink/45">
        Presence Complex™ is CHIAREL&rsquo;s name for its formulation and
        delivery approach, pending trademark clearance. Ectoine, Bifida
        Ferment Lysate, and L-Ornithine are established INCI ingredient
        names, not CHIAREL trademarks, and CHIAREL claims no exclusive
        rights over them. This page reflects published cosmetic-science
        understanding and is not a guarantee of individual results. Current
        product availability of individual actives is disclosed per SKU on
        each product page.
      </p>

      <div className="mt-8 flex flex-wrap gap-6 border-t border-ink/10 pt-8 text-[12px] uppercase tracking-[0.16em]">
        <Link href="/science/comparison" className="border-b border-ochre pb-0.5 text-ochre">
          How CHIAREL Compares →
        </Link>
        <Link href="/shop" className="border-b border-ink/30 pb-0.5 text-ink/60">
          Visit The Shop
        </Link>
      </div>
    </div>
  );
}
