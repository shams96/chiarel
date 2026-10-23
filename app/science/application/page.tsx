import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Apply CHIAREL",
  description:
    "Application technique matters as much as formulation. The morning and evening order for all five Clarity products, from lightest texture to richest.",
  alternates: { canonical: "/science/application" },
};

const faqs = [
  {
    q: "Does application technique really change the result?",
    a: "Yes. Applying to slightly damp skin and giving each layer a moment to settle helps the formula spread evenly and feel comfortable.",
  },
  {
    q: "How much product should I use?",
    a: "A pea-sized amount for Clarity Essence; a small amount warmed between fingertips for Clarity Day Crème, Clarity Night Crème or Clarity Neck & Décolleté Crème. More product is not better — even distribution matters more than volume.",
  },
  {
    q: "In what order do I apply the products?",
    a: "Morning: Clarity Essence, then Clarity Day Crème, then SPF. Evening: Clarity Essence, Clarity Eye Contour Concentrate, Clarity Night Crème, then Clarity Neck & Décolleté Crème. Clarity Eye Contour Concentrate is made for the evening and may be used morning or night.",
  },
  {
    q: "Should I wait between steps?",
    a: "A brief pause (10 to 30 seconds) between steps lets each layer settle before the next is applied.",
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

      <Link href="/science" className="text-[12px] text-ink/65 hover:text-ochre">
        ← The Science
      </Link>
      <h1 className="mt-2 font-serif text-4xl leading-tight">
        How to Apply CHIAREL
      </h1>
      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink/75">
        A formula feels its best when it is applied with care. Technique is
        part of the formulation story, not a footnote.
      </p>

      <section className="mt-12 grid gap-10 sm:grid-cols-2">
        <div>
          <h2 className="font-serif text-2xl">Morning</h2>
          <ol className="mt-3 space-y-2 text-sm text-ink/80">
            <li>1. Clarity Essence</li>
            <li>2. Clarity Day Crème</li>
            <li>3. SPF</li>
          </ol>
        </div>
        <div>
          <h2 className="font-serif text-2xl">Evening</h2>
          <ol className="mt-3 space-y-2 text-sm text-ink/80">
            <li>1. Clarity Essence</li>
            <li>2. Clarity Eye Contour Concentrate</li>
            <li>3. Clarity Night Crème</li>
            <li>4. Clarity Neck &amp; Décolleté Crème</li>
          </ol>
          <p className="mt-3 text-[12px] text-ink/65">
            The eye product is made for the evening and may be used morning or
            night.
          </p>
        </div>
      </section>

      <section className="mt-12 space-y-8">
        <div className="border-l-2 border-champagne pl-6">
          <h2 className="font-serif text-2xl">Apply to damp skin</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            Damp skin helps the formula spread evenly and feel comfortable.
          </p>
        </div>
        <div className="border-l-2 border-champagne pl-6">
          <h2 className="font-serif text-2xl">Warm before applying</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            Warm Clarity Day Crème, Clarity Night Crème or Clarity Neck
            &amp; Décolleté Crème between fingertips before pressing into
            skin — this softens the texture for smoother, more even
            distribution.
          </p>
        </div>
        <div className="border-l-2 border-champagne pl-6">
          <h2 className="font-serif text-2xl">Press, don&rsquo;t rub</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            Pressing helps the formula settle into place without tugging at
            skin.
          </p>
        </div>
        <div className="border-l-2 border-ochre pl-6">
          <h2 className="font-serif text-2xl">Let each step set</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            A brief pause between the{" "}
            <Link href="/shop/clarity-essence" className="border-b border-ochre text-ochre">
              Essence
            </Link>{" "}
            step and each crème step lets each layer settle before the next is
            added.
          </p>
        </div>
      </section>

      <p className="mt-14 max-w-2xl text-[11px] leading-relaxed text-ink/65">
        Application guidance reflects general formulation principles and is
        not a guarantee of individual results.
      </p>

      <div className="mt-8 flex flex-wrap gap-6 border-t border-ink/10 pt-8 text-[12px] uppercase tracking-[0.16em]">
        <Link href="/ritual" className="border-b border-ochre pb-0.5 text-ochre">
          The Ritual →
        </Link>
        <Link href="/journal/chiarel-ritual-guide" className="border-b border-ink/30 pb-0.5 text-ink/60">
          Full Ritual Guide
        </Link>
      </div>
    </div>
  );
}
