import Image from "next/image";
import Link from "next/link";
import { perDayPrice, DELIVERY_DAYS } from "@/lib/pricing";
import { getProductOrThrow, isPurchasable } from "@/lib/products";

// First-viewport hero: a warm, full-width editorial scene (hands presenting the
// N1 bottle) with the headline and one primary CTA beside it. The photo has no
// baked-in label text for the product name: the two label lines are live type
// positioned in image-relative percentages, so the wording follows the product
// data and the photo can be swapped without re-editing it. The wrapper keeps the
// photo's 1116:1700 aspect ratio so those percentages always land on the label.
export default function HomeHero() {
  const n1 = getProductOrThrow("n1-neck-decollete");

  return (
    <section
      className="relative w-full overflow-hidden [--hero-h:min(780px,calc(100svh-5rem))]"
      style={{ background: "linear-gradient(100deg, #EFEBDD 0%, #F4F1E8 45%, #F8F6F1 100%)" }}
    >
      <div className="product-reveal relative mx-auto w-full max-w-[420px] px-6 md:absolute md:inset-y-0 md:right-0 md:mx-0 md:w-1/2 md:max-w-none md:px-0">
        <div className="hero-photo-mask-lg relative h-full w-full md:overflow-hidden">
          {/* Mobile: the photo sits above the copy at its own aspect ratio.
              Desktop: it bleeds off the right edge, scaled to the column
              width but never wider than 1.1x the hero height, so the whole
              bottle (30-76% of the photo's height) stays inside the crop.
              The label overlay keeps image-relative percentages. */}
          <div
            className="hero-photo-mask relative mx-auto aspect-[1116/1700] h-[min(52svh,460px)] md:absolute md:right-0 md:top-1/2 md:mx-0 md:h-auto md:w-[min(100%,calc(var(--hero-h)*1.1))] md:-translate-y-1/2"
            style={{ containerType: "inline-size" }}
          >
            <Image
              src="/assets/home/hero-hands-n1.jpg"
              alt="Two hands presenting the CHIAREL Neck & Décolleté Renewal Emulsion in its 40 ml green glass bottle"
              fill
              priority
              sizes="(max-width: 768px) 80vw, 50vw"
              className="object-cover"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-[31.8%] top-[63%] flex -translate-x-1/2 flex-col items-center text-center font-serif leading-[1.25] text-[#E9D79F]"
              style={{ fontSize: "2.2cqw" }}
            >
              <span>Neck &amp; Décolleté</span>
              <span className="my-[0.35em] block h-px w-[110%] bg-[#E9D79F]/60" />
              <span>Renewal Emulsion</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl items-center px-6 pb-8 pt-2 md:min-h-[var(--hero-h)] md:grid-cols-2 md:py-10">
        <div className="hero-in max-w-xl">
          <p className="text-[11px] uppercase tracking-[0.4em] text-ochre md:text-[12px] md:tracking-[0.5em]">
            CHIAREL™ · The House of Clarity™
          </p>
          <h1 className="mt-3 font-serif text-[clamp(2rem,1.3rem+3.6vw,4rem)] leading-[1.05] tracking-[-0.02em] text-ink md:mt-6">
            The ritual continues below the jawline.
          </h1>
          <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-ink/70 md:mt-6 md:text-[15px]">
            N1 Neck &amp; Décolleté Renewal Emulsion™, a nightly emulsion for the
            neck, jawline and décolleté, made fresh to order in Isola del Liri.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3 md:mt-8">
            <Link
              href="/ritual"
              className="btn-press inline-block border border-ink bg-ink px-8 py-3.5 text-[12px] uppercase tracking-[0.3em] text-ivory transition hover:border-ochre hover:bg-ochre"
            >
              Begin the Ritual
            </Link>
            <Link
              href={`/shop/${n1.slug}`}
              className="text-[11px] uppercase tracking-[0.2em] text-ink/70 underline decoration-ochre/50 underline-offset-4 hover:text-ochre"
            >
              Shop N1
            </Link>
          </div>
          {isPurchasable(n1) && (
            <p className="mt-4 text-[12px] leading-relaxed text-ink/65">
              N1 Neck &amp; Décolleté from{" "}
              <span className="tabular-nums font-serif text-base text-ink">
                ${perDayPrice(n1.price.subscription)}
              </span>{" "}
              a day
              <span className="mt-1 block text-[11px] text-ink/55">
                ${n1.price.subscription} every {DELIVERY_DAYS} days with
                subscription · ${n1.price.oneTime} one-time
              </span>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
