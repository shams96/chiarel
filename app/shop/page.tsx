import ResponsiveImage from "@/components/ResponsiveImage";
import Link from "next/link";
import { getProduct, getProductOrThrow, productImageAlt, productHref, studioImage } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { NEUTRAL_FRAME_BG } from "@/lib/color";
import PageHead from "@/components/layout/PageHead";
import Container from "@/components/layout/Container";
import FindYourRitual from "@/components/shop/FindYourRitual";
import ShopServiceStrip from "@/components/shop/ShopServiceStrip";

export const metadata = {
  title: "Shop",
  description:
    "The CHIAREL™ Consumer Collection™: formulations for the morning and evening ritual, crafted in Isola del Liri, Italy.",
  alternates: { canonical: "/shop" },
};

// The five launch products, grouped by the moment of the day they belong to
// (the same order as The Ritual: lightest texture first).
const dayRitual = ["chiarel-essence", "terra-radiance-creme"];
const nightRitual = ["chiarel-essence", "eye-contour-concentrate", "recovery-masque", "n1-neck-decollete"];

function ProductGrid({ slugs }: { slugs: string[] }) {
  const items = slugs.map((slug) => getProduct(slug)).filter((p) => p !== undefined);
  return (
    <div
      className={`mt-8 grid gap-10 sm:grid-cols-2 ${
        items.length >= 4 ? "lg:grid-cols-4" : "lg:mx-auto lg:max-w-3xl"
      }`}
    >
      {items.map((p) => (
        <ProductCard key={p!.slug} product={p!} />
      ))}
    </div>
  );
}

export default function ShopPage() {
  const n1 = getProductOrThrow("n1-neck-decollete");

  return (
    <>
      <Container className="pt-4 md:pt-8">
        <nav aria-label="Breadcrumb" className="text-[12px] uppercase tracking-[0.14em] text-ink">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="tap-area hover:text-ochre">Home</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">Shop</li>
          </ol>
        </nav>
      </Container>
      <PageHead eyebrow="Consumer Collection™" lines={["Shop"]} />
      <FindYourRitual />
      <Container className="pb-section pt-6">

      {/* Featured category hero — standardized neutral frame, same as every other product tile */}
      <section
        className="mt-10 flex flex-col items-center gap-8 overflow-hidden rounded-md border border-ink/10 md:flex-row md:gap-12 md:pr-12"
      >
        <div
          className="relative aspect-[4/5] w-full shrink-0 overflow-hidden md:w-[44%]"
          style={{ backgroundColor: NEUTRAL_FRAME_BG }}
        >
          <ResponsiveImage src={studioImage(n1)} alt={productImageAlt(n1)} sizes="(min-width: 768px) 44vw, 100vw" className="object-cover" />
        </div>
        <div className="px-8 pb-10 md:p-0">
          <p className="text-eyebrow uppercase text-ochre">
            Neck &amp; Décolleté Crème
          </p>
          <h2 className="mt-2 font-serif text-h3 text-ochre">{n1.name}</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-ink">{n1.blurb}</p>
          <Link
            href={productHref(n1.slug)}
            className="btn-press mt-6 inline-flex min-h-[44px] items-center border border-ink px-8 text-eyebrow uppercase transition hover:border-ochre hover:text-ochre"
          >
            Discover the Crème
          </Link>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-serif text-h3 text-ochre">The Morning Ritual</h2>
        <p className="mt-1 text-eyebrow uppercase text-ink">Morning</p>
        <ProductGrid slugs={dayRitual} />
      </section>

      <section className="mt-16 border-t border-ink/10 pt-12">
        <h2 className="font-serif text-h3 text-ochre">The Evening Ritual</h2>
        <p className="mt-1 text-eyebrow uppercase text-ink">Evening</p>
        <ProductGrid slugs={nightRitual} />
      </section>
      </Container>
      <ShopServiceStrip />
    </>
  );
}
