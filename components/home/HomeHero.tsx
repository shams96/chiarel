import Image from "next/image";
import Link from "next/link";
import { perDayPrice, DELIVERY_DAYS } from "@/lib/pricing";
import { getProductOrThrow, isPurchasable } from "@/lib/products";
import RibbonBand from "@/components/home/RibbonBand";

// First-viewport hero: Red Ochre text panel on the left, the festive Clarity
// Essence scene (frosted flower, CHIAREL velvet ribbon) filling the right half
// edge to edge; stacked on phones. Type and gutters scale with the viewport so
// the hero stays generous on wide monitors instead of sitting small in a corner.
// A strip of the printed ribbon closes the hero.
export default function HomeHero() {
  const essence = getProductOrThrow("chiarel-essence");

  return (
    <>
      <section className="grid w-full md:grid-cols-[5fr_6fr]">
        <div className="bg-redochre px-[clamp(1.5rem,4.5vw,7rem)] py-14 text-ivory md:flex md:min-h-[min(880px,calc(100svh-5rem))] md:items-center md:py-20">
          <div className="hero-in max-w-[46rem]">
            <p className="text-[clamp(11px,0.55rem+0.35vw,15px)] uppercase tracking-[0.42em] md:tracking-[0.5em]">
              CHIAREL™ · The House of Clarity™
            </p>
            <h1 className="mt-5 font-serif text-[clamp(2.4rem,1rem+4.2vw,6.6rem)] leading-[1.04] tracking-[-0.015em] md:mt-8">
              Advancing Cellular Clarity™.
            </h1>
            <p className="mt-6 text-[clamp(1rem,0.8rem+0.55vw,1.5rem)] leading-[1.65] md:mt-8">
              Exceptional skin discipline recognises no boundaries. Formulated in
              Isola del Liri under pharmacist guidance, CHIAREL™ begins with the
              face, where Clarity Essence™ brings peptide and postbiotic
              precision to the look of firmer, smoother skin, and continues to
              the neck and décolleté, where the same discipline is rarely
              applied.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-9 gap-y-5 md:mt-11">
              <Link
                href="/ritual"
                className="btn-press inline-block border border-ivory bg-ivory px-[clamp(2.25rem,3vw,3.5rem)] py-[clamp(1rem,1.2vw,1.4rem)] text-[clamp(11px,0.6rem+0.3vw,14px)] uppercase tracking-[0.34em] text-ink transition hover:bg-peachdust"
              >
                Begin the Ritual
              </Link>
              <Link
                href="/shop/clarity-essence"
                className="text-[clamp(1.2rem,1rem+0.5vw,1.7rem)] font-semibold text-champagne underline decoration-champagne underline-offset-[6px]"
              >
                Shop Clarity Essence
              </Link>
            </div>
            {isPurchasable(essence) && (
              <p className="mt-9 text-[clamp(13px,0.7rem+0.35vw,18px)] leading-relaxed md:mt-11">
                From{" "}
                <span className="tabular-nums font-serif text-[1.35em]">
                  ${perDayPrice(essence.price.subscription)}
                </span>{" "}
                a day
                <span className="block text-[0.9em]">
                  ${essence.price.subscription} every {DELIVERY_DAYS} days with
                  subscription · ${essence.price.oneTime} one-time
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="relative aspect-[4/5] w-full md:aspect-auto">
          <Image
            src="/assets/products/clarity-essence-festive-scene.jpg"
            alt="Clarity Essence™ in its glass bottle on a plinth, framed by a frosted flower and green CHIAREL velvet ribbon"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 55vw"
            className="object-cover md:object-[50%_62%]"
          />
        </div>
      </section>
      <RibbonBand tone="green" />
    </>
  );
}
