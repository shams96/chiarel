import Link from "next/link";
import Reveal from "@/components/Reveal";

const fitGuidance = [
  {
    concern: "Barrier feels reactive, tight, or easily irritated",
    fit: "Clarity Day Crème",
    why: "Ceramides, cholesterol and squalane, formulated to help skin feel comfortable and hydrated through the working day.",
  },
  {
    concern: "Skin looks dull, uneven, or has lost visible firmness",
    fit: "Clarity Essence",
    why: "Four peptides with niacinamide and hyaluronic acid, the concentrated layer of the ritual.",
  },
  {
    concern: "Neck, jawline, and décolleté show dryness or crepey-looking texture",
    fit: "Clarity Neck & Décolleté Crème",
    why: "Copper peptide with ceramides and squalane, formulated specifically for the skin below the jawline.",
  },
  {
    concern: "Shows texture after a long day",
    fit: "Clarity Night Crème",
    why: "Bakuchiol, a plant-derived alternative to retinol, with peptides and niacinamide, to smooth the look of texture overnight.",
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
