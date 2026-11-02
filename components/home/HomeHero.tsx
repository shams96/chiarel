import Link from "next/link";
import ResponsiveImage from "@/components/ResponsiveImage";
import Container from "@/components/layout/Container";
import Grid from "@/components/layout/Grid";
import FocusLadder from "@/components/layout/FocusLadder";
import { perDayPrice, DELIVERY_DAYS } from "@/lib/pricing";
import { getProductOrThrow, isPurchasable } from "@/lib/products";

// Section 01, Hero, in the Focus Ladder direction: the word "Clarity" steps
// down from a hairline outline to a solid letter (decorative, aria-hidden),
// the real h1 and the approved supporting copy sit beneath it, and the Clarity
// Essence scene is a hard-edged plate on a Red Ochre block at the right. Cloud
// ground, one primary action, left-weighted on the 12-column grid. Copy,
// price line and photograph are unchanged from the previous hero.
export default function HomeHero() {
  const essence = getProductOrThrow("chiarel-essence");

  return (
    <section className="pb-section pt-5 md:pt-6">
      <Container>
        <Grid className="items-baseline border-b border-hairline pb-5">
          <p className="col-span-4 text-eyebrow uppercase md:col-span-4">CHIAREL™ · The House of Clarity™</p>
          <p className="col-span-4 text-eyebrow uppercase md:col-span-4 md:col-start-5 md:text-right lg:col-span-4 lg:col-start-9">
            Formulated in Isola del Liri, Italy
          </p>
        </Grid>

        <Grid className="mt-8 gap-y-12 md:mt-12">
          <div className="hero-in col-span-4 md:col-span-8 lg:col-span-8">
            <FocusLadder className="max-w-full" />
            <h1 className="mt-8 font-serif text-h2 md:mt-10">Advancing Cellular Clarity™.</h1>
            <p className="mt-5 max-w-measure text-body text-ink/80">
              Exceptional skin discipline recognises no boundaries. Formulated in
              Isola del Liri under pharmacist guidance, CHIAREL™ begins with the
              face, where Clarity Essence™ brings peptide and postbiotic
              precision to the look of firmer, smoother skin, and continues to
              the neck and décolleté, where the same discipline is rarely
              applied.
            </p>
            <div className="mt-8 md:mt-10">
              <Link
                href="/ritual"
                className="btn-press inline-flex min-h-[48px] items-center bg-ink px-10 text-eyebrow uppercase text-ivory transition hover:bg-ochre"
              >
                Begin the Ritual
              </Link>
            </div>
            {isPurchasable(essence) && (
              <p className="mt-8 text-caption leading-relaxed">
                From{" "}
                <span className="tabular-nums font-serif text-h4">
                  ${perDayPrice(essence.price.subscription)}
                </span>{" "}
                a day
                <span className="mt-1 block text-ink/75">
                  ${essence.price.subscription} every {DELIVERY_DAYS} days with
                  subscription · ${essence.price.oneTime} one-time
                </span>
              </p>
            )}
          </div>

          <div className="relative col-span-4 md:col-span-5 lg:col-span-4 lg:col-start-9">
            <div className="relative aspect-[4/5] w-full bg-ochre">
              <div className="absolute -bottom-5 -right-5 left-5 top-5 border border-ink">
                <ResponsiveImage
                  src="/assets/products/clarity-essence-festive-scene-v2.jpg"
                  alt="Clarity Essence™ in its glass bottle on a plinth, framed by a frosted flower and green CHIAREL velvet ribbon"
                  sizes="(max-width: 768px) 90vw, (max-width: 1024px) 45vw, 30vw"
                  priority
                  className="object-cover object-[50%_62%]"
                />
              </div>
              <span
                aria-hidden="true"
                className="vert-word absolute -right-8 top-0 hidden text-eyebrow uppercase lg:block"
              >
                Clarity Essence™
              </span>
            </div>
            <p className="mt-10 flex justify-between gap-4 border-t border-ink pt-3 text-caption">
              <span>Clarity Essence™</span>
              <span>For fine lines and firmness</span>
            </p>
          </div>
        </Grid>
      </Container>
    </section>
  );
}
