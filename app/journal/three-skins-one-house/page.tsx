import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Three Skins, One House: The CHIAREL Origin Story",
  description:
    "Why CHIAREL exists: one household, three different skin types, and no formulation house precise enough to serve all three.",
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
          The question started at a kitchen table, not a lab: one household,
          three different skin types — reactive, combination, mature — and a
          bathroom cabinet that couldn&rsquo;t keep up with any of them.
          Every formula on the market seemed built for one skin and merely
          tolerated by the other two.
        </p>
        <p>
          That question needed a real answer, not a home remedy. It led to
          Isola del Liri, Italy, and to a partnership with Natural You Srl —
          each formulation developed under the guidance of CHIAREL&rsquo;s
          pharmacist, Grazia Savoriti, rather than adapted from someone
          else&rsquo;s default.
        </p>
        <p>
          The premise was never <em>who might like this</em>. It was harder
          than that: why does an entire category still ask everyone to
          trust the same formula? Skin is not one thing — a house built to
          serve it shouldn&rsquo;t pretend otherwise.
        </p>
        <p>
          That premise is CHIAREL Intelligence™ — not a marketing concept,
          but the working method the House still holds: start with the
          biology in front of you, formulate it properly, and disclose
          exactly what went in.
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
