import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Building a More Resilient Skin Barrier",
  description:
    "How ceramides, cholesterol and squalane work together in Clarity Day Crème and Clarity Neck & Décolleté Crème to help skin feel comfortable and cushioned through a demanding day.",
  alternates: { canonical: "/science/barrier-resilience" },
};

const faqs = [
  {
    q: "What does 'barrier resilience' actually mean?",
    a: "The skin barrier is the outermost lipid matrix that controls water loss and resists environmental stress. Resilience refers to how well that matrix holds up under the daily load of Modern Biological Stress™ — dry indoor air, screens, commutes and too little sleep.",
  },
  {
    q: "Does CHIAREL claim exclusive rights to these ingredients?",
    a: "No. Ceramides, cholesterol and squalane are established INCI ingredients used across the skincare industry. CHIAREL does not claim ownership or exclusivity over any ingredient name — our formulation approach is what we describe and stand behind.",
  },
  {
    q: "Which CHIAREL formulations use them?",
    a: "Clarity Day Crème pairs three ceramides with cholesterol and squalane. Clarity Neck & Décolleté Crème pairs copper peptide with ceramides and squalane.",
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

      <Link href="/science" className="text-[12px] text-ink/65 hover:text-ochre">
        ← The Science
      </Link>
      <h1 className="mt-2 font-serif text-4xl leading-tight">
        Building a More Resilient Skin Barrier
      </h1>
      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink/75">
        A working woman&rsquo;s day asks a great deal of her skin. CHIAREL
        formulates for skin that feels comfortable and cushioned through it,
        using the lipids skin already recognises.
      </p>

      <section className="mt-12 space-y-10">
        <div className="border-l-2 border-champagne pl-6">
          <h2 className="font-serif text-2xl">Ceramides</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            Ceramides are lipids that sit between skin cells and help hold
            the surface together. Clarity Day Crème carries three of them to
            help skin feel comfortable and hydrated.
          </p>
        </div>
        <div className="border-l-2 border-champagne pl-6">
          <h2 className="font-serif text-2xl">Cholesterol and squalane</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            Cholesterol is another of skin&rsquo;s own barrier lipids.
            Squalane is a lightweight, skin-compatible emollient. Together
            with the ceramides they give the crème a cushioned, comfortable
            finish.
          </p>
        </div>
        <div className="border-l-2 border-champagne pl-6">
          <h2 className="font-serif text-2xl">Niacinamide</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            Niacinamide supports the look of an even, healthy surface.
          </p>
        </div>
        <div className="border-l-2 border-ochre pl-6">
          <h2 className="font-serif text-2xl">For the neck and chest</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            Clarity Neck &amp; Décolleté Crème pairs copper peptide with
            ceramides and squalane, to smooth the look of crepey texture and
            keep the neck and chest hydrated.
          </p>
        </div>
      </section>

      <p className="mt-14 max-w-2xl text-[11px] leading-relaxed text-ink/65">
        Ceramides, cholesterol and squalane are established INCI ingredient
        names, not CHIAREL trademarks or proprietary technologies. This page
        describes how CHIAREL formulates and is not a guarantee of individual
        results.
      </p>

      <div className="mt-8 flex flex-wrap gap-6 border-t border-ink/10 pt-8 text-[12px] uppercase tracking-[0.16em]">
        <Link href="/science/lasting-hydration" className="border-b border-ochre pb-0.5 text-ochre">
          Lasting Hydration →
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
