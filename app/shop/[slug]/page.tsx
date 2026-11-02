import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getProduct, getProductByPath, productHref, products, productImageAlt, isPurchasable, publishedInci, type Product } from "@/lib/products";
import PurchaseOptions from "@/components/PurchaseOptions";
import TrackViewItem from "@/components/TrackViewItem";
import StickyPurchaseBar from "@/components/StickyPurchaseBar";
import ProductGallery from "@/components/ProductGallery";
import ProductAccordions from "@/components/ProductAccordions";
import AddPairButton from "@/components/AddPairButton";
import Reveal from "@/components/Reveal";
import Section from "@/components/layout/Section";
import Grid from "@/components/layout/Grid";
import Eyebrow from "@/components/layout/Eyebrow";
import { FREE_FROM_SENTENCE, formulationLine, isLaunchFormula } from "@/lib/formulation-line";
import EditorialFeature from "@/components/EditorialFeature";
import AmbientVideo from "@/components/AmbientVideo";
import { productJsonLd, productPageTitle, breadcrumbJsonLd } from "@/lib/seo";
import { NEUTRAL_FRAME_BG } from "@/lib/color";
import { productHoverClass } from "@/lib/motion";

// A compact, purely factual summary near the top of the page — GEO guidance
// calls for a short extractable block AI answer engines can lift directly,
// separate from the editorial blurb. Restates only facts already disclosed
// elsewhere on this same page (formulation origin and key ingredient
// names; never percentages): no price (changes independently of this content
// and isn't part of the spec) and no efficacy language.
function productFactSummary(p: Product): string {
  const origin = "formulated in Isola del Liri, Italy";

  const keyIngredients = (p.actives ?? []).map((a) => a.name);
  if (keyIngredients.length > 0) {
    return `${p.name} is ${origin}. Key ingredients include ${keyIngredients.join(", ")}.`;
  }

  return `${p.name} is ${origin}.`;
}

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.path }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getProductByPath(slug);
  if (!p) return {};
  return {
    title: productPageTitle(p.name, p.descriptor),
    description: p.blurb,
    alternates: { canonical: productHref(p.slug) },
    openGraph: { images: [{ url: p.og ?? p.image }] },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getProductByPath(slug);
  if (!p) notFound();

  return (
    <div>
      {isPurchasable(p) && (
        <TrackViewItem slug={p.slug} name={p.name} price={p.price.oneTime} />
      )}
      {/* No Product/Offer schema until a real, owner-approved price exists —
          publishing an Offer with a fabricated price would be inaccurate
          structured data. See CHIAREL_FOUR_PRODUCT_IMPLEMENTATION_PLAN.md §9. */}
      {isPurchasable(p) && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(p)) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Shop", path: "/shop" },
              { name: p.name, path: productHref(p.slug) },
            ])
          ),
        }}
      />

      {/* ANALYTICS SLOT — mount a small client component here (it renders
          nothing visible), e.g. <ViewItem slug={p.slug} />, to fire the
          view_item event once per product view. */}

      {/* Hero — gallery left, buy box right on desktop, stacked on mobile.
          Mobile hero is deliberately shorter (aspect-[5/4] vs. desktop's
          aspect-[4/5]) and the name/price block sits with tight spacing
          directly beneath it — a short image, not a full-viewport banner,
          so price and the buy CTA are reachable within roughly one
          screen-height of scroll on a phone, not two. */}
      <div className="mx-auto w-full max-w-container px-margin pt-4 md:pt-14">
        {/* Visible breadcrumb — a breadcrumbJsonLd script already exists on
            this page for search engines, but nothing rendered one for an
            actual visitor. Same typographic voice as every other small label
            on the site (11px uppercase tracked, ink/65 -> ochre on hover),
            not a new pattern. */}
        <nav aria-label="Breadcrumb" className="mb-4 text-[12px] uppercase tracking-[0.14em] text-ink/65 md:mb-6">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/shop" className="tap-area hover:text-ochre">Shop</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="min-w-0 truncate text-ink" aria-current="page">{p.name}</li>
          </ol>
        </nav>
        <div className="grid-12 gap-y-6 md:items-start">
          {/* Gallery column — see claudedocs/specs/product-image-gallery/ for
              the spec/plan. ProductGallery falls back to a single-image
              gallery built from `image`/`imageIsPlaceholder` when a product
              has no `gallery` array yet (every product today). */}
          <div className="col-span-4 md:col-span-4 md:sticky md:top-24 lg:col-span-7">
            <ProductGallery
              images={
                p.gallery ?? [{ src: p.image, alt: productImageAlt(p), role: "hero" }]
              }
              step={p.step}
              badge={p.badge}
            />
          </div>

          {/* Buy box column */}
          <div className="col-span-4 md:col-span-4 md:pt-2 lg:col-span-5 lg:col-start-8">
            <h1 className="font-serif text-h3 md:text-h2">
              {p.name}
            </h1>
            <p className="mt-2 text-caption text-ink/70">{p.descriptor}</p>
            {/* Slot: star rating / review count summary. Renders nothing
                until a real review source exists (never fabricated). */}
            <ProductRatingSlot slug={p.slug} />

            {/* Buy box comes straight after the title so price and the CTA
                sit within the first phone screen. The long-form blurb and
                fact summary follow below it. */}
            <div className="mt-4 md:mt-6">
              {isPurchasable(p) ? (
                <PurchaseOptions
                  slug={p.slug}
                  subscription={p.price.subscription}
                  oneTime={p.price.oneTime}
                />
              ) : (
                <PriceToBeAnnounced />
              )}
            </div>

            <p className="mt-6 max-w-measure text-body text-ink/80 md:mt-8">
              {p.blurb}
            </p>
            {p.role && (
              <p className="mt-4 inline-block border border-ink/20 px-3 py-1 text-eyebrow uppercase text-ochre">
                {p.role}
              </p>
            )}
            <p className="mt-4 text-[12px] leading-relaxed text-ink/65">
              {productFactSummary(p)}
            </p>

            <ProductAccordions product={p} />

            {/* Specification sheet: ruled rows, tracked labels, values at lead size */}
            <dl className="mt-8 border-t border-ink">
              <div className="grid grid-cols-[7.5rem_1fr] items-baseline gap-gutter border-b border-ink/25 py-3">
                <dt className="text-eyebrow uppercase text-ink/70">Step</dt>
                <dd className="text-lead">{p.step}</dd>
              </div>
              <div className="grid grid-cols-[7.5rem_1fr] items-baseline gap-gutter border-b border-ink/25 py-3">
                <dt className="text-eyebrow uppercase text-ink/70">Size</dt>
                <dd className="text-lead">{p.size}</dd>
              </div>
              <div className="grid grid-cols-[7.5rem_1fr] items-baseline gap-gutter border-b border-ink py-3">
                <dt className="text-eyebrow uppercase text-ink/70">Glass colour</dt>
                <dd className="flex items-center gap-2 text-lead">
                  <span
                    className="inline-block h-3 w-3 border border-ink/30"
                    style={{ backgroundColor: p.color.hex }}
                    aria-hidden="true"
                  />
                  {p.color.name}
                </dd>
              </div>
            </dl>
            {(p.slug === "terra-radiance-creme" || p.slug === "recovery-masque") && (
              <p className="mt-4 text-[12px] text-ink/65">
                Wondering why day and night formulas feel different?{" "}
                <Link
                  href="/journal/chiarel-ritual-guide"
                  className="border-b border-ochre text-ochre"
                >
                  Read the texture guide
                </Link>
                .
              </p>
            )}
          </div>
        </div>
      </div>

      <BenefitPills actives={p.actives} />

      {p.slug === "n1-neck-decollete" && (
        <section className="section-y border-y border-ink/15 bg-ivory">
          <div className="section-x">
            <AmbientVideo
              src="/assets/products/n1-neck-decollete-ambient.mp4"
              poster="/assets/products/clarity-neck-decollete-creme-honeycomb.jpg"
              label="Clarity Neck & Décolleté Crème, 40 ml, on a reflective surface with water droplets"
              className="mx-auto aspect-[9/16] max-h-[80vh] w-auto max-w-full bg-cloud object-cover"
            />
          </div>
        </section>
      )}

      {p.slug === "terra-radiance-creme" && (
        <EditorialFeature
          src="/assets/products/clarity-day-creme-editorial.jpg"
          alt="A woman holding Clarity Day Crème against the Capri coastline"
          kicker="The Day Crème"
          headline="The daily crème of the morning ritual."
          body="Clarity Day Crème is the morning crème of the ritual."
        />
      )}

      {/* N1 gets its own structured "what it's for / what it feels like"
          module instead of the generic KeyBenefits heading, matching the
          required PDP structure in CHIAREL_FOUR_PRODUCT_IMPLEMENTATION_PLAN.md §7. */}
      {p.slug === "n1-neck-decollete" ? (
        <Reveal>
          <N1WhatItsForAndFeel />
        </Reveal>
      ) : (
        p.benefits && <KeyBenefits benefits={p.benefits} />
      )}
      {p.howToUse && p.howToUse.length > 0 && (
        <Reveal>
          <HowToUse steps={p.howToUse} />
        </Reveal>
      )}
      {p.slug === "recovery-masque" && <IncludedSpatula />}
      {p.actives && p.actives.length > 0 && (
        <Reveal>
          <KeyIngredients actives={p.actives} />
        </Reveal>
      )}
      {/* The full INCI list renders ONLY once the owner marks it 'final'
          (see ingredientsInciStatus in lib/products.ts); draft-v2 lists never
          reach the page. */}
      {publishedInci(p) && (
        <Reveal>
          <FullIngredientList inci={publishedInci(p)!} />
        </Reveal>
      )}
      {isLaunchFormula(p.slug) && <Formulation />}
      <IngredientNotes slug={p.slug} />
      {/* Slot: reviews list. Renders nothing until a real review source
          exists (never fabricated). */}
      <ProductReviewsSlot slug={p.slug} />
      <BrandStatement />
      <Reveal>
        <UsageGuidance />
      </Reveal>
      {/* Routine position + pair-with guidance, grounded in the real AM/PM
          ritual: every catalog product belongs to at least one of the two routes. */}
      <Reveal>
        <LaunchRoutinePosition currentSlug={p.slug} />
      </Reveal>
      {isPurchasable(p) && (
        <StickyPurchaseBar
          slug={p.slug}
          name={p.name}
          image={p.image}
          subscriptionPrice={p.price.subscription}
        />
      )}
    </div>
  );
}

// Benefit pills band — sits directly under the hero, not buried mid-page.
// Reuses only facts already established and vetted elsewhere on the site
// (the primary key ingredient, and the same trust badges used in the
// footer) rather than inventing new short-form marketing claims.
function BenefitPills({
  actives,
}: {
  actives?: { name: string }[];
}) {
  const primaryActive = actives?.[0];
  // "Key Ingredients Named" is only true once a product has actives on
  // record. No testing or full-disclosure badge appears here: neither claim
  // is on file.
  const hasActives = Boolean(actives && actives.length > 0);
  const pills = [
    primaryActive ? primaryActive.name : null,
    hasActives ? "Key Ingredients Named" : null,
    "Made to Order in Isola del Liri, Italy",
  ].filter((pill): pill is string => Boolean(pill));

  return (
    <div className="border-b border-ink/10 bg-cloud/30">
      <div className="mx-auto w-full max-w-container px-margin py-4">
        <ul className="flex flex-wrap justify-center gap-x-8 gap-y-2 md:justify-start">
          {pills.map((pill) => (
            <li
              key={pill}
              className="flex items-center gap-2 text-[12px] uppercase tracking-[0.14em] text-ink/70"
            >
              <span className="inline-block h-1 w-1 rounded-full bg-ochre" aria-hidden="true" />
              {pill}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Brand story block, reused as-is across every PDP rather than fabricated per
// product: the copy draws only on facts already established and vetted
// elsewhere on the site (the origin story, Grazia Savoriti, Natural You Srl,
// the disclosure ethos). The formulation statement now lives in <Formulation>.
function BrandStatement() {
  return (
    <PdpBlock id="house" title="A House Built on One Rule">
      <div className="max-w-measure space-y-5 text-body text-ink/80">
        <p>
          The question started at a kitchen table, not a lab — one
          household, three different skin types, and a bathroom cabinet
          that couldn&rsquo;t keep up with any of them.
        </p>
        <p>
          That question needed a real answer. It led to Isola del Liri,
          Italy, and to a partnership with Natural You Srl, where every
          CHIAREL™ formulation is developed under the guidance of
          pharmacist Grazia Savoriti.
        </p>
        <p>
          Skin is not one thing, and a house built to serve it
          shouldn&rsquo;t pretend otherwise. This page names the key
          ingredients behind the formula.
        </p>
        <p>
          Each formula is produced fresh, to order, in small batches —
          not manufactured ahead of demand and held in standing
          inventory.
        </p>
        <p>
          That is CHIAREL Intelligence™: start with the biology in front
          of you, formulate it properly, and name the ingredients the
          formula is built around.
        </p>
      </div>
      <Link
        href="/journal/three-skins-one-house"
        className="mt-8 inline-block border-b border-ochre pb-0.5 text-eyebrow uppercase text-ochre"
      >
        Read the Origin Story
      </Link>
    </PdpBlock>
  );
}

// One block of the product page: title in the left columns, content on the
// shared 12-column grid, hairline above. Used for every long-form section so
// they align with each other and with the homepage.
function PdpBlock({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal>
      <Section id={id} rule labelledBy={id ? `${id}-title` : undefined}>
        <Grid className="gap-y-6">
          <div className="col-span-4 md:col-span-3 lg:col-span-3">
            <h2 id={id ? `${id}-title` : undefined} className="font-serif text-h3">
              {title}
            </h2>
          </div>
          <div className="col-span-4 md:col-span-5 lg:col-span-8 lg:col-start-5">
            {children}
          </div>
        </Grid>
      </Section>
    </Reveal>
  );
}

// Formulation (launch formulas only): the approved formulation line and the
// scoped free-from sentence, moved here from the brand story so it sits with
// the ingredient sections. No percentages, no per-product claims.
function Formulation() {
  return (
    <PdpBlock id="formulation" title="Formulation">
      <p data-formulation-statement className="max-w-measure text-body text-ink/80">
        {formulationLine()} {FREE_FROM_SENTENCE}
      </p>
    </PdpBlock>
  );
}

function KeyBenefits({ benefits }: { benefits: string[] }) {
  return (
    <PdpBlock id="key-benefits" title="Key benefits">
      <ul className="grid gap-x-[var(--gutter)] gap-y-8 sm:grid-cols-3">
        {benefits.map((b, i) => (
          <li key={b} className="border-t border-ink/20 pt-4 text-body text-ink/80">
            <span className="font-serif text-h4 text-ochre">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="mt-3">{b}</p>
          </li>
        ))}
      </ul>
    </PdpBlock>
  );
}

function IncludedSpatula() {
  return (
    <Reveal className="border-t border-ink/10 bg-ivory py-16">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 px-6 text-center md:flex-row md:text-left">
        <div className="relative aspect-square w-40 shrink-0 overflow-hidden bg-champagne/20">
          <Image
            src="/assets/products/applicator-spatula.jpg"
            alt="CHIAREL Spatula, Champagne Gold"
            fill
            sizes="160px"
            className="object-contain p-4"
          />
        </div>
        <div>
          <h3 className="font-serif text-2xl">The CHIAREL Spatula</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink/70">
            A Champagne Gold spatula for a hygienic, precise application —
            the ritual&rsquo;s closing gesture, done properly.
          </p>
        </div>
      </div>
    </Reveal>
  );
}

// Key ingredient NAMES only. No percentages, anywhere (owner decision: the
// luxury standard is named key ingredients plus the full INCI list).
function KeyIngredients({
  actives,
}: {
  actives: { name: string }[];
}) {
  if (actives.length === 0) return null;

  return (
    <PdpBlock id="key-ingredients" title="Key ingredients">
      <p className="max-w-measure text-body text-ink/80">
        The ingredients this formula is built around, named plainly.
      </p>
      <ul className="mt-6 grid gap-x-[var(--gutter)] gap-y-5 sm:grid-cols-2">
        {actives.map((a) => (
          <li key={a.name} className="border-t border-ink/20 pt-3">
            <p className="font-serif text-h4 text-ochre">{a.name}</p>
          </li>
        ))}
      </ul>
    </PdpBlock>
  );
}

// Customer-facing buy-box replacement for any product with no owner-approved
// price yet (currently only N1). Plain commerce copy, not an internal review
// label — see CHIAREL_FOUR_PRODUCT_IMPLEMENTATION_PLAN.md §1 and §3.
function PriceToBeAnnounced() {
  return (
    <div className="border border-ink/15 bg-cloud/20 p-5">
      <p className="text-[12px] uppercase tracking-[0.18em] text-ochre">
        Price to be announced
      </p>
      <p className="mt-2 text-sm leading-relaxed text-ink/70">
        Not yet available for purchase. In the meantime,{" "}
        <Link href="/contact" className="border-b border-ochre text-ochre">
          contact us
        </Link>{" "}
        with questions, or explore the rest of{" "}
        <Link href="/ritual" className="border-b border-ochre text-ochre">
          The CHIAREL Ritual
        </Link>
        .
      </p>
    </div>
  );
}

// N1 PDP sections 2–3 from CHIAREL_FOUR_PRODUCT_IMPLEMENTATION_PLAN.md §7.
// Cosmetic-appearance language only, drawn from the brief's own approved
// draft templates — pending final owner/regulatory sign-off before this
// product is promoted at scale (DRAFT — OWNER / REGULATORY APPROVAL REQUIRED).
function N1WhatItsForAndFeel() {
  return (
    <Reveal className="border-t border-ink/10 bg-ivory py-16">
      <div className="mx-auto grid max-w-3xl gap-10 px-6 sm:grid-cols-2">
        <div>
          <h2 className="font-serif text-2xl">What it&rsquo;s for</h2>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-ink/75">
            <li>· The visible appearance of dryness</li>
            <li>· Crepey-looking texture</li>
            <li>· The appearance of horizontal lines</li>
            <li>· The look of improved suppleness</li>
          </ul>
        </div>
        <div>
          <h2 className="font-serif text-2xl">What it feels like</h2>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-ink/75">
            <li>· Finished with a delicate CHIAREL accord</li>
            <li>· Cushioning</li>
            <li>· Low drag</li>
            <li>· A satin finish</li>
          </ul>
        </div>
      </div>
    </Reveal>
  );
}

// Directions for use, rendered only for products whose data/products.json
// entry carries `howToUse` (each line already published elsewhere on the
// site — see `howToUseSource`). General cosmetic application guidance only.
function HowToUse({ steps }: { steps: string[] }) {
  return (
    <PdpBlock id="how-to-use" title="How to use">
      <ol className="max-w-measure space-y-3 text-body text-ink/80">
        {steps.map((step, i) => (
          <li key={step} className="flex gap-4 border-t border-ink/15 pt-3">
            <span className="font-serif text-ochre" aria-hidden="true">{i + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </PdpBlock>
  );
}

// Full consumer ingredient list. Rendered only via publishedInci(), i.e. when
// the product's ingredientsInciStatus is 'final' (owner-confirmed after
// Grazia / supplier declarations). Names only, in order, never percentages.
function FullIngredientList({ inci }: { inci: string[] }) {
  return (
    <PdpBlock id="full-ingredients" title="Full ingredient list">
      <details className="group max-w-measure">
        <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between text-eyebrow uppercase text-ink/80">
          Show the full list
          <span className="ml-4 text-xl text-ink/70 group-open:hidden" aria-hidden="true">+</span>
          <span className="ml-4 hidden text-xl text-ink/70 group-open:inline" aria-hidden="true">−</span>
        </summary>
        <p className="mt-4 text-caption leading-relaxed text-ink/75">{inci.join(", ")}</p>
      </details>
    </PdpBlock>
  );
}

// Review slots. Deliberately render nothing: there is no review source yet
// and reviews must never be fabricated. When one exists, render the rating
// summary under the title and the review list in the page body from here.
function ProductRatingSlot(_props: { slug: string }) {
  return null;
}
function ProductReviewsSlot(_props: { slug: string }) {
  return null;
}

// The launch ritual's real AM/PM sequences, as approved in
// CHIAREL_FOUR_PRODUCT_IMPLEMENTATION_PLAN.md §5 — the single source both
// the homepage, /ritual, and this component draw from conceptually (kept
// local here since it drives PDP-only routine-position/pairing copy, not
// page layout).
const LAUNCH_AM_ROUTE = ["chiarel-essence", "terra-radiance-creme"];
const LAUNCH_PM_ROUTE = ["chiarel-essence", "eye-contour-concentrate", "recovery-masque", "n1-neck-decollete"];

function launchPairsFor(slug: string): string[] {
  const pairs = new Set<string>();
  for (const route of [LAUNCH_AM_ROUTE, LAUNCH_PM_ROUTE]) {
    if (route.includes(slug)) {
      route.forEach((s) => {
        if (s !== slug) pairs.add(s);
      });
    }
  }
  return Array.from(pairs);
}

// Replaces CompleteYourRitual for the four launch products only. Rather than
// "the first other ritual product" (the legacy heuristic), this shows the
// real AM and/or PM sequence the current product belongs to, plus which
// other launch products it pairs with — grounded entirely in
// launchRitualProducts data, nothing invented per product.
function LaunchRoutinePosition({ currentSlug }: { currentSlug: string }) {
  const inAM = LAUNCH_AM_ROUTE.includes(currentSlug);
  const inPM = LAUNCH_PM_ROUTE.includes(currentSlug);
  const pairSlugs = launchPairsFor(currentSlug);
  const pairs = pairSlugs
    .map((slug) => getProduct(slug))
    .filter((p): p is Product => p !== undefined);

  function RouteStrip({ label, route }: { label: string; route: string[] }) {
    return (
      <div>
        <p className="text-[12px] uppercase tracking-[0.16em] text-ink/65">{label}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-6">
          {route.map((slug, i) => {
            const item = getProduct(slug);
            if (!item) return null;
            const isCurrent = slug === currentSlug;
            return (
              <span key={slug} className="flex items-center gap-2">
                {isCurrent ? (
                  <span className="border-b border-ochre pb-0.5 text-sm text-ochre">
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={productHref(slug)}
                    className="tap-area text-sm text-ink/70 hover:text-ochre"
                  >
                    {item.name}
                  </Link>
                )}
                {i < route.length - 1 && <span className="text-ink/40">→</span>}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-4 max-w-2xl border-t border-ink/10 px-6 pb-20 pt-14">
      <h2 className="text-center font-serif text-2xl">Routine Position</h2>
      <div className="mt-8 space-y-6">
        {inAM && <RouteStrip label="Morning" route={LAUNCH_AM_ROUTE} />}
        {inPM && <RouteStrip label="Evening" route={LAUNCH_PM_ROUTE} />}
      </div>
      {pairs.length > 0 && (
        <div className="mt-10 border-t border-ink/10 pt-8">
          <p className="text-center text-[12px] uppercase tracking-[0.16em] text-ink/65">
            Complete your regimen
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {pairs.map((item) => (
              <div
                key={item.slug}
                className="flex flex-col gap-3 rounded-sm border border-ink/10 p-4 transition hover:border-ochre"
              >
                <Link href={productHref(item.slug)} className="flex items-center gap-4">
                  <div
                    className="relative h-16 w-16 shrink-0 overflow-hidden"
                    style={{ backgroundColor: NEUTRAL_FRAME_BG }}
                  >
                    <Image src={item.image} alt={productImageAlt(item)} fill sizes="64px" className="object-cover" />
                  </div>
                  <div>
                    <p className="font-serif text-base leading-snug">{item.name}</p>
                    <p className="mt-0.5 text-[12px] uppercase tracking-[0.16em] text-ink/65">
                      {item.step}
                    </p>
                    {isPurchasable(item) && (
                      <p className="mt-1 text-[12px] text-ink/65">
                        ${item.price.subscription} per delivery, subscribe &amp; save
                      </p>
                    )}
                  </div>
                </Link>
                {isPurchasable(item) && <AddPairButton slug={item.slug} name={item.name} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Science links follow ingredient scoping: Bifida Ferment Lysate is in Essence,
// Day, Neck & Décolleté and Eye (not Night); L-Ornithine is in Night only.
// No Ectoine link anywhere (Ectoine is in none of the five formulas).
const BARRIER = { label: "Building a More Resilient Skin Barrier", href: "/science/barrier-resilience" };
const BIFIDA = { label: "Bifida Ferment Lysate, Explained", href: "/science/bifida-ferment-lysate" };
const ORNITHINE = { label: "L-Ornithine, Explained", href: "/science/l-ornithine" };
const scienceLinksBySlug: Record<string, { label: string; href: string }[]> = {
  "chiarel-essence": [BIFIDA, BARRIER],
  "terra-radiance-creme": [BIFIDA, BARRIER],
  "n1-neck-decollete": [BIFIDA],
  "eye-contour-concentrate": [BIFIDA],
  "recovery-masque": [ORNITHINE, BARRIER],
};

// Ingredient notes: links to the existing /science explainers for ingredients in
// this formula. These pages explain ingredients; they are not test results for
// the finished product, and the block says so.
function IngredientNotes({ slug }: { slug: string }) {
  const links = scienceLinksBySlug[slug];
  if (!links) return null;
  return (
    <PdpBlock id="ingredient-notes" title="Ingredient notes">
      <p className="max-w-measure text-body text-ink/80">
        Plain-language explainers for ingredients in this formula. They
        describe the ingredients, not test results for this product.
      </p>
      <ul className="mt-6 max-w-measure divide-y divide-ink/15 border-y border-ink/15">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="flex min-h-[44px] items-center justify-between py-3 text-body text-ochre hover:text-ink"
            >
              {l.label}
              <span aria-hidden="true">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </PdpBlock>
  );
}

// Usage guidance, patch-test caution, and support/policy links — the PDP
// content items the Brand Action Guide brief calls out that weren't yet on
// the page. Deliberately generic, standard cosmetic-industry practice
// language, not a per-product claim: it doesn't reference this product's
// specific actives or efficacy, only how to introduce any new leave-on
// treatment safely. Shown only on single-product pages (bundles link into
// each included product's own page, which already carries this section).
// A <details>/<summary> accordion rather than a JS-driven one — reference
// point for the pattern is La Mer's PDP ("Ingredients" / "How to use"
// collapsed behind a +/- toggle), but implemented as plain HTML so it needs
// no client component, no hydration cost, and works with JS disabled;
// keyboard and screen-reader behavior come from the browser for free.
// Deliberately scoped to usage/patch-test guidance only — the actives
// key ingredients (KeyIngredients, above) stay fully expanded on every PDP,
// not incidental page content to compress for scroll length.
function UsageGuidance() {
  return (
    <div className="border-t border-ink/10 bg-cloud/30 py-16">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-center font-serif text-2xl">
          Introducing a New Product to Your Routine
        </h2>
        <div className="mt-10 divide-y divide-ink/10 border-y border-ink/10">
          <details className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between font-serif text-lg text-ink">
              Patch test first
              <span className="ml-4 text-xl text-ink/70 group-open:hidden" aria-hidden="true">+</span>
              <span className="ml-4 hidden text-xl text-ink/70 group-open:inline" aria-hidden="true">−</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">
              Apply a small amount to the inner forearm and wait 24 hours
              before using on the face. This is standard practice for any
              new skincare product, regardless of formulation.
            </p>
          </details>
          <details className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between font-serif text-lg text-ink">
              Using alongside retinoids or acids
              <span className="ml-4 text-xl text-ink/70 group-open:hidden" aria-hidden="true">+</span>
              <span className="ml-4 hidden text-xl text-ink/70 group-open:inline" aria-hidden="true">−</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">
              If your routine already includes a retinoid or an exfoliating
              acid (AHA/BHA), introduce this product gradually — for
              example, on alternating nights — and reduce frequency if you
              notice irritation. When in doubt, space active treatments
              apart rather than layering them the same evening.
            </p>
          </details>
        </div>
        <p className="mt-10 text-center text-[12px] leading-relaxed text-ink/65">
          Questions about how this fits your routine?{" "}
          <Link href="/contact" className="border-b border-ochre text-ochre">
            Contact us
          </Link>
          , see the{" "}
          <Link href="/#faq" className="border-b border-ochre text-ochre">
            FAQ
          </Link>
          , or review{" "}
          <Link href="/terms" className="border-b border-ochre text-ochre">
            shipping &amp; returns
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
