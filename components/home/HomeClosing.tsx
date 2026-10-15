import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import ProductCard from "@/components/ProductCard";
import { NEUTRAL_FRAME_BG } from "@/lib/color";
import { products, getProductOrThrow, productImageAlt } from "@/lib/products";

// Beyond the Ritual: Cellular Cleanser and Lip Concentrate remain fully live
// and purchasable; they sit outside the core ritual.
export function HomeBeyondRitual() {
  const featuredIcons = products.filter((p) =>
    ["cellular-cleanser", "lip-concentrate"].includes(p.slug)
  );
  return (
    <section className="section-y bg-cloud/60">
      <div className="section-x">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl">Beyond the Ritual</h2>
            <p className="mt-2 max-w-xl text-sm text-ink/70">
              Additional CHIAREL products, available anytime — not part of
              the core ritual, but never discontinued.
            </p>
          </div>
          <Link
            href="/shop"
            className="btn-press border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.18em] text-ochre"
          >
            See the Full House
          </Link>
        </Reveal>
        <div className="mt-10 grid gap-10 sm:grid-cols-2">
          {featuredIcons.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.12}>
              <ProductCard product={p} hidePrice />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// Final CTA — the Founding Pair (CHIAREL Essence + N1) and the full set.
// Price/route/CTAs unchanged. Slot for an email-signup component: add it
// directly after this section in app/page.tsx.
export function HomeFinalCta() {
  const essence = getProductOrThrow("chiarel-essence");
  const n1 = getProductOrThrow("n1-neck-decollete");
  const foundingPair = getProductOrThrow("the-founding-pair");
  const ritualSet = getProductOrThrow("the-ritual-set");

  return (
    <section className="section-y bg-champagne/25">
      <div className="section-x flex flex-col items-center gap-10 md:flex-row">
        <Reveal className="grid w-full grid-cols-5 gap-4 md:w-3/5">
          <div
            className="card-elevated product-frame col-span-3 aspect-[4/5]"
            style={{ backgroundColor: NEUTRAL_FRAME_BG }}
          >
            <Image src={essence.image} alt={productImageAlt(essence)} fill sizes="35vw" />
          </div>
          <div
            className="card-elevated product-frame col-span-2 aspect-[4/5] self-end"
            style={{ backgroundColor: NEUTRAL_FRAME_BG }}
          >
            <Image src={n1.image} alt={productImageAlt(n1)} fill sizes="25vw" />
          </div>
        </Reveal>
        <Reveal delay={0.15} className="w-full md:w-2/5">
          <h2 className="font-serif text-3xl">The Founding Pair</h2>
          <p className="mt-2 text-sm text-ink/60">The Signature Serum &amp; N1</p>
          <p className="mt-3 max-w-md text-sm text-ink/70">
            CHIAREL Essence and N1 Neck &amp; Décolleté Renewal Emulsion —
            face and décolleté, delivered together every 45 days.
          </p>
          <p className="mt-4 text-sm">
            <span className="tabular-nums font-serif text-2xl">
              ${foundingPair.price!.subscription}
            </span>
            <span className="ml-2 text-[12px] text-ink/65">
              every 45 days with subscription · ${foundingPair.price!.oneTime}{" "}
              one-time
            </span>
          </p>
          <div className="mt-6 flex items-center gap-6">
            <Link
              href="/shop/the-founding-pair"
              className="btn-press inline-block border border-ink px-8 py-3 text-[12px] uppercase tracking-[0.25em] transition hover:border-ochre hover:text-ochre"
            >
              Begin the Ritual
            </Link>
            <Link
              href="/shop/the-ritual-set"
              className="btn-press border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.18em] text-ochre"
            >
              The complete set — ${ritualSet.price!.subscription}
            </Link>
          </div>
          <p className="mt-6 text-[11px] uppercase tracking-[0.14em] text-ink/65">
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
          of you, formulate it properly, and disclose exactly what went
          in. Advancing Cellular Clarity™ against Modern Biological
          Stress™ is the mission behind every formula, including N1. It is
          the same discipline behind La Bella Figura — presenting one&rsquo;s
          best self, quietly, without announcement.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
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
