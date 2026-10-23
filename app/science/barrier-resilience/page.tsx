import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Building a More Resilient Skin Barrier",
  description:
    "How ceramides, cholesterol and squalane work together in Clarity Day Crème, Clarity Night Crème and Clarity Neck & Décolleté Crème, for the look and feel of comfortable, cushioned skin.",
  alternates: { canonical: "/science/barrier-resilience" },
};

const faqs = [
  {
    q: "What does 'barrier resilience' actually mean?",
    a: "The skin barrier is the outermost lipid layer between your skin and the world. We use the word for skin that looks and feels comfortable under the daily load of Modern Biological Stress™: dry indoor air, screens, commutes and too little sleep.",
  },
  {
    q: "Does CHIAREL claim exclusive rights to these ingredients?",
    a: "No. Ceramides, cholesterol and squalane are established ingredients used across the skincare industry. CHIAREL does not claim ownership or exclusivity over any ingredient, only the way we formulate with them.",
  },
  {
    q: "Which CHIAREL products use them?",
    a: "Clarity Day Crème pairs ceramides with cholesterol and squalane. Clarity Night Crème carries ceramide NP, cholesterol and squalane. Clarity Neck & Décolleté Crème pairs copper peptide with ceramides and squalane.",
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
        formulates for the look of comfortable, cushioned skin through it,
        using the lipids skin already knows.
      </p>

      <section className="mt-12 space-y-10">
        <div className="border-l-2 border-champagne pl-6">
          <h2 className="font-serif text-2xl">Ceramides</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            Ceramides are lipids found between skin cells. Clarity Day Crème
            carries ceramide NP, AP and EOP, for the look and feel of
            comfortable, hydrated skin. Clarity Night Crème carries ceramide NP.
          </p>
        </div>
        <div className="border-l-2 border-champagne pl-6">
          <h2 className="font-serif text-2xl">Cholesterol and squalane</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            Cholesterol is another of skin&rsquo;s own lipids. Squalane is a
            lightweight, skin-compatible emollient. Together with the
            ceramides they give the crèmes a cushioned, comfortable finish.
          </p>
        </div>
        <div className="border-l-2 border-champagne pl-6">
          <h2 className="font-serif text-2xl">Niacinamide</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            Niacinamide is chosen for the look of an even, healthy surface.
            It is in all five products: Clarity Essence, Clarity Day Crème,
            Clarity Night Crème, Clarity Neck &amp; Décolleté Crème and
            Clarity Eye Contour Concentrate.
          </p>
        </div>
        <div className="border-l-2 border-ochre pl-6">
          <h2 className="font-serif text-2xl">For the neck and chest</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            Clarity Neck &amp; Décolleté Crème pairs copper peptide with
            ceramides and squalane, for the look of smoother, more hydrated
            skin on the neck and chest.
          </p>
        </div>
      </section>

      <p className="mt-14 max-w-2xl text-[11px] leading-relaxed text-ink/65">
        Ceramides, cholesterol and squalane are established ingredients, not
        CHIAREL trademarks or proprietary technologies. This page
        describes how CHIAREL formulates and is not a guarantee of individual
        results.
      </p>

      <div className="mt-8 flex flex-wrap gap-6 border-t border-ink/10 pt-8 text-[12px] uppercase tracking-[0.16em]">
        <Link href="/science/lasting-hydration" className="border-b border-ochre pb-0.5 text-ochre">
          Lasting Hydration →
        </Link>
        <Link href="/shop" className="border-b border-ink/30 pb-0.5 text-ink/60">
          Visit The Shop
        </Link>
      </div>
    </div>
  );
}
