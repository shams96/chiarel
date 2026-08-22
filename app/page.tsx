import Image from "next/image";
import Link from "next/link";
import { products, ritualProducts, getProduct } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import RitualCarousel from "@/components/RitualCarousel";
import EvidenceGrid from "@/components/EvidenceGrid";
import Reveal from "@/components/Reveal";
import { productTint } from "@/lib/color";

export default function Home() {
  const essence = getProduct("chiarel-essence")!;
  const masque = getProduct("recovery-masque")!;
  const foundingPair = getProduct("the-founding-pair")!;
  const ritualSet = getProduct("the-ritual-set")!;
  const featuredIcons = products.filter((p) =>
    ["cellular-cleanser", "lip-concentrate"].includes(p.slug)
  );
  const evidenceProducts = products.filter((p) =>
    ["chiarel-essence", "terra-radiance-creme", "recovery-masque"].includes(p.slug)
  );

  return (
    <>
      {/* Hero — full viewport, centered, minimal. One statement, one CTA. */}
      <section className="relative flex h-screen min-h-[640px] w-full items-center justify-center overflow-hidden bg-ink">
        <Image
          src="/assets/editorial/hero-shore-duo.png"
          alt="CHIAREL Essence™ and Recovery Masque™ at the shore"
          fill
          priority
          className="object-cover object-[80%_50%] opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/25 to-ink/60" />
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center text-ivory">
          <p className="text-[12px] uppercase tracking-[0.4em] text-champagne">
            House of Skin Intelligence™
          </p>
          <h1 className="mt-6 font-serif text-6xl leading-[1.05] md:text-7xl">
            Advancing
            <br />
            Cellular Clarity™
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-[15px] leading-relaxed text-ivory/80">
            Intelligent formulations, born at Isola del Liri, Italy — made to
            support the skin against Modern Biological Stress.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Link
              href="/ritual"
              className="inline-block border border-champagne px-10 py-4 text-[12px] uppercase tracking-[0.3em] text-champagne transition hover:bg-champagne hover:text-ink"
            >
              Enter the Ritual
            </Link>
            <Link
              href="/assessment"
              className="text-[11px] uppercase tracking-[0.2em] text-ivory/70 underline decoration-champagne/50 underline-offset-4 hover:text-champagne"
            >
              Not sure where to start? Take the Skin Assessment
            </Link>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-ivory/50">
          Scroll
        </div>
      </section>

      {/* Campaign banner — full-bleed editorial moment, not a two-column layout */}
      <section className="relative flex h-[70vh] min-h-[480px] w-full items-end overflow-hidden bg-ink">
        <Image
          src="/assets/editorial/hero-bright.png"
          alt="Isola del Liri, Italy — where CHIAREL formulations are made"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
        <Reveal className="relative z-10 mx-auto max-w-6xl px-6 pb-16 text-ivory">
          <p className="text-[11px] uppercase tracking-[0.3em] text-champagne">
            Provenance
          </p>
          <h2 className="mt-3 max-w-xl font-serif text-4xl leading-tight md:text-5xl">
            A Town Built Around a Waterfall
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ivory/75">
            An hour and a half from Rome, the Cascata Grande falls through
            the center of Isola del Liri itself — where every CHIAREL™
            formulation is made with our manufacturing partner, Natural You
            Srl.
          </p>
          <Link
            href="/journal/isola-del-liri-waterfall"
            className="mt-6 inline-block border-b border-champagne pb-0.5 text-[12px] uppercase tracking-[0.18em] text-champagne"
          >
            Read the Journal
          </Link>
        </Reveal>
      </section>

      {/* Evidence — the honest counterpart to a clinical-trial stat grid */}
      <section className="bg-ivory py-28">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mx-auto max-w-xl text-center">
            <p className="eyebrow">Clinically Dosed. No Hidden Blends.</p>
            <h2 className="mt-3 font-serif text-3xl leading-snug">
              Every Active, Stated. Not a Marketing Claim — a Matter of
              Record.
            </h2>
          </Reveal>
          <div className="mt-14">
            <EvidenceGrid products={evidenceProducts} />
          </div>
        </div>
      </section>

      {/* Signature Duo — the two hero treatments, no price (story, not shelf) */}
      <section className="border-y border-ink/10 bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="text-center">
            <p className="eyebrow">The Signature Duo</p>
            <h2 className="mt-2 font-serif text-3xl">
              The Signature Serum. The Nightly Recovery.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-10 sm:grid-cols-2">
            {[
              { ...essence, image: "/assets/products/essence-shore.png" },
              { ...masque, image: "/assets/products/masque-shore.png" },
            ].map((p, i) => {
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
                <Reveal key={p.slug} delay={i * 0.12}>
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
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Formulated By — enlarged founder/formulator credibility block */}
      <section className="bg-ink py-28 text-ivory">
        <Reveal className="mx-auto max-w-2xl px-6 text-center">
          <p className="eyebrow text-champagne">Formulated By</p>
          <h2 className="mt-3 font-serif text-4xl leading-snug">
            Grazia Savoriti
          </h2>
          <p className="mt-2 text-[12px] uppercase tracking-[0.2em] text-ivory/50">
            Pharmacist · Cosmetic &amp; Nutraceutical Research
          </p>
          <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-ivory/75">
            Every CHIAREL™ formulation is developed under her guidance and
            produced in small, fresh batches in Isola del Liri — made to
            order rather than held in standing inventory. The Cellular
            Intelligence Complex™ at the heart of CHIAREL Essence™ is
            formulated to support the skin&rsquo;s own regulatory processes.
          </p>
          <Link
            href="/science"
            className="mt-8 inline-block border-b border-champagne pb-0.5 text-[12px] uppercase tracking-[0.18em] text-champagne"
          >
            Explore the Science
          </Link>
        </Reveal>
      </section>

      {/* Ritual carousel — paced, not a shelf */}
      <section className="bg-ivory py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <p className="eyebrow">The Ritual</p>
            <h2 className="mt-2 font-serif text-3xl">
              Cleanse · Tone · Serum · Moisturize
            </h2>
            <p className="mt-4 max-w-2xl text-sm text-ink/70">
              The ritual, delivered. A subscription keeps every step arriving
              on your rhythm — the consistency the skin recognises.
            </p>
          </Reveal>
          <RitualCarousel products={ritualProducts} />
        </div>
      </section>

      {/* Founding Pair — the featured purchase, price shown once here */}
      <section className="bg-champagne/25">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 py-24 md:flex-row">
          <Reveal className="relative aspect-[4/3] w-full overflow-hidden rounded-sm md:w-1/2">
            <Image
              src="/assets/products/founding-pair.png"
              alt="The Founding Pair — CHIAREL Essence™ and Terra Radiance Crème™"
              fill
              sizes="50vw"
              className="object-cover"
            />
          </Reveal>
          <Reveal delay={0.15} className="w-full md:w-1/2">
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
          </Reveal>
        </div>
      </section>

      {/* Icon Products — curated selection, not the full shelf */}
      <section className="bg-cloud/60 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <p className="eyebrow">Icon Products of the House</p>
          </Reveal>
          <div className="mt-10 grid gap-10 sm:grid-cols-2">
            {featuredIcons.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.12}>
                <ProductCard product={p} hidePrice />
              </Reveal>
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

      {/* Editorial — Ritual philosophy */}
      <Reveal className="mx-auto max-w-3xl px-6 py-28 text-center">
        <section>
          <p className="eyebrow">The Philosophy</p>
          <p className="mt-5 font-serif text-3xl leading-relaxed text-ink">
            &ldquo;Skin is not one thing. A house built to serve it should not
            pretend otherwise.&rdquo;
          </p>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-ink/70">
            CHIAREL Intelligence™ began at a table, not a laboratory bench —
            the working method still holds: begin with the biology in front
            of you, not the biology the industry assumes. It is the same
            discipline behind La Bella Figura — presenting one&rsquo;s best
            self, quietly, without announcement.
          </p>
          <Link
            href="/journal/three-skins-one-house"
            className="mt-6 inline-block border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.18em] text-ochre"
          >
            Read the Origin Story
          </Link>
        </section>
      </Reveal>

      {/* House note */}
      <Reveal className="mx-auto max-w-3xl px-6 pb-28 text-center">
        <section>
          <p className="eyebrow">The House</p>
          <p className="mt-4 font-serif text-2xl leading-relaxed">
            From the waters of Isola del Liri — where the Cascata Grande
            falls through the town itself — CHIAREL™ practices La Bella
            Figura: the discipline of presenting one&rsquo;s best self,
            quietly.
          </p>
          <Link
            href="/house"
            className="mt-8 inline-block border-b border-ochre pb-1 text-[12px] uppercase tracking-[0.2em] text-ochre"
          >
            Discover the House
          </Link>
        </section>
      </Reveal>
    </>
  );
}
