import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import RibbonBand from "@/components/home/RibbonBand";
import { NEUTRAL_FRAME_BG } from "@/lib/color";
import { getProductOrThrow, productImageAlt, productHref, studioImage } from "@/lib/products";

// Final CTA: begin the ritual with the Essence and the Day Crème, the two morning
// steps. Slot for an email-signup component: add it directly after this section
// in app/page.tsx.
export function HomeFinalCta() {
  const essence = getProductOrThrow("chiarel-essence");
  const day = getProductOrThrow("terra-radiance-creme");

  return (
    <>
    <RibbonBand tone="green" />
    <section className="section-y bg-redochre text-ivory">
      <div className="mx-auto flex max-w-[96rem] flex-col items-center gap-10 px-[clamp(1.5rem,4.5vw,7rem)] md:flex-row md:gap-[clamp(2.5rem,5vw,7rem)]">
        <Reveal className="grid w-full grid-cols-5 gap-4 md:w-3/5">
          <div
            className="card-elevated product-frame col-span-3 aspect-[4/5]"
            style={{ backgroundColor: NEUTRAL_FRAME_BG }}
          >
            <Image src={studioImage(essence)} alt={productImageAlt(essence)} fill sizes="35vw" />
          </div>
          <div
            className="card-elevated product-frame col-span-2 aspect-[4/5] self-end"
            style={{ backgroundColor: NEUTRAL_FRAME_BG }}
          >
            <Image src={studioImage(day)} alt={productImageAlt(day)} fill sizes="25vw" />
          </div>
        </Reveal>
        <Reveal delay={0.15} className="w-full md:w-2/5">
          <h2 className="font-serif text-[clamp(2rem,1rem+2.8vw,4.4rem)] leading-[1.08]">
            Begin with the face. Do not stop there.
          </h2>
          <p className="mt-3 text-[clamp(1rem,0.85rem+0.4vw,1.4rem)]">Five formulations, each made for one purpose</p>
          <p className="mt-3 max-w-xl text-[clamp(1rem,0.85rem+0.4vw,1.4rem)] leading-relaxed">
            Start with Clarity Essence and Clarity Day Crème, the two steps
            of the morning.
          </p>
          <p className="mt-5 text-[clamp(0.95rem,0.8rem+0.4vw,1.3rem)]">
            <span className="tabular-nums font-serif text-[clamp(1.5rem,1.1rem+1vw,2.5rem)]">
              ${essence.price!.subscription}
            </span>
            <span className="ml-2 text-[clamp(12px,0.65rem+0.3vw,16px)]">
              Clarity Essence, every 45 days with subscription · $
              {essence.price!.oneTime} one-time
            </span>
          </p>
          <div className="mt-6 flex items-center gap-6">
            <Link
              href={productHref("chiarel-essence")}
              className="btn-press inline-block border border-ivory bg-ivory px-8 py-3 text-[12px] uppercase tracking-[0.25em] text-ink transition hover:bg-peachdust"
            >
              Begin the Ritual
            </Link>
            <Link
              href="/shop"
              className="btn-press border-b border-ivory pb-0.5 text-[12px] uppercase tracking-[0.18em] text-ivory"
            >
              See the full House
            </Link>
          </div>
          <p className="mt-6 text-[11px] uppercase tracking-[0.14em]">
            Available online only at chiarel.com — not sold in retail
            stores or through other sellers.
          </p>
        </Reveal>
      </div>
    </section>
    </>
  );
}

// Philosophy + House note, merged into one closing block. A photograph of the
// town on one side and the quote, set large, on the other.
export function HomePhilosophy() {
  return (
    <section className="bg-ivory">
      <div className="mx-auto grid max-w-[84rem] items-center gap-10 px-[clamp(1.5rem,3vw,3rem)] py-20 md:grid-cols-[0.8fr_1.2fr] md:gap-20 md:py-28">
        <Reveal>
          <div className="relative mx-auto aspect-[3/4] w-full max-w-[26rem] overflow-hidden">
            <Image
              src="/assets/journal/isola-del-liri-bridge.jpg"
              alt="A woman in white on the old bridge at Isola del Liri, with the Cascata Grande and the castle behind her"
              fill
              sizes="(max-width: 768px) 90vw, 26rem"
              className="object-cover"
            />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-[11px] font-normal uppercase tracking-[0.3em] text-redochre">The Philosophy</h2>
          <p className="mt-6 border-l-4 border-redochre pl-6 font-serif text-[clamp(1.75rem,1.1rem+2.2vw,3.1rem)] leading-[1.2] text-garden">
            &ldquo;Skin is not one thing. A house built to serve it should not
            pretend otherwise.&rdquo;
          </p>
          <p className="mt-8 max-w-xl text-[15px] leading-relaxed text-ink/80">
            CHIAREL Intelligence™ began as a question at a kitchen table —
            the working method still holds: start with the biology in front
            of you, formulate it properly, and name the ingredients that
            matter. Advancing Cellular Clarity™ against Modern Biological
            Stress™ is the mission behind every formula. It is
            the same discipline behind La Bella Figura — presenting one&rsquo;s
            best self, quietly, without announcement.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-7">
            <Link
              href="/journal/three-skins-one-house"
              className="btn-press inline-block border-b border-redochre pb-0.5 text-[12px] uppercase tracking-[0.18em] text-redochre"
            >
              Read the Origin Story
            </Link>
            <Link
              href="/house"
              className="btn-press inline-block border-b border-redochre pb-0.5 text-[12px] uppercase tracking-[0.18em] text-redochre"
            >
              Discover the House
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
