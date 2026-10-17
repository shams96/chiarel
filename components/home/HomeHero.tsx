import Image from "next/image";
import Link from "next/link";
import { perDayPrice, DELIVERY_DAYS } from "@/lib/pricing";
import { getProductOrThrow, isPurchasable } from "@/lib/products";

// First-viewport hero: one continuous 2.4:1 scene (hands presenting the N1 bottle
// on a warm cream field) with the copy set directly on it. The scene is
// anchored to the right and sized to at least the hero height * 2.4, so on any
// viewport it fills the frame edge to edge with no seams, and only the empty
// left side is ever cropped. The two label lines are live type placed in
// scene-relative percentages (cqw), so the product name follows the product
// data and always lands on the bottle.
export default function HomeHero() {
  const n1 = getProductOrThrow("n1-neck-decollete");

  return (
    <section className="relative w-full overflow-hidden border-b border-ink/10 bg-[#F6F1E4] [--hero-h:min(780px,calc(100svh-5rem))] [--sh:min(46svh,420px)] md:[--sh:var(--hero-h)]">
      <div className="relative h-[var(--sh)] w-full overflow-hidden md:absolute md:inset-0 md:h-auto">
        <div
          className="hero-scene-in absolute right-0 top-1/2 aspect-[2400/1000] w-[max(100%,calc(var(--sh)*2.4))] -translate-y-1/2"
          style={{ containerType: "inline-size" }}
        >
          <Image
            src="/assets/home/hero-hands-n1-wide.jpg"
            alt="Two hands presenting the CHIAREL Neck & Décolleté Renewal Emulsion in its 40 ml green glass bottle"
            fill
            priority
            sizes="(max-width: 768px) 260vw, 100vw"
            className="object-cover"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[74.2%] top-[66.7%] flex -translate-x-1/2 flex-col items-center text-center font-serif leading-[1.25] text-[#E9D79F]"
            style={{ fontSize: "0.83cqw" }}
          >
            <span>Neck &amp; Décolleté</span>
            <span className="my-[0.35em] block h-px w-[110%] bg-[#E9D79F]/60" />
            <span>Renewal Emulsion</span>
          </div>
        </div>
        {/* A whisper of warm light so the product glows against the field */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 34% 62% at 77% 50%, rgba(240,216,176,0.35) 0%, rgba(240,216,176,0) 72%)",
          }}
        />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl items-center px-6 pb-9 pt-5 md:h-[var(--hero-h)] md:py-0">
        <div className="hero-in max-w-[30rem]">
          <p className="flex items-center gap-4 text-[11px] uppercase tracking-[0.42em] text-ochre md:text-[12px] md:tracking-[0.5em]">
            <span aria-hidden="true" className="hidden h-px w-10 bg-ochre/60 md:block" />
            CHIAREL™ · The House of Clarity™
          </p>
          <h1 className="mt-4 font-serif text-[clamp(2.1rem,1.2rem+2.8vw,3.4rem)] leading-[1.06] tracking-[-0.015em] text-ink md:mt-7">
            The ritual continues below the jawline.
          </h1>
          <p className="mt-4 max-w-[24rem] text-[14px] leading-[1.7] text-ink/70 md:mt-6 md:text-[15px]">
            N1 Neck &amp; Décolleté Renewal Emulsion™, a nightly emulsion for the
            neck, jawline and décolleté, made fresh to order in Isola del Liri.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 md:mt-9">
            <Link
              href="/ritual"
              className="btn-press inline-block border border-ink bg-ink px-9 py-4 text-[11px] uppercase tracking-[0.34em] text-ivory transition hover:border-ochre hover:bg-ochre"
            >
              Begin the Ritual
            </Link>
            <Link
              href={`/shop/${n1.slug}`}
              className="text-[11px] uppercase tracking-[0.24em] text-ink/70 underline decoration-ochre/50 underline-offset-[6px] hover:text-ochre"
            >
              Shop N1
            </Link>
          </div>
          {isPurchasable(n1) && (
            <div className="mt-7 flex items-center gap-4 md:mt-9">
              <span aria-hidden="true" className="hidden h-px w-10 bg-ochre/50 md:block" />
              <p className="text-[12px] leading-relaxed text-ink/65">
                From{" "}
                <span className="tabular-nums font-serif text-base text-ink">
                  ${perDayPrice(n1.price.subscription)}
                </span>{" "}
                a day
                <span className="block text-[11px] text-ink/55">
                  ${n1.price.subscription} every {DELIVERY_DAYS} days with
                  subscription · ${n1.price.oneTime} one-time
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
