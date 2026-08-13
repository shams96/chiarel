import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CHIAREL Ritual Guide: Day vs. Night Texture Explained",
  description:
    "Learn the official CHIAREL daily ritual. Discover why Terra Radiance Crème feels light for day and Recovery Masque feels richer at night — intentional barrier support, formulated by design.",
  alternates: { canonical: "/journal/chiarel-ritual-guide" },
};

const faqs = [
  {
    q: "Why does my CHIAREL night product feel heavier than the day crème?",
    a: "Recovery Masque™ is formulated with a richer, more occlusive profile to support overnight barrier recovery. The soft presence or cushion you feel is the intentional lipid film reducing water loss and holding actives against the skin while you rest. Terra Radiance Crème™ is designed lighter for daytime wearability under sunscreen and makeup.",
  },
  {
    q: "Is the richer texture of Recovery Masque™ normal?",
    a: "Yes. The presence is a deliberate feature of the overnight recovery formula, not a sign of excess product or poor absorption. Warm a small amount between fingertips and apply to damp skin for the smoothest integration.",
  },
  {
    q: "Can I use CHIAREL products around the eyes?",
    a: "A dedicated eye contour treatment is not currently part of the CHIAREL catalog. In the meantime, apply CHIAREL Essence™ and your day or night moisturizer carefully around the orbital bone with a lighter touch, avoiding the lash line.",
  },
  {
    q: "What is the correct order of the CHIAREL ritual?",
    a: "Cleanse with Cellular Cleanser™ → Tone with Cellular Mist™ → Treat with CHIAREL Essence™ → Moisturize with Terra Radiance Crème™ in the morning, or Recovery Masque™ in the evening.",
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

export default function RitualGuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <p className="eyebrow">Journal · The Ritual</p>
      <h1 className="mt-2 font-serif text-4xl leading-tight">
        How to Use the CHIAREL Daily Ritual
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink/75">
        The CHIAREL ritual is a five-step daily practice built for skin
        intelligence. Each step prepares the skin for the next — supporting
        clarity, resilience, and overnight recovery.
      </p>

      <section className="mt-12 grid gap-10 sm:grid-cols-2">
        <div>
          <p className="eyebrow">Morning Ritual</p>
          <ol className="mt-3 space-y-2 text-sm text-ink/80">
            <li>1. Cellular Cleanser™ — adaptive purifying cleanser</li>
            <li>2. Cellular Mist™ — conditioning preparation mist</li>
            <li>3. CHIAREL Essence™ — Signature Serum of the House</li>
            <li>4. Terra Radiance Crème™ — daytime radiance treatment</li>
          </ol>
        </div>
        <div>
          <p className="eyebrow">Evening Ritual</p>
          <ol className="mt-3 space-y-2 text-sm text-ink/80">
            <li>1. Cellular Cleanser™</li>
            <li>2. Cellular Mist™</li>
            <li>3. CHIAREL Essence™</li>
            <li>4. Recovery Masque™ — overnight recovery treatment</li>
          </ol>
        </div>
      </section>

      <section className="mt-14 border-t border-ink/10 pt-10">
        <h2 className="font-serif text-2xl">
          Why Day Crème and Night Masque Feel Different
        </h2>
        <div className="mt-5 space-y-5 text-sm leading-relaxed text-ink/75">
          <p>
            <strong className="text-ink">
              Terra Radiance Crème™ (Day):
            </strong>{" "}
            formulated as a lighter daily treatment. It supports radiance and
            the barrier while leaving a soft, wearable finish that layers
            comfortably under sunscreen and makeup.
          </p>
          <p>
            <strong className="text-ink">Recovery Masque™ (Night):</strong>{" "}
            an overnight recovery treatment with a richer, more occlusive
            character. The cushion or subtle sheen you feel is the lipid film
            at work — helping reduce overnight transepidermal water loss and
            supporting recovery while you sleep.
          </p>
          <p>
            This difference is by design, not inconsistency. Day formulas
            prioritize wearability; night formulas prioritize sustained
            barrier support. The richer texture of Recovery Masque™ is
            intentional formulation, not residue.
          </p>
        </div>
      </section>

      <section className="mt-14 border-t border-ink/10 pt-10">
        <h2 className="font-serif text-2xl">
          How to Apply Recovery Masque™ for Best Results
        </h2>
        <ul className="mt-5 space-y-2 text-sm text-ink/75">
          <li>· Use a small amount — approximately lentil-sized for the full face</li>
          <li>· Warm thoroughly between fingertips to improve spread</li>
          <li>· Press and smooth onto slightly damp skin after CHIAREL Essence™</li>
          <li>· Allow 15–30 minutes for the film to integrate</li>
          <li>· Wake to skin that feels supported and recovered</li>
        </ul>
      </section>

      <section className="mt-14 border-t border-ink/10 pt-10">
        <h2 className="font-serif text-2xl">Eye Area Guidance</h2>
        <p className="mt-4 text-sm leading-relaxed text-ink/75">
          A dedicated eye contour treatment is not yet part of the CHIAREL
          catalog. Until one is introduced, apply a small amount of CHIAREL
          Essence™ followed by Terra Radiance Crème™ (day) or Recovery
          Masque™ (night) carefully around the orbital bone — use a lighter
          touch and avoid the immediate lash line.
        </p>
      </section>

      <section className="mt-14 border-t border-ink/10 pt-10">
        <h2 className="font-serif text-2xl">Frequently Asked</h2>
        <dl className="mt-6 space-y-8">
          {faqs.map((f) => (
            <div key={f.q}>
              <dt className="font-serif text-lg">{f.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink/75">
                {f.a}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-16 flex flex-wrap gap-6 border-t border-ink/10 pt-10">
        <Link
          href="/shop/terra-radiance-creme"
          className="border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.16em] text-ochre"
        >
          Shop Terra Radiance Crème™
        </Link>
        <Link
          href="/shop/recovery-masque"
          className="border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.16em] text-ochre"
        >
          Shop Recovery Masque™
        </Link>
        <Link
          href="/assessment"
          className="border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.16em] text-ochre"
        >
          Take the Skin Assessment™
        </Link>
      </div>
    </div>
  );
}
