import Link from "next/link";
import Reveal from "@/components/Reveal";

// Proof, second: the ingredient families behind the formulas, described in
// "the look of" terms. No external citation links: no specific, checked study
// is on file, and a search-results page is not a source.
export default function HomeProof() {
  return (
    <section className="section-y bg-ivory">
      <div className="section-x-narrow">
        <Reveal className="text-center">
          <h2 className="font-serif text-3xl">The Ingredients Behind the Formulas</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink/70">
            CHIAREL formulates with established, well-known ingredients rather
            than novel, unstudied compounds. Here is what each one is there
            for.
          </p>
        </Reveal>
        <ul className="mx-auto mt-10 max-w-xl space-y-4 text-sm">
          <li className="border-l-2 border-ochre pl-5">
            <p className="text-ink/70">
              Peptides (used in Clarity Essence) are chosen for the look of
              smoother, firmer-looking skin.
            </p>
          </li>
          <li className="border-l-2 border-ochre pl-5">
            <p className="text-ink/70">
              Ceramides and niacinamide (used in Clarity Day Crème) are chosen
              for skin that looks and feels comfortable and even.
            </p>
          </li>
          <li className="border-l-2 border-ochre pl-5">
            <p className="text-ink/70">
              Bifida Ferment Lysate, a postbiotic used in Clarity Essence,
              Day Crème, Neck &amp; Décolleté Crème and Eye Contour
              Concentrate, is chosen for the look of calm, even-looking skin.
              See the explainer.
            </p>
            <Link
              href="/science/bifida-ferment-lysate"
              className="mt-1 inline-block border-b border-ochre text-[12px] text-ochre"
            >
              Read the formulation science →
            </Link>
          </li>
          <li className="border-l-2 border-ochre pl-5">
            <p className="text-ink/70">
              L-Ornithine (used in Clarity Night Crème) is chosen for skin
              that looks and feels hydrated.
            </p>
          </li>
        </ul>
      </div>
    </section>
  );
}
