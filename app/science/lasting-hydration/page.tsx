import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Beyond Surface Moisture: Controlled, Long-Lasting Hydration — CHIAREL™",
  description:
    "Why CHIAREL formulates for stable, sustained hydration — preferential hydration plus occlusion — instead of surface-level moisture that fades within the hour.",
  alternates: { canonical: "/science/lasting-hydration" },
};

const faqs = [
  {
    q: "Why does moisturized skin sometimes feel tight again within hours?",
    a: "Many humectant-only formulas draw water to the skin's surface but have no mechanism to hold it there. As that water evaporates, skin can feel tight again — sometimes called the 'dry-down' cycle. Pairing a humectant/extremolyte with an occlusive vehicle addresses both sides: drawing and holding.",
  },
  {
    q: "Is Ectoine a humectant?",
    a: "Not in the traditional sense. Ectoine is an extremolyte studied for organizing water at the cellular level around proteins and membranes — a different mechanism than glycerin or hyaluronic acid, which primarily draw water to the surface.",
  },
  {
    q: "Does CHIAREL claim its hydration is better than every competitor's?",
    a: "No efficacy comparison claim is made. CHIAREL describes its own formulation mechanism transparently — combining preferential hydration with occlusion — and lets that description speak for the approach.",
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

export default function LastingHydrationPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <p className="eyebrow">The Science</p>
      <h1 className="mt-2 font-serif text-4xl leading-tight">
        Beyond Surface Moisture
      </h1>
      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink/75">
        Hydration that fades within the hour is a formulation gap, not an
        inevitability. CHIAREL formulates for stable, controlled hydration by
        pairing cellular-level water organization with an occlusive vehicle
        that holds it in place.
      </p>

      <section className="mt-12 space-y-10">
        <div className="border-l-2 border-champagne pl-6">
          <h2 className="font-serif text-2xl">The humectant-only gap</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            Traditional humectants draw water to the skin&rsquo;s surface.
            Without something to hold it there, that water evaporates —
            often taking surface moisture with it and leaving skin tighter
            than before application.
          </p>
        </div>
        <div className="border-l-2 border-champagne pl-6">
          <h2 className="font-serif text-2xl">Preferential hydration, explained</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            Ectoine is understood in published research to organize water
            around proteins and cell membranes rather than simply pulling
            water to the surface — a structural, cellular-level effect
            distinct from a standard humectant.
          </p>
        </div>
        <div className="border-l-2 border-ochre pl-6">
          <h2 className="font-serif text-2xl">Occlusion completes the mechanism</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            CHIAREL&rsquo;s lipid/occlusive vehicle slows evaporation at the
            surface while Ectoine organizes water beneath it — the pairing
            is designed to produce more stable, longer-lasting hydration than
            either mechanism alone.
          </p>
        </div>
        <div className="border-l-2 border-champagne pl-6">
          <h2 className="font-serif text-2xl">What this feels like</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            A cushioned, sustained finish rather than an immediate then-fading
            effect — what we call Presence. See{" "}
            <Link href="/science" className="border-b border-ochre text-ochre">
              The Science
            </Link>{" "}
            for how this shows up across the full ritual.
          </p>
        </div>
      </section>

      <p className="mt-14 max-w-2xl text-[11px] leading-relaxed text-ink/45">
        Ectoine is an established INCI ingredient, not a CHIAREL trademark or
        proprietary technology. Mechanism descriptions reflect published
        cosmetic-science understanding and describe CHIAREL&rsquo;s
        formulation approach — not a guarantee of individual results.
      </p>

      <div className="mt-8 flex flex-wrap gap-6 border-t border-ink/10 pt-8 text-[12px] uppercase tracking-[0.16em]">
        <Link href="/science/barrier-resilience" className="border-b border-ochre pb-0.5 text-ochre">
          Barrier Resilience →
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
