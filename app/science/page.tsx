import Link from "next/link";
import { productHref } from "@/lib/products";

export const metadata = { title: "The Science", alternates: { canonical: "/science" } };

const entries = [
  {
    name: "Clarity Essence",
    slug: "chiarel-essence",
    answers: "The look of fine lines and loss of firmness",
    science:
      "Peptides with niacinamide and hyaluronic acid, for the look of smoother, firmer-looking skin.",
  },
  {
    name: "Clarity Day Crème",
    slug: "terra-radiance-creme",
    answers: "Dry, uncomfortable skin through the working day",
    science:
      "Ceramides with cholesterol and squalane, for the look and feel of comfortable, hydrated skin. Niacinamide for the look of an even, healthy surface.",
  },
  {
    name: "Clarity Night Crème",
    slug: "recovery-masque",
    answers: "Texture that shows after a long day",
    science:
      "Bakuchiol with peptides and niacinamide, for the look of smoother texture overnight.",
  },
  {
    name: "Clarity Neck & Décolleté Crème",
    slug: "n1-neck-decollete",
    answers: "Crepey texture on the neck and chest",
    science:
      "Copper peptide with ceramides and squalane, for the look of smoother, more hydrated skin on the neck and chest.",
  },
  {
    name: "Clarity Eye Contour Concentrate",
    slug: "eye-contour-concentrate",
    answers: "Tired-looking eyes",
    science:
      "Caffeine and peptides, for the look of less puffiness and dark circles. Hyaluronic acid for hydration, and light-reflecting mica for a brighter look to the eye area.",
  },
];

export default function SciencePage() {
  return (
    <div className="grid-12 mx-auto w-full max-w-container px-margin py-section">
      <header className="col-span-full lg:col-span-4">
      <h1 className="font-serif text-h1">The Science</h1>
      <p className="mt-1 text-eyebrow uppercase text-ink/65">
        CHIAREL Intelligence™
      </p>
      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink/75">
        Modern Biological Stress™ is the daily load on a working
        woman&rsquo;s body and skin. Each CHIAREL formulation answers one part
        of it.
      </p>
      </header>

      <div className="col-span-full lg:col-span-8">
      <div className="space-y-8">
        {entries.map((e) => (
          <div key={e.slug} className="border-l-2 border-champagne pl-6">
            <h2 className="font-serif text-2xl">{e.name}</h2>
            <p className="mt-1 text-eyebrow uppercase text-ink/65">
              {e.answers}
            </p>
            <p className="mt-2 max-w-xl text-sm text-ink/70">{e.science}</p>
            <Link
              href={productHref(e.slug)}
              className="mt-3 inline-block border-b border-ochre pb-0.5 text-eyebrow uppercase text-ochre"
            >
              See the formulation →
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-14 flex flex-wrap gap-6 border-t border-ink/10 pt-8 text-eyebrow uppercase">
        <Link href="/science/barrier-resilience" className="border-b border-ochre pb-0.5 text-ochre">
          Barrier Resilience →
        </Link>
        <Link href="/science/lasting-hydration" className="border-b border-ochre pb-0.5 text-ochre">
          Lasting Hydration →
        </Link>
        <Link href="/science/application" className="border-b border-ink/30 pb-0.5 text-ink/60">
          Application Guide
        </Link>
        <Link href="/science/bifida-ferment-lysate" className="border-b border-ink/30 pb-0.5 text-ink/60">
          Bifida Ferment Lysate
        </Link>
        <Link href="/science/l-ornithine" className="border-b border-ink/30 pb-0.5 text-ink/60">
          L-Ornithine
        </Link>
      </div>
      </div>
    </div>
  );
}
