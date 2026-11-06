import ResponsiveImage from "@/components/ResponsiveImage";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/layout/SectionHeading";
import { productHref } from "@/lib/products";

// Each card leads with that product's scene, so the section reads as a way into
// the range, not a list. The whole card is the link to the product.
const fitGuidance = [
  {
    concern: "Skin feels tight or easily unsettled",
    fit: "Clarity Day Crème",
    why: "Ceramides, cholesterol and squalane, formulated for skin that feels comfortable and hydrated through the working day.",
    slug: "terra-radiance-creme",
    image: "/assets/products/clarity-day-creme-capri.jpg",
    imageAlt: "Clarity Day Crème on sunlit limestone above the Faraglioni of Capri",
  },
  {
    concern: "Skin looks dull, uneven, or has lost visible firmness",
    fit: "Clarity Essence",
    why: "Four peptides with niacinamide and hyaluronic acid, the concentrated layer of the ritual.",
    slug: "chiarel-essence",
    image: "/assets/products/clarity-essence-scene-v2.jpg",
    imageAlt: "Clarity Essence beside a frosted flower with a green CHIAREL ribbon",
  },
  {
    concern: "Neck, jawline, and décolleté show dryness or crepey-looking texture",
    fit: "Clarity Neck & Décolleté Crème",
    why: "Copper peptide with ceramides and squalane, formulated specifically for the skin below the jawline.",
    slug: "n1-neck-decollete",
    image: "/assets/products/clarity-neck-decollete-creme-scene-v2.jpg",
    imageAlt: "Clarity Neck & Décolleté Crème under a frosted flower with a Red Ochre CHIAREL ribbon",
  },
  {
    concern: "Shows texture after a long day",
    fit: "Clarity Night Crème",
    why: "Bakuchiol with peptides and niacinamide, for the look of smoother texture overnight.",
    slug: "recovery-masque",
    image: "/assets/products/clarity-night-creme-capri.jpg",
    imageAlt: "Clarity Night Crème on sunlit rock above the Capri coastline",
  },
];

export default function HomeFitGuidance() {
  return (
    <section className="section-y-lg bg-cloud">
      <div className="mx-auto w-full max-w-container px-margin">
        <Reveal className="max-w-2xl">
          <SectionHeading
            lead={
              <>
                Best for matching a product to what your skin is showing you,
                not the shelf. Not sure? Take the{" "}
                <Link href="/assessment" className="border-b border-ochre text-ochre">
                  Skin Assessment
                </Link>
                .
              </>
            }
          >
            Which CHIAREL™ Product Is Right for You?
          </SectionHeading>
        </Reveal>
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {fitGuidance.map((row, i) => (
            <li key={row.concern}>
              <Reveal delay={i * 0.08} className="h-full">
                <Link
                  href={productHref(row.slug)}
                  className="group flex h-full flex-col border-t-2 border-ochre bg-ivory transition-transform duration-300 ease-out hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <ResponsiveImage
                      src={row.image}
                      alt={row.imageAlt}
                      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 22vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-[12px] uppercase tracking-[0.16em] text-ink/80">Best for skin that…</p>
                    <p className="mt-2 font-serif text-xl italic leading-snug text-ink">{row.concern}</p>
                    <p className="mt-5 text-[12px] uppercase tracking-[0.16em] text-ochre">{row.fit}</p>
                    <p className="mt-2 text-[14px] leading-relaxed text-ink/80">{row.why}</p>
                  </div>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
