import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "A Town Built Around a Waterfall",
  description:
    "Isola del Liri, the Cascata Grande, and why CHIAREL's provenance shapes how every formulation is made.",
  alternates: { canonical: "/journal/isola-del-liri-waterfall" },
};

export default function WaterfallPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="eyebrow">Journal · The House</p>
      <h1 className="mt-2 font-serif text-4xl leading-tight">
        A Town Built Around a Waterfall
      </h1>

      <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-sm">
        <Image
          src="/assets/editorial/hero-bright.png"
          alt="Isola del Liri, Italy"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div className="mt-10 space-y-6 text-sm leading-relaxed text-ink/80">
        <p>
          An hour and a half from Rome, in the Liri valley of central Italy,
          sits a town almost no other in Europe can claim to resemble: Isola
          del Liri, named for the island formed where two arms of the Liri
          river split around its historic center — and fall, together, as
          the Cascata Grande, a waterfall roughly thirty meters high that
          drops through the middle of daily life, beside the
          Boncompagni-Viscogliosi castle.
        </p>
        <p>
          It is not a landmark visited from a distance. It is the town's
          center of gravity — water that once powered the paper mills the
          valley was known for, still falling through the same streets
          today.
        </p>
        <p>
          This is where Natural You Srl, CHIAREL&rsquo;s manufacturing
          partner, formulates every product in the House. Provenance is not
          a line on a label here — it shapes the standard: water, craft, and
          proximity to the people making the decisions, rather than
          formulation outsourced to distance.
        </p>
        <p>
          It is also where La Bella Figura lives most naturally — the
          Italian discipline of presenting one&rsquo;s best self, quietly,
          without announcement. A town that has had a waterfall running
          through its center for centuries does not need to raise its voice
          about it.
        </p>
      </div>

      <div className="mt-14 flex flex-wrap gap-6 border-t border-ink/10 pt-8">
        <Link
          href="/house"
          className="border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.16em] text-ochre"
        >
          Discover the House
        </Link>
        <Link
          href="/journal/three-skins-one-house"
          className="border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.16em] text-ochre"
        >
          Read the Origin Story
        </Link>
      </div>
    </div>
  );
}
