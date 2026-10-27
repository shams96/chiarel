import Image from "next/image";
import Link from "next/link";
import { perDayPrice, DELIVERY_DAYS } from "@/lib/pricing";
import { getProductOrThrow, isPurchasable } from "@/lib/products";

// First-viewport hero: Red Ochre text panel on the left, the Clarity Essence
// bottle on Peach Dust on the right (stacked on phones). Flat brand colours
// only: no gradients, no frame around the bottle.
export default function HomeHero() {
  const essence = getProductOrThrow("chiarel-essence");

  return (
    <section className="grid w-full md:grid-cols-2">
      <div className="bg-redochre px-6 py-14 text-ivory md:flex md:min-h-[min(720px,calc(100svh-5rem))] md:items-center md:px-12 md:py-20">
        <div className="hero-in mx-auto max-w-[34rem] md:mx-0">
          <p className="text-[11px] uppercase tracking-[0.42em] md:text-[12px] md:tracking-[0.5em]">
            CHIAREL™ · The House of Clarity™
          </p>
          <h1 className="mt-5 font-serif text-[clamp(2.1rem,1.2rem+2.8vw,3.4rem)] leading-[1.06] tracking-[-0.015em] md:mt-7">
            Advancing Cellular Clarity™.
          </h1>
          <p className="mt-5 text-[14px] leading-[1.7] md:mt-6 md:text-[15px]">
            Exceptional skin discipline recognises no boundaries. Formulated in
            Isola del Liri under pharmacist guidance, CHIAREL™ begins with the
            face, where Clarity Essence™ brings peptide and postbiotic
            precision to the look of firmer, smoother skin, and continues to
            the neck and décolleté, where the same discipline is rarely
            applied.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 md:mt-9">
            <Link
              href="/ritual"
              className="btn-press inline-block border border-ivory bg-ivory px-9 py-4 text-[11px] uppercase tracking-[0.34em] text-ink transition hover:bg-peachdust"
            >
              Begin the Ritual
            </Link>
            <Link
              href="/shop/clarity-essence"
              className="text-[1.2rem] font-semibold text-champagne underline decoration-champagne underline-offset-[6px]"
            >
              Shop Clarity Essence
            </Link>
          </div>
          {isPurchasable(essence) && (
            <p className="mt-8 text-[12px] leading-relaxed md:mt-9">
              From{" "}
              <span className="tabular-nums font-serif text-base">
                ${perDayPrice(essence.price.subscription)}
              </span>{" "}
              a day
              <span className="block text-[11px]">
                ${essence.price.subscription} every {DELIVERY_DAYS} days with
                subscription · ${essence.price.oneTime} one-time
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="relative flex min-h-[22rem] items-center justify-center bg-peachdust px-6 py-12 md:min-h-0">
        <Image
          src="/assets/products/clarity-essence-bottle.png"
          alt="Clarity Essence™ in its glass bottle"
          width={600}
          height={600}
          priority
          sizes="(max-width: 768px) 80vw, 40vw"
          className="h-auto w-full max-w-[22rem] md:max-w-[26rem]"
        />
      </div>
    </section>
  );
}
