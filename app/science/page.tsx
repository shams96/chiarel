export const metadata = { title: "The Science — CHIAREL™" };

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
      <p className="eyebrow">CHIAREL Intelligence™</p>
      <h1 className="mt-2 font-serif text-4xl">The Science</h1>
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
    </div>
  );
}
