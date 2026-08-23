import Link from "next/link";

export const metadata = { title: "The Science", alternates: { canonical: "/science" } };

const complexes = [
  {
    name: "The Cascata Complex™",
    note: "A fermentation-derived complex named for the Cascata Grande, the waterfall at the heart of Isola del Liri. Supports barrier comfort in the cleansing step.",
  },
  {
    name: "Cellular Intelligence Complex™",
    note: "The signature complex of CHIAREL Essence™. Formulated to support the skin's own regulatory processes — the working definition of Cellular Clarity™.",
  },
  {
    name: "Terra Shield Complex™",
    note: "A conditioning complex that supports the skin's defenses against environmental exposure.",
  },
  {
    name: "Contour Renewal Complex™",
    note: "Supports firmness and contour through the overnight recovery window.",
  },
  {
    name: "Dermal Support Complex™",
    note: "In development. Formulated to support dermal structure and daily resilience.",
  },
];

export default function SciencePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-serif text-4xl">The Science</h1>
      <p className="mt-1 text-[12px] uppercase tracking-[0.14em] text-ink/40">
        CHIAREL Intelligence™
      </p>
      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink/75">
        CHIAREL™ formulations are built to one purpose: Advancing Cellular
        Clarity™ — supporting the skin&rsquo;s intelligence against Modern
        Biological Stress™. Science explains the product. Luxury creates
        desire. We hold both.
      </p>

      <div className="mt-12 space-y-8">
        {complexes.map((c) => (
          <div key={c.name} className="border-l-2 border-champagne pl-6">
            <h2 className="font-serif text-2xl">{c.name}</h2>
            <p className="mt-1 max-w-xl text-sm text-ink/70">{c.note}</p>
          </div>
        ))}
      </div>

      <p className="mt-14 text-[11px] text-ink/45">
        Complex names are provisional pending formal trademark clearance.
        CHIAREL™ uses outcome language — our formulations support and optimize;
        they do not promise miracles.
      </p>

      <div className="mt-8 flex flex-wrap gap-6 border-t border-ink/10 pt-8 text-[12px] uppercase tracking-[0.16em]">
        <Link href="/science/barrier-resilience" className="border-b border-ochre pb-0.5 text-ochre">
          Barrier Resilience →
        </Link>
        <Link href="/science/lasting-hydration" className="border-b border-ochre pb-0.5 text-ochre">
          Lasting Hydration →
        </Link>
        <Link href="/science/synergy" className="border-b border-ochre pb-0.5 text-ochre">
          The Synergy →
        </Link>
        <Link href="/science/application" className="border-b border-ink/30 pb-0.5 text-ink/60">
          Application Guide
        </Link>
        <Link href="/science/ectoine" className="border-b border-ink/30 pb-0.5 text-ink/60">
          Ectoine
        </Link>
        <Link href="/science/bifida-ferment-lysate" className="border-b border-ink/30 pb-0.5 text-ink/60">
          Bifida Ferment Lysate
        </Link>
        <Link href="/science/l-ornithine" className="border-b border-ink/30 pb-0.5 text-ink/60">
          L-Ornithine
        </Link>
        <Link href="/science/comparison" className="border-b border-ink/30 pb-0.5 text-ink/60">
          How CHIAREL Compares
        </Link>
      </div>
    </div>
  );
}
