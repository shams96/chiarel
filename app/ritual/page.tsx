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

function RoutineRow({ slugs, dark = false }: { slugs: string[]; dark?: boolean }) {
  const body = dark ? "text-ivory/80" : "text-ink/75";
  const sub = dark ? "text-ivory/65" : "text-ink/65";
  const cta = dark
    ? "border border-ivory/70 text-ivory hover:border-champagne hover:text-champagne"
    : "border border-ink hover:border-ochre hover:text-ochre";
  return (
    <div className="mt-12 space-y-16">
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
              <p className={`mt-1 text-[12px] uppercase tracking-[0.14em] ${sub}`}>
                {p.descriptor}
              </p>
              <p className={`mt-4 max-w-md text-sm ${body}`}>{p.blurb}</p>
              <div className="mt-6 flex items-center gap-6">
                {isPurchasable(p) ? (
                  <>
                    <Link
                      href={`/shop/${p.slug}`}
                      className={`px-6 py-2.5 text-[11px] uppercase tracking-[0.2em] transition ${cta}`}
                    >
                      ${p.price.subscription} — Subscribe
                    </Link>
                    <span className={`text-[12px] ${sub}`}>
                      ${p.price.oneTime} one-time
                    </span>
                  </>
                ) : (
                  <Link
                    href={`/shop/${p.slug}`}
                    className={`px-6 py-2.5 text-[11px] uppercase tracking-[0.2em] transition ${cta}`}
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

type Step = { n: number; label: string };

function SunMark() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" aria-hidden="true">
      <circle cx="20" cy="20" r="7" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return <line key={i} x1={20 + Math.cos(a) * 11.5} y1={20 + Math.sin(a) * 11.5} x2={20 + Math.cos(a) * 15.5} y2={20 + Math.sin(a) * 15.5} />;
      })}
    </svg>
  );
}

function MoonMark() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" aria-hidden="true">
      <path d="M26 8.5A12.5 12.5 0 1 0 31.5 28 10 10 0 0 1 26 8.5Z" />
    </svg>
  );
}

// One full-width band per time of day, so the two routines read as two distinct
// places on the page: Morning is a light, warm band; Evening a deep green one.
function RoutineBand({
  id,
  time,
  title,
  steps,
  slugs,
  dark = false,
}: {
  id: string;
  time: "Morning" | "Evening";
  title: string;
  steps: Step[];
  slugs: string[];
  dark?: boolean;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`scroll-mt-20 ${dark ? "bg-garden text-ivory" : "border-y border-champagne/50 bg-champagne/25 text-ink"}`}
    >
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className={`flex items-center gap-4 ${dark ? "text-champagne" : "text-ochre"}`}>
          {dark ? <MoonMark /> : <SunMark />}
          <p className="text-[11px] font-medium uppercase tracking-[0.3em]">{time}</p>
        </div>
        <h2 id={`${id}-title`} className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
          {title}
        </h2>
        <ol className={`mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 font-serif text-xl ${dark ? "text-ivory/90" : "text-ink/85"}`}>
          {steps.map((st, i) => (
            <li key={st.n} className="flex items-center gap-3">
              {i > 0 && <span aria-hidden="true" className={dark ? "text-ivory/40" : "text-ink/40"}>→</span>}
              <span>
                <span className={dark ? "text-champagne" : "text-ochre"}>Step {st.n}</span> {st.label}
              </span>
            </li>
          ))}
        </ol>
        <RoutineRow slugs={slugs} dark={dark} />
      </div>
    </section>
  );
}

export default function RitualPage() {
  const lip = getProductOrThrow("lip-concentrate");

  return (
    <>
    <div className="mx-auto max-w-6xl px-6 pt-16">
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

      <nav aria-label="Jump to a routine" className="mt-8 flex gap-3">
        <a href="#morning" className="inline-flex min-h-[44px] items-center border border-ink/30 px-5 text-[11px] uppercase tracking-[0.2em] text-ink/80 transition hover:border-ochre hover:text-ochre">Morning</a>
        <a href="#evening" className="inline-flex min-h-[44px] items-center border border-garden bg-garden px-5 text-[11px] uppercase tracking-[0.2em] text-ivory transition hover:bg-garden/90">Evening</a>
      </nav>
    </div>

    <div className="mt-14">
      <RoutineBand
        id="morning"
        time="Morning"
        title="The Morning Ritual"
        steps={[
          { n: 1, label: "CHIAREL Essence™" },
          { n: 2, label: "Terra Radiance Crème™" },
        ]}
        slugs={morningRoute}
      />
      <RoutineBand
        id="evening"
        time="Evening"
        title="The Evening Ritual"
        dark
        steps={[
          { n: 1, label: "CHIAREL Essence™" },
          { n: 2, label: "Recovery Masque™" },
          { n: 3, label: "N1 Neck & Décolleté Renewal Emulsion™" },
        ]}
        slugs={eveningRoute}
      />
    </div>

    <div className="mx-auto max-w-6xl px-6 pb-16">
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
    </>
  );
}
