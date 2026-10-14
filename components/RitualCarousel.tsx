import Image from "next/image";
import Link from "next/link";
import { productImageAlt, type Product } from "@/lib/products";
import { NEUTRAL_FRAME_BG } from "@/lib/color";
import { productHoverClass } from "@/lib/motion";

/**
 * A paced, single-row scroll-snap carousel for the ritual steps — deliberately
 * not a static N-up grid. Each step is shown large, one (mobile) or two-plus-peek
 * (desktop) at a time, with the next card visibly peeking in to invite scrolling.
 *
 * Card widths are `min(Xvw, Ypx)`, not plain `Xvw` — this section's track sits
 * inside `.section-x` (`max-w-6xl` = 1152px, ~1104px of content after its
 * padding; see globals.css). Below that width, vw tracks the actual visible
 * track width fine, but pure vw has no ceiling: past 1152px the track stops
 * growing while a card sized in vw keeps scaling with the full monitor width,
 * so on an ultrawide/29" display the cards balloon far past what the capped
 * track can show — 2-plus-peek becomes "1.8 cards, the second oversized and
 * cut off". The px ceiling in each min() is that breakpoint's vw share of
 * ~1104px, so cards stop growing exactly where the track stops growing too.
 */
export default function RitualCarousel({ products }: { products: Product[] }) {
  return (
    <div className="mt-10 -mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {products.map((p) => (
        <Link
          key={p.slug}
          href={`/shop/${p.slug}`}
          className="group w-[72vw] flex-none snap-start sm:w-[min(42vw,464px)] md:w-[min(30vw,331px)] lg:w-[min(24vw,265px)]"
        >
          <div
            className="product-frame aspect-[4/5]"
            style={{ backgroundColor: NEUTRAL_FRAME_BG }}
          >
            <Image
              src={p.image}
              alt={productImageAlt(p)}
              fill
              sizes="(max-width: 640px) 72vw, (max-width: 1152px) 30vw, 331px"
              className={productHoverClass(p.step)}
            />
          </div>
          <p className="mt-4 font-serif text-xl leading-tight">{p.name}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-ink/65">
            {p.step}
          </p>
        </Link>
      ))}
    </div>
  );
}
