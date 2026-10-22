import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CHIAREL Ritual Guide: Day vs. Night Texture Explained",
  description:
    "Learn the CHIAREL daily ritual. Discover why Clarity Day Crème feels light for day and Clarity Night Crème feels richer at night — intentional barrier support, formulated by design.",
  alternates: { canonical: "/journal/chiarel-ritual-guide" },
};

const faqs = [
  {
    q: "Why does my CHIAREL night product feel heavier than the day crème?",
    a: "Clarity Night Crème is formulated with a richer, more occlusive profile to support overnight barrier recovery. The soft presence or cushion you feel is the intentional lipid film reducing water loss and holding actives against the skin while you rest. Clarity Day Crème is designed lighter for daytime wearability under sunscreen and makeup.",
  },
  {
    q: "Is the richer texture of Clarity Night Crème normal?",
    a: "Yes. The presence is a deliberate feature of the overnight recovery formula, not a sign of excess product or poor absorption. Warm a small amount between fingertips and apply to damp skin for the smoothest integration.",
  },
  {
    q: "Can I use CHIAREL products around the eyes?",
    a: "Yes — Clarity Eye Contour Concentrate is formulated specifically for the eye contour. It is made for the evening, and it may be used morning or night. Avoid layering the day or night crème over it at the lash line.",
  },
  {
    q: "What is the correct order of the CHIAREL ritual?",
    a: "Mornings: Clarity Essence → Clarity Day Crème, then SPF. Evenings: Clarity Essence → Clarity Eye Contour Concentrate → Clarity Night Crème → Clarity Neck & Décolleté Crème. Order follows the texture, lightest first.",
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

      <Link href="/journal" className="text-[12px] text-ink/65 hover:text-ochre">
        ← Journal
      </Link>
      <h1 className="mt-2 font-serif text-4xl leading-tight">
        How to Use the CHIAREL Ritual
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink/75">
        The CHIAREL ritual is five products across two moments in the day:
        prepare for it, then let it go. Order follows the texture, lightest
        first.
      </p>

      <section className="mt-12 grid gap-10 sm:grid-cols-2">
        <div>
          <h3 className="font-serif text-lg">Morning ritual</h3>
          <ol className="mt-3 space-y-2 text-sm text-ink/80">
            <li>1. Clarity Essence</li>
            <li>2. Clarity Day Crème — follow with SPF</li>
          </ol>
        </div>
        <div>
          <h3 className="font-serif text-lg">Evening ritual</h3>
          <ol className="mt-3 space-y-2 text-sm text-ink/80">
            <li>1. Clarity Essence</li>
            <li>2. Clarity Eye Contour Concentrate — may be used morning or night</li>
            <li>3. Clarity Night Crème</li>
            <li>4. Clarity Neck &amp; Décolleté Crème</li>
          </ol>
        </div>
      </section>

      <section className="mt-14 border-t border-ink/10 pt-10">
        <h2 className="font-serif text-2xl">
          Why Day Crème and Night Crème Feel Different
        </h2>
        <div className="mt-5 space-y-5 text-sm leading-relaxed text-ink/75">
          <p>
            <strong className="text-ink">
              Clarity Day Crème (Day):
            </strong>{" "}
            formulated as a lighter daily treatment. It supports radiance and
            the barrier while leaving a soft, wearable finish that layers
            comfortably under sunscreen and makeup.
          </p>
          <p>
            <strong className="text-ink">Clarity Night Crème (Night):</strong>{" "}
            an overnight recovery treatment with a richer, more occlusive
            character. The cushion or subtle sheen you feel is the lipid film
            at work — helping reduce overnight transepidermal water loss and
            supporting recovery while you sleep.
          </p>
          <p>
            This difference is by design, not inconsistency. Day formulas
            prioritize wearability; night formulas prioritize sustained
            barrier support. The richer texture of Clarity Night Crème is
            intentional formulation, not residue.
          </p>
        </div>
      </section>

      <section className="mt-14 border-t border-ink/10 pt-10">
        <h2 className="font-serif text-2xl">
          How to Apply Clarity Night Crème for Best Results
        </h2>
        <ul className="mt-5 space-y-2 text-sm text-ink/75">
          <li>· Use a small amount — approximately lentil-sized for the full face</li>
          <li>· Warm thoroughly between fingertips to improve spread</li>
          <li>· Press and smooth onto slightly damp skin after Clarity Essence</li>
          <li>· Allow 15–30 minutes for the film to integrate</li>
          <li>· Wake to skin that feels supported and recovered</li>
        </ul>
      </section>

      <section className="mt-14 border-t border-ink/10 pt-10">
        <h2 className="font-serif text-2xl">Eye Area Guidance</h2>
        <p className="mt-4 text-sm leading-relaxed text-ink/75">
          Clarity Eye Contour Concentrate is formulated for the delicate eye
          area. It sits in the evening ritual, right after Clarity Essence, and
          may be used morning or night. Use a light touch around the orbital
          bone — avoid the immediate lash line.
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
          Shop Clarity Day Crème
        </Link>
        <Link
          href="/shop/recovery-masque"
          className="border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.16em] text-ochre"
        >
          Shop Clarity Night Crème
        </Link>
        <Link
          href="/shop/n1-neck-decollete"
          className="border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.16em] text-ochre"
        >
          Discover Clarity Neck &amp; Décolleté Crème
        </Link>
        <Link
          href="/shop/eye-contour-concentrate"
          className="border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.16em] text-ochre"
        >
          Shop Clarity Eye Contour Concentrate
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
