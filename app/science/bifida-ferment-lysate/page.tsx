import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bifida Ferment Lysate, Explained",
  description:
    "What Bifida Ferment Lysate is and where CHIAREL uses it: Clarity Essence, Clarity Day Crème, Clarity Neck & Décolleté Crème and Clarity Eye Contour Concentrate. A transparent, third-person explainer.",
  alternates: { canonical: "/science/bifida-ferment-lysate" },
};

const faqs = [
  {
    q: "What is Bifida Ferment Lysate?",
    a: "Bifida Ferment Lysate is a postbiotic — the lysate of fermented Bifidobacterium species. It is an established ingredient used across cosmetic formulation, not a CHIAREL-exclusive ingredient.",
  },
  {
    q: "What does a postbiotic do for skin?",
    a: "In our formulas the lysate sits alongside ceramides, niacinamide and hyaluronic acid, chosen for the look and feel of a comfortable, even surface.",
  },
  {
    q: "Is this different from a probiotic?",
    a: "Yes. A probiotic is a live microorganism; a postbiotic like a ferment lysate is the (non-living) byproduct of fermentation — often better suited to shelf-stable formulation.",
  },
  {
    q: "Which CHIAREL products contain it?",
    a: "Clarity Essence, Clarity Day Crème, Clarity Neck & Décolleté Crème and Clarity Eye Contour Concentrate. It is not in Clarity Night Crème.",
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

export default function BifidaPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-margin py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Link href="/science" className="text-[12px] text-ink/65 hover:text-ochre">
        ← The Science
      </Link>
      <h1 className="mt-2 font-serif text-h1 leading-tight">
        Bifida Ferment Lysate, Explained
      </h1>
      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink/75">
        A postbiotic ingredient, explained here in the third person as an
        educational reference.
      </p>

      <section className="mt-12 space-y-10">
        <div className="border-l-2 border-champagne pl-6">
          <h2 className="font-serif text-2xl">What it is</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            A postbiotic lysate derived from fermented Bifidobacterium.
            Widely used across cosmetic formulation.
          </p>
        </div>
        <div className="border-l-2 border-champagne pl-6">
          <h2 className="font-serif text-2xl">How it works</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            Used here for the look and feel of a comfortable surface.
          </p>
        </div>
        <div className="border-l-2 border-champagne pl-6">
          <h2 className="font-serif text-2xl">Associated outcomes</h2>
          <ul className="mt-2 max-w-xl list-disc space-y-1 pl-5 text-sm leading-relaxed text-ink/70">
            <li>Skin that feels comfortable and balanced</li>
            <li>The look of a healthy, even surface</li>
          </ul>
        </div>
        <div className="border-l-2 border-ochre pl-6">
          <h2 className="font-serif text-2xl">How CHIAREL formulates with it</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            Found in four products: Clarity Essence, Clarity Day Crème,
            Clarity Neck &amp; Décolleté Crème and Clarity Eye Contour
            Concentrate, alongside the ingredients that define each one. It is
            not in Clarity Night Crème. See{" "}
            <Link href="/science" className="border-b border-ochre text-ochre">
              The Science
            </Link>{" "}
            for what each formulation answers.
          </p>
        </div>
      </section>

      <p className="mt-14 max-w-2xl text-[12px] leading-relaxed text-ink/65">
        Bifida Ferment Lysate is an ingredient name, not a CHIAREL
        trademark. This page is an educational reference and is not a
        guarantee of individual results.
      </p>

      <div className="mt-8 flex flex-wrap gap-6 border-t border-ink/10 pt-8 text-eyebrow uppercase">
        <Link href="/science/l-ornithine" className="border-b border-ochre pb-0.5 text-ochre">
          L-Ornithine, Explained →
        </Link>
        <Link href="/shop/clarity-essence" className="border-b border-ink/30 pb-0.5 text-ink/60">
          Shop Clarity Essence
        </Link>
      </div>
    </div>
  );
}
