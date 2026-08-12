import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Apply for Maximum Presence & Results",
  description:
    "Application technique matters as much as formulation. How to apply CHIAREL Essence™ and Terra Radiance Crème™ or Recovery Masque™ to get the full sustained-delivery effect.",
  alternates: { canonical: "/science/application" },
};

const faqs = [
  {
    q: "Does application technique really change the result?",
    a: "Yes. A sustained-release occlusive vehicle depends on being applied to slightly damp skin and given a moment to set — applying to fully dry skin or immediately layering another product can interrupt the film before it forms.",
  },
  {
    q: "How much product should I use?",
    a: "A pea-sized amount for CHIAREL Essence™; a small amount warmed between fingertips for Terra Radiance Crème™ or Recovery Masque™. More product does not equal more Presence — even distribution matters more than volume.",
  },
  {
    q: "Should I wait between steps?",
    a: "A brief pause (10-30 seconds) between the Essence and the moisturizer step allows each layer to begin setting before the next is applied.",
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

export default function ApplicationPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <p className="eyebrow">The Science · The Presence</p>
      <h1 className="mt-2 font-serif text-4xl leading-tight">
        How to Apply for Maximum Presence
      </h1>
      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink/75">
        A sustained-delivery formula only performs as designed when it is
        applied correctly. Technique is part of the formulation story, not a
        footnote.
      </p>

      <section className="mt-12 space-y-8">
        <div className="border-l-2 border-champagne pl-6">
          <h2 className="font-serif text-2xl">Apply to damp skin</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            Damp skin helps the occlusive film integrate evenly rather than
            sitting on top of fully dry surface cells.
          </p>
        </div>
        <div className="border-l-2 border-champagne pl-6">
          <h2 className="font-serif text-2xl">Warm before applying</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            Warm Terra Radiance Crème™ or Recovery Masque™ between
            fingertips before pressing into skin — this softens the lipid
            vehicle for smoother, more even distribution.
          </p>
        </div>
        <div className="border-l-2 border-champagne pl-6">
          <h2 className="font-serif text-2xl">Press, don&rsquo;t rub</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            Pressing helps the film settle into place; rubbing can disturb it
            before it has set.
          </p>
        </div>
        <div className="border-l-2 border-ochre pl-6">
          <h2 className="font-serif text-2xl">Let each step set</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            A brief pause between the{" "}
            <Link href="/shop/chiarel-essence" className="border-b border-ochre text-ochre">
              Essence
            </Link>{" "}
            step and the moisturizer step lets each layer begin forming its
            film before the next is added.
          </p>
        </div>
      </section>

      <p className="mt-14 max-w-2xl text-[11px] leading-relaxed text-ink/45">
        Application guidance reflects general formulation-science principles
        for occlusive/sustained-release vehicles and is not a guarantee of
        individual results.
      </p>

      <div className="mt-8 flex flex-wrap gap-6 border-t border-ink/10 pt-8 text-[12px] uppercase tracking-[0.16em]">
        <Link href="/science/synergy" className="border-b border-ochre pb-0.5 text-ochre">
          The Synergy →
        </Link>
        <Link href="/journal/chiarel-ritual-guide" className="border-b border-ink/30 pb-0.5 text-ink/60">
          Full Ritual Guide
        </Link>
      </div>
    </div>
  );
}
