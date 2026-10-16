import Image from "next/image";
import Link from "next/link";
import { getProduct, productImageAlt, isPurchasable, type Product } from "@/lib/products";
import { NEUTRAL_FRAME_BG } from "@/lib/color";
import { productHoverClass } from "@/lib/motion";

// Shared by /ritual (full variant) and the home page (compact variant) so the
// two surfaces can never drift on route order. Cellular Cleanser™ and Cellular
// Mist™ stay "optional preparation", linked from both pages, never removed.
export const morningRoute = ["chiarel-essence", "terra-radiance-creme"];
export const eveningRoute = ["chiarel-essence", "recovery-masque", "n1-neck-decollete"];

// Eye Contour is an OPTIONAL evening step, not part of the numbered ritual and
// not a launchRitual product: it is shown after Recovery Masque and before N1
// ("Apply nightly, after Recovery Masque™" in its howToUse).
export const eyeOptional = { slug: "eye-contour-concentrate", before: "n1-neck-decollete" } as const;
export const EYE_LABEL = "Optional · The Eye Step";

// Tile size by position, not superlative: Essence leads both bands, N1 closes
// the evening band. Terra and Recovery Masque stay standard size.
const LEAD_SLUGS = new Set(["chiarel-essence", "n1-neck-decollete"]);

export type Step = { n: number; label: string };
type Entry = { product: Product; optional: boolean; lead: boolean };

function entriesFor(slugs: string[], withEye: boolean): Entry[] {
  const out: Entry[] = [];
  for (const slug of slugs) {
    if (withEye && slug === eyeOptional.before) {
      const eye = getProduct(eyeOptional.slug);
      if (eye && eye.launchStatus === "launch" && isPurchasable(eye)) {
        out.push({ product: eye, optional: true, lead: false });
      }
    }
    const p = getProduct(slug);
    if (p) out.push({ product: p, optional: false, lead: LEAD_SLUGS.has(slug) });
  }
  return out;
}

// Mobile uses a 2-col grid: lead tiles span both columns; a standard tile
// spans both only when it has no standard partner to sit beside.
function mobileSpans(entries: Entry[]): boolean[] {
  let col = 0;
  return entries.map((e, i) => {
    if (e.lead) {
      col = 0;
      return true;
    }
    if (col === 0) {
      const next = entries[i + 1];
      if (next && !next.lead) {
        col = 1;
        return false;
      }
      return true;
    }
    col = 0;
    return false;
  });
}

export function SunMark() {
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

export function MoonMark() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" aria-hidden="true">
      <path d="M26 8.5A12.5 12.5 0 1 0 31.5 28 10 10 0 0 1 26 8.5Z" />
    </svg>
  );
}

function RoutineRow({ entries, dark = false }: { entries: Entry[]; dark?: boolean }) {
  const body = dark ? "text-ivory/80" : "text-ink/75";
  const sub = dark ? "text-ivory/65" : "text-ink/65";
  const tag = dark ? "text-champagne" : "text-ochre";
  const cta = dark
    ? "border border-ivory/70 text-ivory hover:border-champagne hover:text-champagne"
    : "border border-ink hover:border-ochre hover:text-ochre";
  return (
    <div className="mt-12 space-y-16">
      {entries.map(({ product: p, optional }, i) => (
        <section
          key={p.slug}
          data-optional={optional ? "true" : undefined}
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
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="w-full md:w-1/2">
            {optional && (
              <p className={`mb-3 text-[11px] font-medium uppercase tracking-[0.24em] ${tag}`}>
                {EYE_LABEL}
              </p>
            )}
            <h3 className="font-serif text-3xl">{p.name}</h3>
            <p className={`mt-1 text-[12px] uppercase tracking-[0.14em] ${sub}`}>
              {p.descriptor}
            </p>
            <p className={`mt-4 max-w-md text-sm ${body}`}>{p.blurb}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              {isPurchasable(p) ? (
                <>
                  <Link
                    href={`/shop/${p.slug}`}
                    className={`inline-flex min-h-[44px] items-center px-6 text-[11px] uppercase tracking-[0.2em] transition ${cta}`}
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
                  className={`inline-flex min-h-[44px] items-center px-6 text-[11px] uppercase tracking-[0.2em] transition ${cta}`}
                >
                  See product page — price to be announced
                </Link>
              )}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

// One short row of tiles. md+: a single flex row where lead tiles grow wider.
// `data-size` makes the hierarchy assertable.
function CompactRow({ entries, dark = false }: { entries: Entry[]; dark?: boolean }) {
  const sub = dark ? "text-ivory/70" : "text-ink/65";
  const tag = dark ? "text-champagne" : "text-ochre";
  const spans = mobileSpans(entries);
  return (
    <ul className="mt-8 grid grid-cols-2 gap-4 md:flex md:items-start md:gap-6">
      {entries.map(({ product: p, optional, lead }, i) => {
        const label = optional ? EYE_LABEL : p.badge;
        return (
          <li
            key={p.slug}
            data-size={lead ? "lead" : "standard"}
            data-optional={optional ? "true" : undefined}
            className={`${spans[i] ? "col-span-2" : ""} ${lead ? "md:flex-[1.3]" : "md:flex-1"} min-w-0`}
          >
            <Link
              href={`/shop/${p.slug}`}
              className="group block min-h-[44px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-champagne"
            >
              <div
                className="relative h-52 overflow-hidden md:h-64"
                style={{ backgroundColor: NEUTRAL_FRAME_BG }}
              >
                <Image
                  src={p.image}
                  alt={productImageAlt(p)}
                  fill
                  sizes={lead ? "(min-width: 768px) 30vw, 100vw" : "(min-width: 768px) 20vw, 50vw"}
                  className={`object-contain ${productHoverClass(p.step)}`}
                />
              </div>
              {label && (
                <p className={`mt-3 text-[11px] font-medium uppercase tracking-[0.2em] ${tag}`}>{label}</p>
              )}
              <p className={`${label ? "mt-1" : "mt-3"} font-serif ${lead ? "text-2xl" : "text-xl"} leading-tight`}>
                {p.name}
              </p>
              <p className={`mt-1 text-[12px] ${sub}`}>{p.descriptor}</p>
              {isPurchasable(p) && (
                <p className={`mt-1 text-[12px] ${sub}`}>${p.price.subscription} with subscription</p>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

// One full-width band per time of day, so the two routines read as two distinct
// places on the page: Morning is a light, warm band; Evening a deep green one.
export function RoutineBand({
  id,
  time,
  title,
  steps,
  slugs,
  dark = false,
  variant = "full",
  withEye = false,
}: {
  id: string;
  time: "Morning" | "Evening";
  title: string;
  steps: Step[];
  slugs: string[];
  dark?: boolean;
  variant?: "full" | "compact";
  /** Insert the optional Eye Contour step (never numbered) before N1. */
  withEye?: boolean;
}) {
  const entries = entriesFor(slugs, withEye);
  const compact = variant === "compact";
  // Compact bands sit inside a page section that owns the h2.
  const Heading = compact ? "h3" : "h2";
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      data-variant={variant}
      className={`scroll-mt-20 ${dark ? "bg-garden text-ivory" : "border-y border-champagne/50 bg-champagne/25 text-ink"}`}
    >
      <div className={`mx-auto max-w-6xl px-6 ${compact ? "py-12 md:py-14" : "py-16 md:py-20"}`}>
        <div className={`flex items-center gap-4 ${dark ? "text-champagne" : "text-ochre"}`}>
          {dark ? <MoonMark /> : <SunMark />}
          <p className="text-[11px] font-medium uppercase tracking-[0.3em]">{time}</p>
        </div>
        <Heading id={`${id}-title`} className={`mt-4 font-serif leading-tight ${compact ? "text-3xl md:text-4xl" : "text-4xl md:text-5xl"}`}>
          {title}
        </Heading>
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
        {compact ? <CompactRow entries={entries} dark={dark} /> : <RoutineRow entries={entries} dark={dark} />}
      </div>
    </section>
  );
}
