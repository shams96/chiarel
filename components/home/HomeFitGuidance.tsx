import Link from "next/link";
import Reveal from "@/components/Reveal";

const fitGuidance = [
  {
    concern: "Barrier feels reactive, tight, or easily irritated",
    fit: "Cellular Cleanser™ + Terra Radiance Crème™",
    why: "Ceramide NP and a prebiotic complex are dosed to support barrier function rather than strip it.",
  },
  {
    concern: "Skin looks dull, uneven, or has lost visible firmness",
    fit: "CHIAREL Essence™",
    why: "Built around Palmitoyl Pentapeptide-4 (3%), the concentrated treatment layer of the ritual.",
  },
  {
    concern: "Neck, jawline, and décolleté show dryness or crepey-looking texture",
    fit: "N1 Neck & Décolleté Renewal Emulsion™",
    why: "Formulated specifically for the skin below the jawline, not repurposed face cream.",
  },
  {
    concern: "Wants overnight recovery without a heavy routine",
    fit: "Recovery Masque™",
    why: "L-Ornithine and Panthenol formulated as the ritual's closing facial gesture, before N1.",
  },
];

export default function HomeFitGuidance() {
  return (
    <section className="section-y border-y border-ink/10 bg-white">
      <div className="section-x">
        <Reveal>
          <h2 className="font-serif text-3xl">Which CHIAREL™ Product Is Right for You?</h2>
          <p className="mt-4 max-w-2xl text-sm text-ink/70">
            Best for matching a product to what your skin is showing you,
            not the shelf. Not sure? Take the{" "}
            <Link href="/assessment" className="border-b border-ochre text-ochre">
              Skin Assessment
            </Link>
            .
          </p>
        </Reveal>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {fitGuidance.map((row, i) => (
            <li key={row.concern}>
              <Reveal delay={i * 0.08} className="border border-ink/10 p-6">
                <p className="text-[11px] uppercase tracking-[0.16em] text-ink/65">
                  Best for skin that…
                </p>
                <p className="mt-2 font-serif text-lg leading-snug text-ink">{row.concern}</p>
                <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-ochre">{row.fit}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-ink/60">{row.why}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
