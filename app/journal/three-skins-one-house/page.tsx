import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Three Skins, One House: The CHIAREL Origin Story",
  description:
    "Why CHIAREL exists: a household with three biologically distinct skin profiles, and no formulation house precise enough to serve all three.",
  alternates: { canonical: "/journal/three-skins-one-house" },
};

export default function ThreeSkinsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/journal" className="text-[12px] text-ink/50 hover:text-ochre">
        ← Journal
      </Link>
      <h1 className="mt-2 font-serif text-4xl leading-tight">
        Three Skins, One House
      </h1>
      <p className="mt-4 text-[13px] text-ink/50">The CHIAREL Origin Story</p>

      <div className="mt-10 space-y-6 text-sm leading-relaxed text-ink/80">
        <p>
          CHIAREL™ was not built backward from a product brief. It began at a
          table, not a laboratory bench — one household, three biologically
          distinct skin profiles, each governed by its own logic. What
          should have been solvable with a well-stocked bathroom cabinet was
          not. No single formulation house understood all three with equal
          precision.
        </p>
        <p>
          That absence became the brief. The brief led to Isola del Liri, and
          to a partnership with Natural You Srl — a formulation house
          willing to treat each skin as its own problem to solve, not a
          variation on a single default.
        </p>
        <p>
          The founding question was not <em>who might like this</em>. It was
          simpler and harder: why does a category this size still ask
          everyone to trust the same formula? Skin is not one thing. A house
          built to serve it should not pretend otherwise.
        </p>
        <p>
          That is the origin of CHIAREL Intelligence™ — not a marketing
          concept, but the working method the House still holds: begin with
          the biology in front of you, not the biology the industry assumes.
        </p>
      </div>

      <div className="mt-14 border-t border-ink/10 pt-8">
        <Link
          href="/house"
          className="border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.16em] text-ochre"
        >
          Discover the House
        </Link>
      </div>
    </div>
  );
}
