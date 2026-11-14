import Link from "next/link";
import ResponsiveImage from "@/components/ResponsiveImage";
import { RoutineBand, morningRoute, eveningRoute } from "@/components/RoutineBand";

export const metadata = {
  title: "The Ritual",
  description:
    "Five products, two moments in the day: prepare for it, then let it go. The CHIAREL™ morning and evening ritual, lightest texture first.",
  alternates: { canonical: "/ritual" },
};

// Owner copy (site alignment brief, section 3). Wording is verbatim; the
// home page's HomeRitual mirrors the step labels.
export default function RitualPage() {
  return (
    <>
    <div className="mx-auto w-full max-w-container px-margin pt-16">
      <h1 className="max-w-4xl font-serif text-[clamp(2.5rem,1.4rem+4.6vw,4.5rem)] font-medium leading-[1.06] tracking-[-0.015em]">
        Five products, two moments in the day: prepare for it, then let it go.
      </h1>
      <p className="mt-6 max-w-measure text-lead text-ink">
        Order follows the texture, lightest first. Each moment answers part of
        the day described on{" "}
        <Link href="/house" className="border-b border-ochre text-ochre">
          The House
        </Link>
        , the daily load we call Modern Biological Stress&trade;.
      </p>
      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
        <Link
          href="/assessment"
          className="inline-block border-b border-ochre pb-0.5 text-eyebrow uppercase text-ochre"
        >
          Take the Skin Assessment&trade; to find your starting point
        </Link>
        <Link
          href="/build-your-ritual"
          className="inline-block border-b border-ochre pb-0.5 text-eyebrow uppercase text-ochre"
        >
          Or build your own ritual, step by step
        </Link>
      </div>

      <nav aria-label="Jump to a routine" className="mt-8 flex gap-3">
        <a href="#morning" className="inline-flex min-h-[44px] items-center border border-ink/30 px-5 text-eyebrow uppercase text-ink transition hover:border-ochre hover:text-ochre">Morning</a>
        <a href="#evening" className="inline-flex min-h-[44px] items-center border border-ink/30 px-5 text-eyebrow uppercase text-ink transition hover:border-ochre hover:text-ochre">Evening</a>
      </nav>
    </div>

    <div className="mx-auto mt-12 w-full max-w-container px-margin">
      <div className="relative mx-auto aspect-square w-full max-w-4xl overflow-hidden lg:aspect-[16/10]">
        <ResponsiveImage
          src="/assets/products/clarity-ritual-group.jpg"
          alt="The five Clarity products in a row on a travertine plinth: Essence, Day Crème, Night Crème, Neck & Décolleté Crème and Eye Contour Concentrate"
          sizes="(max-width: 768px) 92vw, 896px"
          className="object-cover"
        />
      </div>
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
