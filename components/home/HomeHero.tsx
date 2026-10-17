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
      className="relative w-full overflow-hidden"
      style={{ background: "linear-gradient(100deg, #EFEBDD 0%, #F4F1E8 45%, #F8F6F1 100%)" }}
    >
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-2 px-6 pb-8 pt-2 md:min-h-[min(760px,calc(100svh-5rem))] md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-6 md:py-10">
        <div className="product-reveal relative mx-auto w-full max-w-[420px] md:mx-0 md:justify-self-start">
          <div
            className="relative mx-auto aspect-[1116/1700] h-[min(52svh,460px)] md:h-[min(78svh,720px)]"
            style={{
              // Feather all four edges into the section tint so the photo reads
              // as a light-filled scene, not a rectangle pasted on the page.
              WebkitMaskImage:
                "linear-gradient(90deg, transparent 0%, #000 14%, #000 66%, transparent 100%), linear-gradient(180deg, transparent 0%, #000 8%, #000 92%, transparent 100%)",
              WebkitMaskComposite: "source-in",
              maskImage:
                "linear-gradient(90deg, transparent 0%, #000 14%, #000 66%, transparent 100%), linear-gradient(180deg, transparent 0%, #000 8%, #000 92%, transparent 100%)",
              maskComposite: "intersect",
              containerType: "inline-size",
            }}
          >
            <Image
              src="/assets/home/hero-hands-n1.jpg"
              alt="Two hands presenting the CHIAREL Neck & Décolleté Renewal Emulsion in its 40 ml green glass bottle"
              fill
              priority
              sizes="(max-width: 768px) 80vw, 480px"
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

        <div className="hero-in max-w-xl md:justify-self-start md:pl-4">
          <p className="text-[11px] uppercase tracking-[0.4em] text-ochre md:text-[12px] md:tracking-[0.5em]">
            CHIAREL™ · The House of Clarity™
          </p>
          <h1 className="mt-3 font-serif text-[clamp(2rem,1.3rem+3.6vw,4rem)] leading-[1.05] tracking-[-0.02em] text-ink md:mt-6">
            Skin clarity, made fresh in Isola del Liri.
          </h1>
          <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-ink/70 md:mt-6 md:text-[15px]">
            A focused morning and evening ritual, built around CHIAREL
            Essence™. Key ingredients named across our product pages.
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
