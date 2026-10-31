import Link from "next/link";
import { RoutineBand, morningRoute, eveningRoute } from "@/components/RoutineBand";

export const metadata = { title: "The Ritual", alternates: { canonical: "/ritual" } };

// Owner copy (site alignment brief, section 3). Wording is verbatim; the
// home page's HomeRitual mirrors the step labels.
export default function RitualPage() {
  return (
    <>
    <div className="mx-auto max-w-6xl px-6 pt-16">
      <h1 className="max-w-2xl font-serif text-4xl leading-tight">
        Five products, two moments in the day: prepare for it, then let it go.
      </h1>
      <p className="mt-4 max-w-xl text-sm text-ink/70">
        Order follows the texture, lightest first. Each moment answers part of
        the day described on{" "}
        <Link href="/house" className="border-b border-ochre text-ochre">
          The House
        </Link>
        , the daily load we call Modern Biological Stress&trade;.
      </p>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        <Link
          href="/assessment"
          className="inline-block border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.16em] text-ochre"
        >
          Take the Skin Assessment&trade; to find your starting point
        </Link>
        <Link
          href="/build-your-ritual"
          className="inline-block border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.16em] text-ochre"
        >
          Or build your own ritual, step by step
        </Link>
      </div>

      <nav aria-label="Jump to a routine" className="mt-8 flex gap-3">
        <a href="#morning" className="inline-flex min-h-[44px] items-center border border-ink/30 px-5 text-[12px] uppercase tracking-[0.2em] text-ink/80 transition hover:border-ochre hover:text-ochre">Morning</a>
        <a href="#evening" className="inline-flex min-h-[44px] items-center border border-ink/30 px-5 text-[12px] uppercase tracking-[0.2em] text-ink/80 transition hover:border-ochre hover:text-ochre">Evening</a>
      </nav>
    </div>

    <div className="mt-14 pb-16">
      <RoutineBand
        id="morning"
        time="Morning"
        title="Morning: prepare the skin for the day"
        steps={[
          {
            n: 1,
            label: "Clarity Essence",
            slug: "chiarel-essence",
            purpose: "For fine lines and firmness.",
            ingredients: "Peptides · Niacinamide · Hyaluronic Acid.",
          },
          {
            n: 2,
            label: "Clarity Day Crème",
            slug: "terra-radiance-creme",
            purpose: "For dry skin under daily stress.",
            ingredients: "Ceramides · Cholesterol · Squalane.",
            note: "Follow with SPF.",
          },
        ]}
        slugs={morningRoute}
      />
      <RoutineBand
        id="evening"
        time="Evening"
        title="Evening: let the day go"
        dark
        steps={[
          { n: 1, label: "Clarity Essence", slug: "chiarel-essence" },
          {
            n: 2,
            label: "Clarity Eye Contour Concentrate",
            slug: "eye-contour-concentrate",
            purpose: "For puffiness, dark circles and fine lines.",
            ingredients: "Caffeine · Peptides · Hyaluronic Acid.",
            note: "Made for the evening, and it may be used morning or night.",
          },
          {
            n: 3,
            label: "Clarity Night Crème",
            slug: "recovery-masque",
            purpose: "For smoother-looking texture.",
            ingredients: "Bakuchiol · Peptides · Niacinamide.",
          },
          {
            n: 4,
            label: "Clarity Neck & Décolleté Crème",
            slug: "n1-neck-decollete",
            purpose: "For crepey-looking skin on the neck and chest.",
            ingredients: "Copper Peptide · Ceramides · Squalane.",
          },
        ]}
        slugs={eveningRoute}
      />
    </div>
    </>
  );
}
