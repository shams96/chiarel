import Link from "next/link";
import { perDayPrice, DELIVERY_DAYS } from "@/lib/pricing";
import { getProductOrThrow, isPurchasable } from "@/lib/products";

// Section 01, Hero: Red Ochre text panel on the left, the festive Clarity
// Essence scene filling the right half edge to edge; stacked on phones. One
// primary action. The text column starts on the shared container edge at every
// width (so it lines up with the sections below at 1440 and 1920), and the
// supporting statement is the existing approved copy, set to a readable measure.
export default function HomeHero() {
  const essence = getProductOrThrow("chiarel-essence");

  return (
    <section className="grid w-full md:grid-cols-[5fr_6fr]">
      <div className="bg-ochre px-margin py-14 text-ivory md:flex md:min-h-[min(880px,calc(100svh-5rem))] md:items-center md:py-20 md:pl-[max(var(--margin),calc((100vw-var(--container))/2+var(--margin)))] md:pr-gutter">
        <div className="hero-in max-w-[38rem]">
          <p className="text-eyebrow uppercase">CHIAREL™ · The House of Clarity™</p>
          <h1 className="mt-6 font-serif text-display md:mt-8">
            Advancing Cellular Clarity™.
          </h1>
          <div className="mt-6 h-px w-24 bg-ivory/40 md:mt-8" aria-hidden="true" />
          <p className="mt-6 max-w-measure text-body md:mt-8">
            Exceptional skin discipline recognises no boundaries. Formulated in
            Isola del Liri under pharmacist guidance, CHIAREL™ begins with the
            face, where Clarity Essence™ brings peptide and postbiotic
            precision to the look of firmer, smoother skin, and continues to
            the neck and décolleté, where the same discipline is rarely
            applied.
          </p>
          <div className="mt-9 md:mt-11">
            <Link
              href="/ritual"
              className="btn-press inline-flex min-h-[48px] items-center border border-ivory bg-ivory px-10 text-eyebrow uppercase text-ink transition hover:bg-cloud"
            >
              Begin the Ritual
            </Link>
          </div>
          {isPurchasable(essence) && (
            <p className="mt-9 text-caption leading-relaxed md:mt-11">
              From{" "}
              <span className="tabular-nums font-serif text-h4">
                ${perDayPrice(essence.price.subscription)}
              </span>{" "}
              a day
              <span className="mt-1 block text-ivory/85">
                ${essence.price.subscription} every {DELIVERY_DAYS} days with
                subscription · ${essence.price.oneTime} one-time
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="relative aspect-[4/5] w-full md:aspect-auto">
        {/* Plain <img>: images.unoptimized is on (no runtime resizer), so the
            responsive set is pre-generated at rest and listed in srcSet. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/products/clarity-essence-festive-scene-v2.jpg"
          srcSet="/assets/products/clarity-essence-festive-scene-v2-640.jpg 640w, /assets/products/clarity-essence-festive-scene-v2-960.jpg 960w, /assets/products/clarity-essence-festive-scene-v2.jpg 1500w"
          sizes="(max-width: 768px) 100vw, 55vw"
          width={1500}
          height={1792}
          alt="Clarity Essence™ in its glass bottle on a plinth, framed by a frosted flower and green CHIAREL velvet ribbon"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover md:object-[50%_62%]"
        />
      </div>
    </section>
  );
}
