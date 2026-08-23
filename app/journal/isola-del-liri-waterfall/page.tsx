import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "A Town Built Around a Waterfall",
  description:
    "Isola del Liri, the karst-spring confluence behind The Cascata Complex™, and why CHIAREL's provenance shapes how every formulation is made.",
  alternates: { canonical: "/journal/isola-del-liri-waterfall" },
};

export default function WaterfallPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/journal" className="text-[12px] text-ink/50 hover:text-ochre">
        ← Journal
      </Link>
      <h1 className="mt-2 font-serif text-4xl leading-tight">
        A Town Built Around a Waterfall
      </h1>

      {/* No real photo of Isola del Liri exists in the asset library — the prior
          image here ("hero-bright.png") was a mislabeled product-jar mockup, not
          a place photo. Deliberately text-only until real location photography
          exists — the article ironically deserves better than a fake jar. */}

      <div className="mt-10 space-y-6 text-sm leading-relaxed text-ink/80">
        <p>
          An hour and a half from Rome, in the Liri valley of central Italy,
          sits a town almost no other in Europe can claim to resemble: Isola
          del Liri, named for the island formed where two arms of the Liri
          river split around its historic center — and fall, together, as
          the Cascata Grande, a 27-meter waterfall that drops through the
          middle of daily life, beside the Boncompagni-Viscogliosi castle.
        </p>
        <p>
          The height is not what makes the water here worth naming a
          formulation after. Just before the Liri reaches the town, it is
          joined by the Fibreno — a river with no surface source of its
          own, fed entirely by limestone karst springs a few kilometers
          upstream. Water that arrives newly filtered through stone, not
          run off the surface. That confluence, not the drop, is what The
          Cascata Complex™ is named for.
        </p>
        <p>
          The town&rsquo;s relationship with that water goes back further
          than the waterfall&rsquo;s current form: Isola del Liri was
          Volscian before it was Roman, its position on the river making it
          a strategic crossing point on the route toward Rome — one reason
          the Romans took it in 305 BC. Centuries later, the same water that
          once carried Roman trade turned the wheels of the valley&rsquo;s
          water-powered mills, and by the 18th and 19th centuries, some of
          Italy&rsquo;s finest paper mills — precision and craft, running on
          the same current that still falls through the town today.
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
