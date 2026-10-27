import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { NEUTRAL_FRAME_BG } from "@/lib/color";
import { getProductOrThrow, productImageAlt, productHref, studioImage } from "@/lib/products";

// Final CTA: begin the ritual with the Essence and the Day Crème, the two morning
// steps. Slot for an email-signup component: add it directly after this section
// in app/page.tsx.
export function HomeFinalCta() {
  const essence = getProductOrThrow("chiarel-essence");
  const day = getProductOrThrow("terra-radiance-creme");

  return (
    <section className="section-y bg-redochre text-ivory">
      <div className="section-x flex flex-col items-center gap-10 md:flex-row">
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
          <h2 className="font-serif text-3xl">Begin with the face. Do not stop there.</h2>
          <p className="mt-2 text-sm">Five formulations, each made for one purpose</p>
          <p className="mt-3 max-w-md text-sm">
            Start with Clarity Essence and Clarity Day Crème, the two steps
            of the morning.
          </p>
          <p className="mt-4 text-sm">
            <span className="tabular-nums font-serif text-2xl">
              ${essence.price!.subscription}
            </span>
            <span className="ml-2 text-[12px]">
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
  );
}

// Philosophy + House note, merged into one closing block.
export function HomePhilosophy() {
  return (
    <Reveal className="section-y-lg mx-auto max-w-3xl px-6 text-center">
      <section>
        <h2 className="font-serif text-lg text-ink/65">The Philosophy</h2>
        <p className="mt-5 font-serif text-3xl leading-relaxed text-ink">
          &ldquo;Skin is not one thing. A house built to serve it should not
          pretend otherwise.&rdquo;
        </p>
        <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-ink/70">
          CHIAREL Intelligence™ began as a question at a kitchen table —
          the working method still holds: start with the biology in front
          of you, formulate it properly, and name the ingredients that
          matter. Advancing Cellular Clarity™ against Modern Biological
          Stress™ is the mission behind every formula. It is
          the same discipline behind La Bella Figura — presenting one&rsquo;s
          best self, quietly, without announcement.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-7">
          <Link
            href="/journal/three-skins-one-house"
            className="btn-press inline-block border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.18em] text-ochre"
          >
            Read the Origin Story
          </Link>
          <Link
            href="/house"
            className="btn-press inline-block border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.18em] text-ochre"
          >
            Discover the House
          </Link>
        </div>
      </section>
    </Reveal>
  );
}
