import Link from "next/link";
import Reveal from "@/components/Reveal";

// Proof, second: the ingredient families behind the formulas, described in
// "the look of" terms. No external citation links: no specific, checked study
// is on file, and a search-results page is not a source.
//
// Each sentence stays whole; its leading ingredient name is set large so the
// section scans as four specimens instead of a bullet list.
const ingredients = [
  {
    name: "Peptides",
    rest: " (used in Clarity Essence) are chosen for the look of smoother, firmer-looking skin.",
  },
  {
    name: "Ceramides and niacinamide",
    rest: " (used in Clarity Day Crème) are chosen for skin that looks and feels comfortable and even.",
  },
  {
    name: "Bifida Ferment Lysate",
    rest: ", a postbiotic used in Clarity Essence, Day Crème, Neck & Décolleté Crème and Eye Contour Concentrate, is chosen for the look of calm, even-looking skin. See the explainer.",
    link: { href: "/science/bifida-ferment-lysate", label: "Read the formulation science →" },
  },
  {
    name: "L-Ornithine",
    rest: " (used in Clarity Night Crème) is chosen for skin that looks and feels hydrated.",
  },
];

export default function HomeProof() {
  return (
    <section className="section-y-lg bg-ivory">
      <div className="mx-auto max-w-[84rem] px-[clamp(1.5rem,3vw,3rem)]">
        <Reveal className="max-w-2xl">
          <h2 className="font-serif text-[clamp(2rem,1.3rem+2vw,3.4rem)] leading-tight text-ink">
            The Ingredients Behind the Formulas
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-ink/80">
            CHIAREL formulates with established, well-known ingredients rather
            than novel, unstudied compounds. Here is what each one is there
            for.
          </p>
        </Reveal>
        <ul className="mt-12 grid gap-px border border-champagne bg-champagne sm:grid-cols-2 lg:grid-cols-4">
          {ingredients.map((item, i) => (
            <li key={item.name} className="bg-ivory">
              <Reveal delay={i * 0.08} className="flex h-full flex-col p-7 md:p-8">
                <span aria-hidden="true" className="font-serif text-[13px] tracking-[0.2em] text-redochre">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-6 text-[14px] leading-relaxed text-ink/80">
                  <span className="mb-3 block font-serif text-[clamp(1.5rem,1.2rem+0.8vw,2rem)] leading-tight text-garden">
                    {item.name}
                  </span>
                  {item.rest.startsWith(", ") ? (
                    <>
                      <span className="sr-only">, </span>
                      {item.rest.slice(2)}
                    </>
                  ) : (
                    item.rest.trimStart()
                  )}
                </p>
                {item.link && (
                  <Link
                    href={item.link.href}
                    className="mt-4 inline-block self-start border-b border-redochre text-[12px] text-redochre"
                  >
                    {item.link.label}
                  </Link>
                )}
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
