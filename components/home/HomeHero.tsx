import Image from "next/image";
import Link from "next/link";
import { perDayPrice, DELIVERY_DAYS } from "@/lib/pricing";
import { getProductOrThrow, productImageAlt, isPurchasable } from "@/lib/products";

// First-viewport hero: headline, one primary CTA, the product and the price
// rationale must all be visible without scrolling at 375x812 and 1440x900.
// The image box has a fixed svh-based height on mobile (and is absolutely
// filled by next/image) so nothing shifts once the photo loads.
export default function HomeHero() {
  const essence = getProductOrThrow("chiarel-essence");

  return (
    <section className="relative w-full overflow-hidden bg-ivory">
      <div
        className="pointer-events-none absolute -right-1/4 top-0 h-full w-3/4"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 70% at 70% 40%, rgba(214,197,160,0.28) 0%, rgba(214,197,160,0) 65%)",
        }}
      />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-4 px-6 pb-8 pt-4 md:min-h-[min(640px,calc(100svh-5rem))] md:grid-cols-2 md:gap-10 md:py-16">
        <div className="hero-in order-2 max-w-xl md:order-1">
          <p className="text-[11px] uppercase tracking-[0.4em] text-ochre md:text-[12px] md:tracking-[0.5em]">
            CHIAREL™ · The House of Clarity™
          </p>
          <h1 className="mt-3 font-serif text-[clamp(2rem,1.3rem+4.2vw,4.5rem)] leading-[1.05] tracking-[-0.02em] text-ink md:mt-6">
            Skin clarity, made fresh in Isola del Liri.
          </h1>
          <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-ink/70 md:mt-6 md:text-[15px]">
            A focused morning and evening ritual, built around CHIAREL
            Essence™. Every active, with its exact percentage.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3 md:mt-8">
            <Link
              href="/ritual"
              className="btn-press inline-block border border-ink bg-ink px-8 py-3.5 text-[12px] uppercase tracking-[0.3em] text-ivory transition hover:border-ochre hover:bg-ochre"
            >
              Begin the Ritual
            </Link>
            <Link
              href={`/shop/${essence.slug}`}
              className="text-[11px] uppercase tracking-[0.2em] text-ink/70 underline decoration-ochre/50 underline-offset-4 hover:text-ochre"
            >
              Shop Essence
            </Link>
          </div>
          {isPurchasable(essence) && (
            <p className="mt-4 text-[12px] leading-relaxed text-ink/65">
              CHIAREL Essence™ from{" "}
              <span className="tabular-nums font-serif text-base text-ink">
                ${perDayPrice(essence.price.subscription)}
              </span>{" "}
              a day
              <span className="mt-1 block text-[11px] text-ink/55">
                ${essence.price.subscription} every {DELIVERY_DAYS} days with
                subscription · ${essence.price.oneTime} one-time
              </span>
            </p>
          )}
        </div>
        <div className="order-1 flex justify-center md:order-2 md:justify-end">
          <div className="product-reveal relative h-[30svh] min-h-[180px] w-full max-w-md md:aspect-square md:h-auto">
            <div
              className="absolute inset-[8%] rounded-full blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(214,197,160,0.35) 0%, rgba(214,197,160,0) 70%)",
              }}
            />
            <Image
              src={essence.image}
              alt={productImageAlt(essence)}
              fill
              priority
              sizes="(max-width: 768px) 90vw, 448px"
              className="relative object-contain drop-shadow-[0_30px_40px_rgba(28,26,23,0.18)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
