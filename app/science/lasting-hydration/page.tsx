import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Beyond Surface Moisture: Lasting Hydration",
  description:
    "Why CHIAREL pairs hyaluronic acid and hydrolyzed collagen with ceramides, cholesterol and squalane, so skin feels hydrated and comfortable through the day.",
  alternates: { canonical: "/science/lasting-hydration" },
};

const faqs = [
  {
    q: "Why does moisturized skin sometimes feel tight again within hours?",
    a: "Many humectant-only formulas draw water to the skin's surface but have no way to help hold it there. As that water evaporates, skin can feel tight again. Pairing a humectant with skin-compatible lipids addresses both sides: drawing and holding.",
  },
  {
    q: "Which CHIAREL products hydrate?",
    a: "Clarity Essence carries hyaluronic acid with hydrolyzed collagen for surface hydration. Clarity Eye Contour Concentrate carries hyaluronic acid for the eye area. Clarity Day Crème and Clarity Neck & Décolleté Crème add ceramides and squalane to help skin feel comfortable and hydrated.",
  },
  {
    q: "Does CHIAREL claim its hydration is better than every competitor's?",
    a: "No efficacy comparison claim is made. CHIAREL describes its own formulation approach transparently and lets that description speak for itself.",
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

      <Link href="/science" className="text-[12px] text-ink/65 hover:text-ochre">
        ← The Science
      </Link>
      <h1 className="mt-2 font-serif text-4xl leading-tight">
        Beyond Surface Moisture
      </h1>
      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink/75">
        Hydration that fades within the hour is a formulation gap, not an
        inevitability. CHIAREL layers water-binding ingredients with
        skin-compatible lipids so skin feels hydrated and comfortable through
        the day.
      </p>

      <section className="mt-12 space-y-10">
        <div className="border-l-2 border-champagne pl-6">
          <h2 className="font-serif text-2xl">The humectant-only gap</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            Humectants draw water to the skin&rsquo;s surface. Without
            something to help hold it there, that water evaporates and skin
            can feel tighter than before application.
          </p>
        </div>
        <div className="border-l-2 border-champagne pl-6">
          <h2 className="font-serif text-2xl">Water-binding ingredients</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            Hyaluronic acid is a well-known water-binding molecule, found in
            Clarity Essence and Clarity Eye Contour Concentrate. Clarity
            Essence also carries hydrolyzed collagen for surface
            hydration.
          </p>
        </div>
        <div className="border-l-2 border-ochre pl-6">
          <h2 className="font-serif text-2xl">Lipids complete the picture</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            Ceramides, cholesterol and squalane in Clarity Day Crème, and
            ceramides and squalane in Clarity Neck &amp; Décolleté Crème, help
            skin feel comfortable and hydrated after the Essence.
          </p>
        </div>
        <div className="border-l-2 border-champagne pl-6">
          <h2 className="font-serif text-2xl">What this feels like</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            A cushioned, comfortable finish. See{" "}
            <Link href="/science" className="border-b border-ochre text-ochre">
              The Science
            </Link>{" "}
            for how each formulation answers part of Modern Biological
            Stress™.
          </p>
        </div>
      </section>

      <p className="mt-14 max-w-2xl text-[11px] leading-relaxed text-ink/65">
        Hyaluronic acid, ceramides and squalane are established INCI
        ingredients, not CHIAREL trademarks or proprietary technologies. This
        page describes CHIAREL&rsquo;s formulation approach — not a guarantee
        of individual results.
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
