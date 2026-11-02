import Link from "next/link";
import ResponsiveImage from "@/components/ResponsiveImage";
import Container from "@/components/layout/Container";
import Grid from "@/components/layout/Grid";
import { perDayPrice, DELIVERY_DAYS } from "@/lib/pricing";
import { getProductOrThrow, isPurchasable } from "@/lib/products";

// Section 01, Hero: the mission line is the h1, set as a poster (big / small /
// big on a visible column grid, each word in a hairline band), then the one
// primary action, the price line and the approved supporting copy. The Clarity
// Essence scene is the large plate at the right: the jar on a mirror, in a
// hard-edged frame on a deep Red Ochre block. Cloud ground, 12-column grid.
export default function HomeHero() {
  const essence = getProductOrThrow("chiarel-essence");

  return (
    <section className="pb-section pt-5 md:pt-6">
      <Container>
        <Grid className="items-baseline border-b border-hairline pb-5">
          <p className="col-span-4 text-eyebrow uppercase md:col-span-4">CHIAREL™ · The House of Clarity™</p>
          <p className="col-span-4 text-eyebrow uppercase md:col-span-4 md:col-start-5 md:text-right lg:col-span-4 lg:col-start-9">
            Isola del Liri, Italy
          </p>
        </Grid>

        <Grid className="mt-8 gap-y-12 md:mt-12">
          <div className="hero-in col-span-4 md:col-span-8 lg:col-span-6">
            <h1 className="poster font-serif">
              <span className="poster-a">Advancing</span>{" "}
              <span className="poster-b">Cellular</span>{" "}
              <span className="poster-c">Clarity™.</span>
            </h1>
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
            <p className="mt-10 max-w-measure text-body text-ink/80">
              Exceptional skin discipline recognises no boundaries. Formulated in
              Isola del Liri under pharmacist guidance, CHIAREL™ begins with the
              face, where Clarity Essence™ brings peptide and postbiotic
              precision to the look of firmer, smoother skin, and continues to
              the neck and décolleté, where the same discipline is rarely
              applied.
            </p>
          </div>

          <div className="relative col-span-4 md:col-span-6 lg:col-span-6 lg:col-start-7">
            <div
              className="relative aspect-[4/5] w-full bg-ochre lg:aspect-[100/115]"
              style={{ backgroundImage: "linear-gradient(155deg, rgb(255 255 255 / 0.06) 0%, rgb(28 26 23 / 0.34) 100%)" }}
            >
              <div className="absolute -bottom-4 -right-4 left-4 top-4 border border-ink md:-bottom-6 md:-right-6 md:left-6 md:top-6 lg:-bottom-8 lg:-right-8 lg:left-12 lg:top-12">
                <ResponsiveImage
                  src="/assets/products/clarity-essence-mirror-scene.jpg"
                  alt="Clarity Essence™ in its glass bottle standing on a mirror, reflected beneath it, framed by a frosted flower and green CHIAREL velvet ribbon"
                  sizes="(max-width: 768px) 90vw, (max-width: 1024px) 50vw, 46vw"
                  priority
                  className="object-cover object-[50%_50%]"
                />
              </div>
              <span
                aria-hidden="true"
                className="vert-word absolute -right-10 top-0 hidden lg:-right-14 text-eyebrow uppercase lg:block"
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
