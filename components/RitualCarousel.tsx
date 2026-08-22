import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { productTint } from "@/lib/color";

/**
 * A paced, single-row scroll-snap carousel for the ritual steps — deliberately
 * not a static N-up grid. Each step is shown large, one (mobile) or two-plus-peek
 * (desktop) at a time, with the next card visibly peeking in to invite scrolling.
 */
export default function RitualCarousel({ products }: { products: Product[] }) {
  return (
    <div className="mt-10 -mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {products.map((p) => (
        <Link
          key={p.slug}
          href={`/shop/${p.slug}`}
          className="group w-[72vw] flex-none snap-start sm:w-[42vw] md:w-[30vw] lg:w-[24vw]"
        >
          <div
            className="relative aspect-[4/5] overflow-hidden rounded-sm"
            style={{ backgroundColor: productTint(p.color.hex) }}
          >
            <Image
              src={p.image}
              alt={p.name}
              fill
              sizes="(max-width: 640px) 72vw, 30vw"
              className="object-cover transition duration-700 group-hover:scale-[1.03]"
            />
          </div>
          <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-ink/50">
            {p.step}
          </p>
          <p className="font-serif text-xl leading-tight">{p.name}</p>
        </Link>
      ))}
    </div>
  );
}
