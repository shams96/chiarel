import ResponsiveImage from "@/components/ResponsiveImage";
import Link from "next/link";
import { getProduct, productImageAlt, isPurchasable, studioImage, type Product, productHref } from "@/lib/products";
import { NEUTRAL_FRAME_BG } from "@/lib/color";
import { productHoverClass } from "@/lib/motion";

// Shared by /ritual (full variant) and the home page (compact variant) so the
// two surfaces can never drift on route order. Five products, two moments:
// the evening runs lightest texture first (Essence, Eye, Night, Neck).
export const morningRoute = ["chiarel-essence", "terra-radiance-creme"];
export const eveningRoute = [
  "chiarel-essence",
  "eye-contour-concentrate",
  "recovery-masque",
  "n1-neck-decollete",
];

// Tile size by position, not superlative: Essence leads both bands, the Neck &
// Décolleté Crème closes the evening band.
const LEAD_SLUGS = new Set(["chiarel-essence", "n1-neck-decollete"]);

// `slug`, `purpose`, `ingredients` and `note` carry the ritual page's owner
// copy; the compact home variant shows labels only.
export type Step = {
  n: number;
  label: string;
  slug?: string;
  purpose?: string;
  ingredients?: string;
  note?: string;
};
type Entry = { product: Product; lead: boolean };

function entriesFor(slugs: string[]): Entry[] {
  const out: Entry[] = [];
  for (const slug of slugs) {
    const p = getProduct(slug);
    if (p) out.push({ product: p, lead: LEAD_SLUGS.has(slug) });
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

function RoutineRow({ entries, steps }: { entries: Entry[]; steps: Step[] }) {
  const body = "text-ink/75";
  const sub = "text-ink/65";
  const cta = "border border-ink hover:border-ochre hover:text-ochre";
  return (
    <div className="mt-12 space-y-16">
      {entries.map(({ product: p }, i) => {
        const st = steps.find((x) => x.slug === p.slug);
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
            <ResponsiveImage
              src={studioImage(p)}
              alt={productImageAlt(p)}
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="w-full md:w-1/2">
            <h3 className="font-serif text-3xl">{st?.label ?? p.name}</h3>
            {st ? (
              <>
                {st.purpose && <p className={`mt-2 max-w-md text-sm ${body}`}>{st.purpose}</p>}
                {st.ingredients && <p className={`mt-2 max-w-md text-sm ${sub}`}>{st.ingredients}</p>}
                {st.note && <p className={`mt-2 max-w-md text-sm ${body}`}>{st.note}</p>}
              </>
            ) : (
              <>
                <p className={`mt-1 text-[12px] uppercase tracking-[0.14em] ${sub}`}>
                  {p.descriptor}
                </p>
                <p className={`mt-4 max-w-md text-sm ${body}`}>{p.blurb}</p>
              </>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              {isPurchasable(p) ? (
                <>
                  <Link
                    href={productHref(p.slug)}
                    className={`inline-flex min-h-[44px] items-center px-6 text-[12px] uppercase tracking-[0.2em] transition ${cta}`}
                  >
                    ${p.price.subscription} — Subscribe
                  </Link>
                  <span className={`text-[12px] ${sub}`}>
                    ${p.price.oneTime} one-time
                  </span>
                </>
              ) : (
                <Link
                  href={productHref(p.slug)}
                  className={`inline-flex min-h-[44px] items-center px-6 text-[12px] uppercase tracking-[0.2em] transition ${cta}`}
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

// Compact (home) composition, one per time of day so the two rituals read as
// two distinct places. Both sit on the shared 4 / 8 / 12 column grid and show
// a ruled numeral per step. `data-size` keeps the hierarchy assertable.
//   Morning: asymmetric pair, Essence large, Day Crème offset below it.
//   Evening: a descending sequence, Essence large, Eye and Night beside it,
//            the Neck & Décolleté Crème large on the right of the second row.
function tileSpan(time: "Morning" | "Evening", lead: boolean, i: number, last: boolean) {
  if (time === "Morning") {
    return lead ? "md:col-span-5 lg:col-span-7" : "md:col-span-3 lg:col-span-5 lg:mt-24";
  }
  if (lead && last) return "md:col-span-4 lg:col-span-6 lg:col-start-7";
  return lead ? "md:col-span-4 lg:col-span-6" : "md:col-span-4 lg:col-span-3";
}

function CompactRow({ entries, time }: { entries: Entry[]; time: "Morning" | "Evening" }) {
  const sub = "text-ink/65";
  const tag = "text-ochre";
  const spans = mobileSpans(entries);
  return (
    <ul className="grid-12 mt-10 gap-y-10 md:mt-12 md:gap-y-12">
      {entries.map(({ product: p, lead }, i) => {
        const label = p.badge;
        const last = i === entries.length - 1;
        return (
          <li
            key={p.slug}
            data-size={lead ? "lead" : "standard"}
            className={`${spans[i] ? "col-span-4" : "col-span-2"} ${tileSpan(time, lead, i, last)} min-w-0`}
          >
            <Link
              href={productHref(p.slug)}
              className="group block min-h-[44px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ochre"
            >
              <p aria-hidden="true" className="mb-4 flex items-end gap-3 text-ink">
                <span className="out font-serif text-numeral-sm">{String(i + 1).padStart(2, "0")}</span>
                <span className="mb-2 h-px flex-1 bg-ink/20" />
              </p>
              <div
                className="relative aspect-[4/5] overflow-hidden"
                style={{ backgroundColor: NEUTRAL_FRAME_BG }}
              >
                <ResponsiveImage
                  src={studioImage(p)}
                  alt={productImageAlt(p)}
                  sizes={lead ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                  className={`object-cover ${productHoverClass(p.step)}`}
                />
              </div>
              {label && (
                <p className={`mt-3 text-eyebrow uppercase ${tag}`}>{label}</p>
              )}
              <p className={`${label ? "mt-1" : "mt-3"} font-serif ${lead ? "text-h3" : "text-h4"} leading-tight`}>
                {p.name}
              </p>
              <p className={`mt-1 text-caption ${sub}`}>{p.descriptor}</p>
              {isPurchasable(p) && (
                <p className={`mt-1 text-caption ${sub}`}>${p.price.subscription} with subscription</p>
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
}: {
  id: string;
  time: "Morning" | "Evening";
  title: string;
  steps: Step[];
  slugs: string[];
  dark?: boolean;
  variant?: "full" | "compact";
}) {
  const entries = entriesFor(slugs);
  const compact = variant === "compact";
  // Compact bands sit inside a page section that owns the h2.
  const Heading = compact ? "h3" : "h2";
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      data-variant={variant}
      className={`scroll-mt-20 ${dark ? "border-y border-ink/20 bg-cloud text-ink" : "border-y border-champagne/50 bg-champagne/25 text-ink"}`}
    >
      <div className={`mx-auto w-full max-w-container px-margin ${compact ? "py-16 md:py-24" : "py-16 md:py-20"}`}>
        <div className={`flex items-center gap-4 ${"text-ochre"}`}>
          {!compact && (dark ? <MoonMark /> : <SunMark />)}
          <p className="text-eyebrow uppercase">{time}</p>
        </div>
        <Heading id={`${id}-title`} className={`mt-4 font-serif leading-tight ${compact ? "text-h2" : "text-4xl md:text-5xl"}`}>
          {title}
        </Heading>
        <ol className={`mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 font-serif text-xl ${"text-ink/85"}`}>
          {steps.map((st, i) => (
            <li key={st.n} className="flex items-center gap-3">
              {i > 0 && <span aria-hidden="true" className={"text-ink/40"}>→</span>}
              <span>
                <span className={"text-ochre"}>Step {st.n}</span> {st.label}
              </span>
            </li>
          ))}
        </ol>
        {compact ? <CompactRow entries={entries} time={time} /> : <RoutineRow entries={entries} steps={steps} />}
      </div>
    </section>
  );
}
