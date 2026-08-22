import Image from "next/image";
import Link from "next/link";
import { products, ritualProducts, getProduct } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import RitualCarousel from "@/components/RitualCarousel";
import { productTint } from "@/lib/color";

export default function Home() {
  const essence = getProduct("chiarel-essence")!;
  const masque = getProduct("recovery-masque")!;
  const foundingPair = getProduct("the-founding-pair")!;
  const ritualSet = getProduct("the-ritual-set")!;
  const featuredIcons = products.filter((p) =>
    ["cellular-cleanser", "lip-concentrate"].includes(p.slug)
  );

  return (
    <>
      {/* Hero — Luxury Editorial (Photography Tier 1) */}
      <section className="relative h-[85vh] min-h-[560px] w-full overflow-hidden bg-ink">
        <Image
          src="/assets/editorial/hero-shore-duo.png"
          alt="CHIAREL Essence™ and Recovery Masque™ at the shore"
          fill
          priority
          className="object-cover object-[95%_55%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-6 pb-16 text-ivory">
          <p className="text-[12px] uppercase tracking-[0.3em] text-champagne">
            House of Skin Intelligence™
          </p>
          <h1 className="mt-3 max-w-xs font-serif text-5xl leading-tight md:max-w-sm md:text-6xl">
            Advancing Cellular Clarity™
          </h1>
          <p className="mt-4 max-w-xl text-sm text-ivory/80">
            The Signature Serum. The Nightly Recovery. Born at Isola del Liri,
            Italy — intelligent formulations that support the skin against
            Modern Biological Stress.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link
              href="/ritual"
              className="inline-block border border-champagne px-8 py-3 text-[12px] uppercase tracking-[0.25em] text-champagne transition hover:bg-champagne hover:text-ink"
            >
              Enter the Ritual
            </Link>
            <Link
              href="/assessment"
              className="text-[12px] uppercase tracking-[0.2em] text-ivory/90 underline decoration-champagne/60 underline-offset-4 hover:text-champagne"
            >
              Not sure where to start? Take the Skin Assessment
            </Link>
          </div>
        </div>
      </section>

      {/* Signature Duo — the two hero treatments, no price (story, not shelf) */}
      <section className="border-b border-ink/10 bg-ivory py-24">
        <div className="mx-auto max-w-6xl px-6">
          <p className="eyebrow text-center">The Signature Duo</p>
          <h2 className="mt-2 text-center font-serif text-3xl">
            The Signature Serum. The Nightly Recovery.
          </h2>
          <div className="mt-12 grid gap-10 sm:grid-cols-2">
            {[
              { ...essence, image: "/assets/products/essence-shore.png" },
              { ...masque, image: "/assets/products/masque-shore.png" },
            ].map((p) => {
              const meta = (
                <Link href={`/shop/${p.slug}`}>
                  <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-ink/50">
                    {p.step}
                  </p>
                  <p className="font-serif text-2xl">{p.name}</p>
                  <p className="text-[13px] text-ink/60">{p.descriptor}</p>
                  <span className="mt-2 inline-block border-b border-ochre/60 pb-0.5 text-[11px] uppercase tracking-[0.18em] text-ochre">
                    Discover
                  </span>
                </Link>
              );

              return (
                <div key={p.slug}>
                  <Link href={`/shop/${p.slug}`} className="group block">
                    <div
                      className="relative aspect-square overflow-hidden rounded-sm"
                      style={{ backgroundColor: productTint(p.color.hex) }}
                    >
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition duration-700 group-hover:scale-[1.03]"
                      />
                      {p.badge && (
                        <span className="absolute left-3 top-3 bg-ivory/90 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-ochre">
                          {p.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                  {meta}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Editorial — Provenance */}
      <section className="bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 py-24 md:flex-row">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm md:w-1/2">
            <Image
              src="/assets/editorial/hero-bright.png"
              alt="Isola del Liri, Italy — where CHIAREL formulations are made"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="w-full md:w-1/2">
            <p className="eyebrow">Provenance</p>
            <h2 className="mt-2 font-serif text-3xl leading-snug">
              A Town Built Around a Waterfall
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/70">
              An hour and a half from Rome, in the Liri valley, the Cascata
              Grande falls through the center of Isola del Liri itself. It is
              here, with our manufacturing partner Natural You Srl, that
              every CHIAREL™ formulation is made — water, craft, and
              proximity to the people making the decisions, rather than
              formulation outsourced to distance.
            </p>
            <Link
              href="/journal/isola-del-liri-waterfall"
              className="mt-6 inline-block border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.18em] text-ochre"
            >
              Read the Journal
            </Link>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="border-y border-ink/10 bg-cloud/40">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 text-center sm:grid-cols-3">
          {[
            ["The Ritual, Delivered", "Subscriptions arrive on your rhythm — pause or adjust anytime"],
            ["Complimentary Shipping", "On every ritual order, with considered packaging"],
            ["Samples With Every Order", "Two treatments to discover, chosen by the House"],
          ].map(([t, d]) => (
            <div key={t}>
              <p className="text-[11px] uppercase tracking-[0.22em] text-ochre">{t}</p>
              <p className="mt-1 text-[12px] text-ink/60">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Editorial — Ritual philosophy */}
      <section className="mx-auto max-w-3xl px-6 py-28 text-center">
        <p className="eyebrow">The Philosophy</p>
        <p className="mt-5 font-serif text-3xl leading-relaxed text-ink">
          &ldquo;Skin is not one thing. A house built to serve it should not
          pretend otherwise.&rdquo;
        </p>
        <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-ink/70">
          CHIAREL Intelligence™ began at a table, not a laboratory bench — the
          working method still holds: begin with the biology in front of you,
          not the biology the industry assumes. It is the same discipline
          behind La Bella Figura — presenting one&rsquo;s best self, quietly,
          without announcement.
        </p>
        <Link
          href="/journal/three-skins-one-house"
          className="mt-6 inline-block border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.18em] text-ochre"
        >
          Read the Origin Story
        </Link>
      </section>

      {/* Ritual carousel — paced, not a shelf */}
      <section className="border-t border-ink/10 bg-ivory py-24">
        <div className="mx-auto max-w-6xl px-6">
          <p className="eyebrow">The Ritual</p>
          <h2 className="mt-2 font-serif text-3xl">
            Cleanse · Tone · Serum · Moisturize
          </h2>
          <p className="mt-4 max-w-2xl text-sm text-ink/70">
            The ritual, delivered. A subscription keeps every step arriving
            on your rhythm — the consistency the skin recognises.
          </p>
          <RitualCarousel products={ritualProducts} />
        </div>
      </section>

      {/* Editorial — Formulation */}
      <section className="bg-white">
        <div className="mx-auto flex max-w-6xl flex-col-reverse items-center gap-12 px-6 py-24 md:flex-row">
          <div className="w-full md:w-1/2">
            <p className="eyebrow">Formulated By</p>
            <h2 className="mt-2 font-serif text-3xl leading-snug">
              A Considered Practice
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/70">
              Every CHIAREL™ formulation is developed under the guidance of
              Grazia Savoriti, a pharmacist with deep expertise in cosmetic
              and nutraceutical research, and produced in small, fresh
              batches in Isola del Liri — made to order rather than held in
              standing inventory. The Cellular Intelligence Complex™ at the
              heart of CHIAREL Essence™ is formulated to support the
              skin&rsquo;s own regulatory processes.
            </p>
            <Link
              href="/science"
              className="mt-6 inline-block border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.18em] text-ochre"
            >
              Explore the Science
            </Link>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm md:w-1/2">
            <Image
              src="/assets/editorial/hero.png"
              alt="CHIAREL™ at Isola del Liri"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Founding Pair — the featured purchase, price shown once here */}
      <section className="bg-champagne/25">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 py-24 md:flex-row">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm md:w-1/2">
            <Image
              src="/assets/products/founding-pair.png"
              alt="The Founding Pair — CHIAREL Essence™ and Terra Radiance Crème™"
              fill
              sizes="50vw"
              className="object-cover"
            />
          </div>
          <div className="w-full md:w-1/2">
            <p className="eyebrow">The Founding Pair</p>
            <h2 className="mt-2 font-serif text-3xl">
              The Signature Serum &amp; The Icon
            </h2>
            <p className="mt-3 max-w-md text-sm text-ink/70">
              CHIAREL Essence and Terra Radiance Crème — the essential
              ritual in two gestures, delivered together every 45 days.
            </p>
            <p className="mt-4 text-sm">
              <span className="font-serif text-2xl">
                ${foundingPair.price.subscription}
              </span>
              <span className="ml-2 text-[12px] text-ink/50">
                every 45 days with subscription · ${foundingPair.price.oneTime}{" "}
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
                className="border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.18em] text-ochre"
              >
                The complete set — ${ritualSet.price.subscription}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Icon Products — curated selection, not the full shelf */}
      <section className="bg-cloud/60 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <p className="eyebrow">Icon Products of the House</p>
          <div className="mt-10 grid gap-10 sm:grid-cols-2">
            {featuredIcons.map((p) => (
              <ProductCard key={p.slug} product={p} hidePrice />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/shop"
              className="inline-block border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.18em] text-ochre"
            >
              See the Full House
            </Link>
          </div>
        </div>
      </section>

      {/* House note */}
      <section className="mx-auto max-w-3xl px-6 py-28 text-center">
        <p className="eyebrow">The House</p>
        <p className="mt-4 font-serif text-2xl leading-relaxed">
          From the waters of Isola del Liri — where the Cascata Grande falls
          through the town itself — CHIAREL™ practices La Bella Figura: the
          discipline of presenting one&rsquo;s best self, quietly.
        </p>
        <Link
          href="/house"
          className="mt-8 inline-block border-b border-ochre pb-1 text-[12px] uppercase tracking-[0.2em] text-ochre"
        >
          Discover the House
        </Link>
      </section>
    </>
  );
}
