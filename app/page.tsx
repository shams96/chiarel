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
  const terraCreme = getProduct("terra-radiance-creme")!;
  const featuredIcons = products.filter((p) =>
    ["cellular-cleanser", "lip-concentrate"].includes(p.slug)
  );
  const evidenceProducts = products.filter((p) =>
    ["chiarel-essence", "terra-radiance-creme", "recovery-masque"].includes(p.slug)
  );

  return (
    <>
      {/* Hero — capped height so this photo's crop doesn't over-zoom on tall viewports; text anchored left, clear of the products on the right. */}
      <section className="relative flex h-[82vh] max-h-[760px] min-h-[560px] w-full items-center overflow-hidden bg-ink">
        <Image
          src="/assets/editorial/hero-shore-duo.png"
          alt="CHIAREL Essence™ and Recovery Masque™ at the shore"
          fill
          priority
          className="object-cover object-[88%_50%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/25 to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
          <div className="max-w-md text-ivory">
            <p className="text-[12px] uppercase tracking-[0.4em] text-champagne">
              House of Skin Intelligence™
            </p>
            <h1 className="mt-6 font-serif text-5xl leading-[1.05] md:text-6xl">
              Advancing
              <br />
              Cellular Clarity™
            </h1>
            <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-ivory/80">
              Intelligent formulations, born at Isola del Liri, Italy — made
              to support the skin against Modern Biological Stress.
            </p>
            <div className="mt-10 flex flex-col items-start gap-4">
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
        </div>
        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-ivory/50">
          Scroll
        </div>
      </section>

      {/* Campaign banner — text-only editorial moment. No real photo of Isola del Liri exists in
          the asset library yet (the only "editorial" images on hand are mislabeled "CHIAREL Rome"
          product-jar mockups, not location photography) — deliberately not forcing a mismatched
          image here rather than paper over that gap. Swap in a real place photo when one exists. */}
      <section className="section-y border-y border-ink/10 bg-garden text-ivory">
        <Reveal className="section-x-narrow text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-champagne">
            Provenance
          </p>
          <h2 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">
            CHIAREL™ Is Made at the Water&rsquo;s Source
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-ivory/75">
            Before the Liri falls through Isola del Liri as the Cascata
            Grande, it is met by the Fibreno — a river fed entirely by
            limestone karst springs, with no surface tributaries of its
            own. That confluence, water arriving newly filtered rather than
            run off the surface, is what gives The Cascata Complex™ its
            name and its place: formulated here, with our manufacturing
            partner Natural You Srl, rather than sourced from a distance.
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
      <section className="section-y-lg bg-ivory">
        <div className="section-x">
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
      <section className="section-y border-y border-ink/10 bg-white">
        <div className="section-x">
          <Reveal className="text-center">
            <p className="eyebrow">The Signature Duo</p>
            <h2 className="mt-2 font-serif text-3xl">
              The Signature Serum. The Nightly Recovery.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-10 sm:grid-cols-2">
            {[essence, masque].map((p, i) => {
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
                      className="product-frame aspect-square"
                      style={{ backgroundColor: productTint(p.color.hex) }}
                    >
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="transition duration-700 group-hover:scale-[1.03]"
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
      <section className="section-y-lg bg-ink text-ivory">
        <Reveal className="section-x-narrow text-center">
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
      <section className="section-y bg-ivory">
        <div className="section-x">
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
      <section className="section-y bg-champagne/25">
        <div className="section-x flex flex-col items-center gap-10 md:flex-row">
          <Reveal className="grid w-full grid-cols-2 gap-3 md:w-1/2">
            <div
              className="product-frame aspect-square"
              style={{ backgroundColor: productTint(essence.color.hex) }}
            >
              <Image src={essence.image} alt={essence.name} fill sizes="25vw" />
            </div>
            <div
              className="product-frame aspect-square"
              style={{ backgroundColor: productTint(terraCreme.color.hex) }}
            >
              <Image src={terraCreme.image} alt={terraCreme.name} fill sizes="25vw" />
            </div>
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
      <section className="section-y bg-cloud/60">
        <div className="section-x">
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
      <Reveal className="section-y-lg mx-auto max-w-3xl px-6 text-center">
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

      {/* House note — no top padding: intentionally reads as one closing pair with Philosophy above */}
      <Reveal className="mx-auto max-w-3xl px-6 pb-24 text-center md:pb-32">
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
