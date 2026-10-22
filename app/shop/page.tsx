import Image from "next/image";
import Link from "next/link";
import { getProduct, getProductOrThrow, productImageAlt } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { NEUTRAL_FRAME_BG } from "@/lib/color";

export const metadata = { title: "Shop", alternates: { canonical: "/shop" } };

// The five launch products, grouped by the moment of the day they belong to
// (the same order as The Ritual: lightest texture first).
const dayRitual = ["chiarel-essence", "terra-radiance-creme"];
const nightRitual = ["chiarel-essence", "eye-contour-concentrate", "recovery-masque", "n1-neck-decollete"];

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
            Neck &amp; Décolleté Crème
          </p>
          <h2 className="mt-2 font-serif text-3xl leading-snug">{n1.name}</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-ink/70">{n1.blurb}</p>
          <Link
            href={`/shop/${n1.slug}`}
            className="btn-press mt-6 inline-block border border-ink px-8 py-3 text-[12px] uppercase tracking-[0.25em] transition hover:border-ochre hover:text-ochre"
          >
            Discover the Crème
          </Link>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-serif text-2xl">The Morning Ritual</h2>
        <p className="mt-1 text-[12px] uppercase tracking-[0.14em] text-ink/65">Morning</p>
        <ProductGrid slugs={dayRitual} />
      </section>

      <section className="mt-16 border-t border-ink/10 pt-12">
        <h2 className="font-serif text-2xl">The Evening Ritual</h2>
        <p className="mt-1 text-[12px] uppercase tracking-[0.14em] text-ink/65">Evening</p>
        <ProductGrid slugs={nightRitual} />
      </section>
    </div>
  );
}
