import Image from "next/image";
import Link from "next/link";
import { getProduct, getProductOrThrow, productImageAlt, isPurchasable } from "@/lib/products";
import { NEUTRAL_FRAME_BG } from "@/lib/color";

export const metadata = { title: "The Ritual", alternates: { canonical: "/ritual" } };

// Replaces the prior "Cleanse → Tone → Serum → Moisturize" five-step
// framing with the CHIAREL Four-Product Ritual, per
// CHIAREL_FOUR_PRODUCT_IMPLEMENTATION_PLAN.md §5/§9. Cellular Cleanser™ and
// Cellular Mist™ remain fully live, purchasable, and listed here under
// "Optional Preparation" — never removed.
const morningRoute = ["chiarel-essence", "terra-radiance-creme"];
const eveningRoute = ["chiarel-essence", "recovery-masque", "n1-neck-decollete"];
const optionalPreparation = ["cellular-cleanser", "cellular-mist"];

function RoutineRow({ slugs }: { slugs: string[] }) {
  return (
    <div className="mt-16 space-y-20">
      {slugs.map((slug, i) => {
        const p = getProduct(slug);
        if (!p) return null;
        return (
          <section
            key={p.slug}
            className={`flex flex-col items-center gap-10 md:flex-row ${
              i % 2 ? "md:flex-row-reverse" : ""
            }`}
          >
            <div
              className="relative aspect-square w-full overflow-hidden md:w-1/2"
              style={{ backgroundColor: NEUTRAL_FRAME_BG }}
            >
              <Image
                src={p.image}
                alt={productImageAlt(p)}
                fill
                sizes="50vw"
                className="object-cover"
              />
            </div>
            <div className="w-full md:w-1/2">
              <h3 className="font-serif text-3xl">{p.name}</h3>
              <p className="mt-1 text-[12px] uppercase tracking-[0.14em] text-ink/65">
                {p.descriptor}
              </p>
              <p className="mt-4 max-w-md text-sm text-ink/75">{p.blurb}</p>
              <div className="mt-6 flex items-center gap-6">
                {isPurchasable(p) ? (
                  <>
                    <Link
                      href={`/shop/${p.slug}`}
                      className="border border-ink px-6 py-2.5 text-[11px] uppercase tracking-[0.2em] transition hover:border-ochre hover:text-ochre"
                    >
                      ${p.price.subscription} — Subscribe
                    </Link>
                    <span className="text-[12px] text-ink/65">
                      ${p.price.oneTime} one-time
                    </span>
                  </>
                ) : (
                  <Link
                    href={`/shop/${p.slug}`}
                    className="border border-ink px-6 py-2.5 text-[11px] uppercase tracking-[0.2em] transition hover:border-ochre hover:text-ochre"
                  >
                    See product page — price to be announced
                  </Link>
                )}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default function RitualPage() {
  const lip = getProductOrThrow("lip-concentrate");

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="max-w-2xl font-serif text-4xl leading-tight">
        The CHIAREL Four-Product Ritual
      </h1>
      {/* DRAFT — OWNER / REGULATORY APPROVAL REQUIRED */}
      <p className="mt-4 max-w-xl text-sm text-ink/70">
        Hydration and comfort by day. Face recovery and dedicated
        neck-and-décolleté renewal by night.
      </p>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        <Link
          href="/assessment"
          className="inline-block border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.16em] text-ochre"
        >
          Take the Skin Assessment™ to find your starting point
        </Link>
        <Link
          href="/build-your-ritual"
          className="inline-block border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.16em] text-ochre"
        >
          Or build your own ritual, step by step
        </Link>
      </div>

      <section className="mt-14">
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/65">Morning</p>
        <p className="mt-2 font-serif text-2xl">
          CHIAREL Essence™ <span className="text-ink/40">→</span> Terra Radiance Crème™
        </p>
      </section>
      <RoutineRow slugs={morningRoute} />

      <section className="mt-24 border-t border-ink/10 pt-14">
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/65">Evening</p>
        <p className="mt-2 font-serif text-2xl">
          CHIAREL Essence™ <span className="text-ink/40">→</span> Recovery Masque™{" "}
          <span className="text-ink/40">→</span> N1 Neck &amp; Décolleté Renewal Emulsion™
        </p>
      </section>
      <RoutineRow slugs={eveningRoute} />

      <section id="optional-preparation" className="mt-24 border-t border-ink/10 pt-14">
        <h2 className="font-serif text-2xl">Optional Preparation</h2>
        <p className="mt-2 max-w-xl text-sm text-ink/70">
          Cellular Cleanser™ and Cellular Mist™ remain fully available — an
          optional cleanse-and-tone step ahead of either routine above.
        </p>
        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          {optionalPreparation.map((slug) => {
            const p = getProduct(slug);
            if (!p) return null;
            return (
              <Link key={p.slug} href={`/shop/${p.slug}`} className="group block">
                <div
                  className="relative aspect-square w-full overflow-hidden"
                  style={{ backgroundColor: NEUTRAL_FRAME_BG }}
                >
                  <Image src={p.image} alt={productImageAlt(p)} fill sizes="50vw" className="object-cover" />
                </div>
                <p className="mt-3 font-serif text-xl">{p.name}</p>
                <p className="mt-1 text-[12px] text-ink/60">{p.descriptor}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-24 border-t border-ink/10 pt-14">
        <h2 className="font-serif text-2xl">Beyond the Ritual</h2>
        <div className="mt-6 flex flex-col items-center gap-10 md:flex-row">
          <div
            className="relative aspect-square w-full overflow-hidden md:w-1/3"
            style={{ backgroundColor: NEUTRAL_FRAME_BG }}
          >
            <Image src={lip.image} alt={productImageAlt(lip)} fill sizes="33vw" className="object-cover" />
          </div>
          <div>
            <h3 className="font-serif text-2xl">{lip.name}</h3>
            <p className="text-sm text-ink/60">{lip.descriptor}</p>
            <Link
              href={`/shop/${lip.slug}`}
              className="mt-4 inline-block border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.2em] text-ochre"
            >
              Discover
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
