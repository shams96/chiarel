import Image from "next/image";
import Link from "next/link";
import { getProduct, getProductOrThrow, productImageAlt } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { NEUTRAL_FRAME_BG } from "@/lib/color";

export const metadata = { title: "Shop", alternates: { canonical: "/shop" } };

// Category-grouped, launch-led Shop page — restructured per
// CHIAREL_FOUR_PRODUCT_IMPLEMENTATION_PLAN.md §8. Every current product
// remains listed; nothing is hidden or unpublished, only regrouped for
// purchase-path priority.
const dayRitual = ["chiarel-essence", "terra-radiance-creme"];
const nightRitual = ["chiarel-essence", "recovery-masque", "n1-neck-decollete"];
const beyondTheRitual = ["cellular-cleanser", "cellular-mist", "lip-concentrate"];
const existingSets = ["the-founding-pair", "the-ritual-set"];

function ProductGrid({ slugs }: { slugs: string[] }) {
  const items = slugs.map((slug) => getProduct(slug)).filter((p) => p !== undefined);
  return (
    <div className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p) => (
        <ProductCard key={p!.slug} product={p!} />
      ))}
    </div>
  );
}

export default function ShopPage() {
  const n1 = getProductOrThrow("n1-neck-decollete");

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-serif text-4xl">Shop</h1>
      <p className="mt-1 text-[12px] uppercase tracking-[0.14em] text-ink/65">
        Consumer Collection™
      </p>

      {/* Featured category hero — standardized neutral frame, same as every other product tile */}
      <section
        className="mt-10 flex flex-col items-center gap-8 rounded-md border border-ink/10 p-8 md:flex-row md:p-12"
        style={{ backgroundColor: NEUTRAL_FRAME_BG }}
      >
        <div className="relative aspect-square w-full max-w-xs shrink-0 overflow-hidden">
          <Image src={n1.image} alt={productImageAlt(n1)} fill sizes="320px" className="object-contain" />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-ochre">
            The Neck &amp; Décolleté Treatment
          </p>
          <h2 className="mt-2 font-serif text-3xl leading-snug">{n1.name}</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-ink/70">{n1.blurb}</p>
          <Link
            href={`/shop/${n1.slug}`}
            className="btn-press mt-6 inline-block border border-ink px-8 py-3 text-[12px] uppercase tracking-[0.25em] transition hover:border-ochre hover:text-ochre"
          >
            Discover N1
          </Link>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-serif text-2xl">The Day Ritual</h2>
        <p className="mt-1 text-[12px] uppercase tracking-[0.14em] text-ink/65">Morning</p>
        <ProductGrid slugs={dayRitual} />
      </section>

      <section className="mt-16 border-t border-ink/10 pt-12">
        <h2 className="font-serif text-2xl">The Night Ritual</h2>
        <p className="mt-1 text-[12px] uppercase tracking-[0.14em] text-ink/65">Evening</p>
        <ProductGrid slugs={nightRitual} />
      </section>

      <section className="mt-16 border-t border-ink/10 pt-12">
        <h2 className="font-serif text-2xl">Beyond the Ritual</h2>
        <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-ink/65">
          Additional CHIAREL products — fully available, just outside the
          core four-product launch ritual.
        </p>
        <ProductGrid slugs={beyondTheRitual} />
      </section>

      <section className="mt-16 border-t border-ink/10 pt-12">
        <h2 className="font-serif text-2xl">Existing Sets</h2>
        <ProductGrid slugs={existingSets} />
      </section>
    </div>
  );
}
