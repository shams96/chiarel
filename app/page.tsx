import Image from "next/image";
import Link from "next/link";
import { products, ritualProducts, getProduct } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export default function Home() {
  const icons = products.filter((p) => p.icon);
  const essence = getProduct("chiarel-essence")!;
  const masque = getProduct("recovery-masque")!;

  return (
    <>
      {/* Hero — Luxury Editorial (Photography Tier 1) */}
      <section className="relative h-[85vh] min-h-[560px] w-full overflow-hidden bg-ink">
        <Image
          src="/assets/editorial/hero-night.png"
          alt="Recovery Masque™ at dusk"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-6 pb-16 text-ivory">
          <p className="text-[12px] uppercase tracking-[0.3em] text-champagne">
            House of Skin Intelligence™
          </p>
          <h1 className="mt-3 max-w-2xl font-serif text-5xl leading-tight md:text-6xl">
            Advancing Cellular Clarity™
          </h1>
          <p className="mt-4 max-w-xl text-sm text-ivory/80">
            The Signature Serum. The Nightly Recovery. Born at Isola del Liri,
            Italy — intelligent formulations that support the skin against
            Modern Biological Stress™.
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
              Not sure where to start? Take the Skin Assessment™
            </Link>
          </div>
        </div>
      </section>

      {/* Signature Duo — the two hero treatments */}
      <section className="border-b border-ink/10 bg-ivory py-16">
        <div className="mx-auto max-w-6xl px-6">
          <p className="eyebrow text-center">The Signature Duo</p>
          <h2 className="mt-2 text-center font-serif text-3xl">
            The Serum. The Night.
          </h2>
          <div className="mt-10 grid gap-10 sm:grid-cols-2">
            {[essence, masque].map((p) => (
              <Link key={p.slug} href={`/shop/${p.slug}`} className="group">
                <div
                  className="relative aspect-square overflow-hidden rounded-sm"
                  style={{ backgroundColor: `${p.color.hex}55` }}
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
                <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-ink/50">
                  {p.step}
                </p>
                <p className="font-serif text-2xl">{p.name}</p>
                <p className="text-[13px] text-ink/60">{p.descriptor}</p>
                <p className="mt-2 text-sm">
                  <span className="font-medium">${p.price.subscription}</span>
                  <span className="ml-1 text-[12px] text-ink/50">
                    with subscription
                  </span>
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="border-b border-ink/10 bg-white/60">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 text-center sm:grid-cols-3">
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

      {/* Ritual strip */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="eyebrow">The Ritual</p>
        <h2 className="mt-2 font-serif text-3xl">
          Cleanse · Tone · Serum · Moisturize
        </h2>
        <div className="mt-10 grid gap-8 md:grid-cols-5">
          {ritualProducts.map((p) => (
            <Link key={p.slug} href={`/shop/${p.slug}`} className="group">
              <div
                className="relative aspect-square overflow-hidden rounded-sm"
                style={{ backgroundColor: `${p.color.hex}66` }}
              >
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  sizes="20vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
              <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-ink/50">
                {p.step}
              </p>
              <p className="font-serif text-lg leading-tight">{p.name}</p>
            </Link>
          ))}
        </div>
        <p className="mt-10 max-w-2xl text-sm text-ink/70">
          The ritual, delivered. A subscription keeps every step arriving on
          your rhythm — the consistency the skin recognises.
        </p>
      </section>

      {/* Ritual Set */}
      <section className="bg-champagne/25">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 py-16 md:flex-row">
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
              CHIAREL Essence™ and Terra Radiance Crème™ — the essential
              ritual in two gestures, delivered together every 45 days.
            </p>
            <p className="mt-4 text-sm">
              <span className="font-serif text-2xl">$240</span>
              <span className="ml-2 text-[12px] text-ink/50">
                every 45 days with subscription · $303 one-time
              </span>
            </p>
            <div className="mt-6 flex items-center gap-6">
              <Link
                href="/shop/the-founding-pair"
                className="inline-block border border-ink px-8 py-3 text-[12px] uppercase tracking-[0.25em] transition hover:border-ochre hover:text-ochre"
              >
                Begin the Ritual
              </Link>
              <Link
                href="/shop/the-ritual-set"
                className="border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.18em] text-ochre"
              >
                The complete set — $390
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Icon Products */}
      <section className="bg-cloud/60 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="eyebrow">Icon Products of the House</p>
          <div className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {icons.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* House note */}
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
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
