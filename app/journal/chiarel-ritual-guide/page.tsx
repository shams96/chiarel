import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Use the CHIAREL Daily Ritual",
  description:
    "The CHIAREL daily ritual in five products: Clarity Essence, Clarity Day Crème and SPF in the morning; Essence, Eye Contour Concentrate, Night Crème and Neck & Décolleté Crème in the evening. Lightest texture first.",
  alternates: { canonical: "/journal/chiarel-ritual-guide" },
};

const faqs = [
  {
    q: "Why does my CHIAREL night product feel richer than the day crème?",
    a: "Clarity Night Crème has a richer texture than Clarity Day Crème, made for the evening when there is no sunscreen or makeup to layer under. Clarity Day Crème is lighter, for daytime wear under SPF and makeup. The cushioned feel of the Night Crème is the texture, not excess product.",
  },
  {
    q: "How much Clarity Night Crème should I use?",
    a: "A small amount. Warm it between fingertips and press it onto slightly damp skin after the Essence, for the smoothest finish.",
  },
  {
    q: "Can I use CHIAREL products around the eyes?",
    a: "Yes. Clarity Eye Contour Concentrate is formulated for the eye contour. It is made for the evening and may be used morning or night. Keep the crèmes away from the lash line.",
  },
  {
    q: "What is the correct order of the CHIAREL ritual?",
    a: "Morning: Clarity Essence, then Clarity Day Crème, then SPF. Evening: Clarity Essence, Clarity Eye Contour Concentrate, Clarity Night Crème, then Clarity Neck & Décolleté Crème. Order follows the texture, lightest first.",
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
    <div className="mx-auto w-full max-w-3xl px-margin py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Link href="/journal" className="text-[12px] text-ink/65 hover:text-ochre">
        ← Journal
      </Link>
      <h1 className="mt-2 font-serif text-h1 leading-tight">
        How to Use the CHIAREL Daily Ritual
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
            <li>2. Clarity Day Crème</li>
            <li>3. SPF</li>
          </ol>
        </div>
        <div>
          <h3 className="font-serif text-lg">Evening ritual</h3>
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

      <section className="mt-14 border-t border-ink/10 pt-10">
        <h2 className="font-serif text-2xl">
          Why Day Crème and Night Crème Feel Different
        </h2>
        <div className="mt-5 space-y-5 text-sm leading-relaxed text-ink/75">
          <p>
            <strong className="text-ink">
              Clarity Day Crème (Day):
            </strong>{" "}
            a lighter daily crème, for the look of comfortable, hydrated skin.
            It leaves a soft, wearable finish that layers comfortably under
            sunscreen and makeup.
          </p>
          <p>
            <strong className="text-ink">Clarity Night Crème (Night):</strong>{" "}
            an evening crème with a richer texture. The cushion or subtle
            sheen you feel is the texture of the crème itself, made for the
            look of smoother, more hydrated skin by morning.
          </p>
          <p>
            This difference is by design, not inconsistency. The day crème
            prioritises wearability; the night crème is made richer. The
            texture of Clarity Night Crème is intentional formulation, not
            residue.
          </p>
        </div>
      </section>

      <section className="mt-14 border-t border-ink/10 pt-10">
        <h2 className="font-serif text-2xl">
          How to Apply Clarity Night Crème for Best Results
        </h2>
        <ul className="mt-5 space-y-2 text-sm text-ink/75">
          <li>· Use a small amount for the full face</li>
          <li>· Warm it between fingertips to improve spread</li>
          <li>· Press and smooth onto slightly damp skin, after Clarity Essence and Clarity Eye Contour Concentrate</li>
          <li>· Finish the neck and chest with Clarity Neck &amp; Décolleté Crème</li>
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
          href="/shop/clarity-day-creme"
          className="border-b border-ochre pb-0.5 text-eyebrow uppercase text-ochre"
        >
          Shop Clarity Day Crème
        </Link>
        <Link
          href="/shop/clarity-night-creme"
          className="border-b border-ochre pb-0.5 text-eyebrow uppercase text-ochre"
        >
          Shop Clarity Night Crème
        </Link>
        <Link
          href="/shop/clarity-neck-decollete-creme"
          className="border-b border-ochre pb-0.5 text-eyebrow uppercase text-ochre"
        >
          Discover Clarity Neck &amp; Décolleté Crème
        </Link>
        <Link
          href="/shop/clarity-eye-contour-concentrate"
          className="border-b border-ochre pb-0.5 text-eyebrow uppercase text-ochre"
        >
          Shop Clarity Eye Contour Concentrate
        </Link>
        <Link
          href="/assessment"
          className="border-b border-ochre pb-0.5 text-eyebrow uppercase text-ochre"
        >
          Take the Skin Assessment™
        </Link>
      </div>
    </div>
  );
}
