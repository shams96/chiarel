import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { products, getProductOrThrow, launchRitualProducts, productImageAlt, isPurchasable } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import RitualCarousel from "@/components/RitualCarousel";
import EvidenceGrid from "@/components/EvidenceGrid";
import ResultsSection from "@/components/ResultsSection";
import Reveal from "@/components/Reveal";
import HeroIntro from "@/components/HeroIntro";
import { NEUTRAL_FRAME_BG } from "@/lib/color";
import { productHoverClass } from "@/lib/motion";
import {
  faqJsonLd,
  offerCatalogJsonLd,
  webPageJsonLd,
  researchArticleJsonLd,
  SITE_URL,
  SITE_NAME,
  HOMEPAGE_LAST_UPDATED,
  HOMEPAGE_PUBLISHED,
  HOMEPAGE_LAST_UPDATED_DISPLAY,
  HOMEPAGE_PUBLISHED_DISPLAY,
  FORMULATOR_EXTERNAL_URL,
} from "@/lib/seo";

// Homepage-specific authorship metadata — see prior comment history for why
// this is repeated rather than inherited from layout.tsx. Title/description
// updated to lead with N1 (the four-product launch's category-defining
// hero) since that's now the page's actual first-screen content — per
// CHIAREL_FOUR_PRODUCT_IMPLEMENTATION_PLAN.md §9, this is a metadata update
// that tracks a real visible-content change, not a cosmetic edit.
export const metadata: Metadata = {
  authors: [{ name: "Grazia Savoriti", url: FORMULATOR_EXTERNAL_URL }],
  openGraph: {
    type: "article",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — N1 Neck & Décolleté Renewal Emulsion`,
    description:
      "A fragrance-free nightly emulsion for the skin below the jawline, at the center of CHIAREL's focused four-product ritual. Formulated in Isola del Liri, Italy.",
    url: SITE_URL,
    images: [{ url: "/assets/editorial/hero-shore-duo.png", width: 1536, height: 934 }],
    publishedTime: HOMEPAGE_PUBLISHED,
    modifiedTime: HOMEPAGE_LAST_UPDATED,
    authors: [FORMULATOR_EXTERNAL_URL],
  },
};

// FAQ pricing answer reworded: the prior version hardcoded specific dollar
// figures and called the Ritual Set "five-step" — both go stale under the
// four-product restructuring (N1 has no price yet, and "five-step"/"six-
// product" language is retired sitewide per
// CHIAREL_FOUR_PRODUCT_IMPLEMENTATION_PLAN.md). Uses the brief's own "see
// individual product pages" fallback rather than inventing new numbers.
const faqs = [
  {
    question: "How much does CHIAREL cost?",
    answer:
      "Pricing varies by product and by whether you choose subscription (recurring, every 45 days, at a discounted rate) or one-time purchase. See each product's page for its current price. N1 Neck & Décolleté Renewal Emulsion's price will be announced when it becomes available for purchase.",
  },
  {
    question: "What is CHIAREL made of?",
    answer:
      "Every formula discloses its actives and concentrations plainly. CHIAREL Essence™ is built around Palmitoyl Pentapeptide-4 (3%) and Bioactive Ferment Lysate (0.30%); Terra Radiance Crème™ carries Ceramide NP (0.8%) and Niacinamide (3.0%). Each product page states its complete active ingredient list and percentage where applicable.",
  },
  {
    question: "Who formulates CHIAREL?",
    answer:
      "CHIAREL is formulated by Grazia Savoriti, CHIAREL's pharmacist specializing in cosmetic and nutraceutical research. Every formulation — from CHIAREL Essence™'s peptide complex to Terra Radiance Crème™'s barrier-support blend — is developed under her direct guidance, then produced fresh, to order, in small batches in Isola del Liri, Italy, rather than manufactured in bulk ahead of demand. She also reviews the published, peer-reviewed research cited for each active ingredient before it's formulated into a CHIAREL product. Every formula states its actives and exact percentages rather than grouping them into an undisclosed blend.",
  },
  {
    question: "Where can I buy CHIAREL?",
    answer:
      "CHIAREL is available directly at chiarel.com — it is not sold in retail stores, department stores, or through third-party marketplaces or resellers. Buying direct means each order is made fresh to order in Isola del Liri, Italy and shipped straight to you, without the markup layers of traditional retail distribution. This also lets CHIAREL keep every active ingredient and its exact concentration listed on the product page, since pricing and formulation are controlled end to end by the House rather than a retail partner.",
  },
  {
    question: "How does the CHIAREL subscription work?",
    answer:
      "Choosing subscription pricing on any product sets a recurring delivery every 45 days at the discounted subscription rate, timed to the pace most people move through a bottle of serum or crème. Every product is also available as a one-time purchase at full price, with no subscription required, so you can try a single product before committing to a recurring delivery. Self-service subscription management (pause, skip, or cancel) is being added to the account experience; until then, contacting orders@chiarel.com handles any change promptly.",
  },
  {
    question: "Where is CHIAREL made?",
    answer:
      "CHIAREL formulas are produced in Isola del Liri, Italy, with manufacturing partner Natural You Srl, using water drawn where the Liri meets the Fibreno — a river fed entirely by limestone karst springs, with no surface tributaries of its own. That confluence of newly filtered spring water is what gives The Cascata Complex™ its name. The formulation happens on-site rather than sourcing water and actives from a distance, so every CHIAREL batch is produced fresh, to order, instead of held in standing inventory ahead of demand.",
  },
  {
    question: "What is the CHIAREL Four-Product Ritual?",
    answer:
      "A focused morning and evening practice: mornings pair CHIAREL Essence™ with Terra Radiance Crème™; evenings pair CHIAREL Essence™ with Recovery Masque™ and N1 Neck & Décolleté Renewal Emulsion™. Cellular Cleanser™ and Cellular Mist™ remain available as optional preparation steps, and CHIAREL Lip Concentrate™ remains available beyond the core ritual.",
  },
];

const fitGuidance = [
  {
    concern: "Barrier feels reactive, tight, or easily irritated",
    fit: "Cellular Cleanser™ + Terra Radiance Crème™",
    why: "Ceramide NP and a prebiotic complex are dosed to support barrier function rather than strip it.",
  },
  {
    concern: "Skin looks dull, uneven, or has lost visible firmness",
    fit: "CHIAREL Essence™",
    why: "Built around Palmitoyl Pentapeptide-4 (3%), the concentrated treatment layer of the ritual.",
  },
  {
    concern: "Neck, jawline, and décolleté show dryness or crepey-looking texture",
    fit: "N1 Neck & Décolleté Renewal Emulsion™",
    why: "Formulated specifically for the skin below the jawline, not repurposed face cream.",
  },
  {
    concern: "Wants overnight recovery without a heavy routine",
    fit: "Recovery Masque™",
    why: "L-Ornithine and Panthenol formulated as the ritual's closing facial gesture, before N1.",
  },
];

const formulationApproach = [
  {
    dimension: "Active ingredient approach",
    chiarel: "Peptide- and postbiotic-based actives (e.g. Palmitoyl Pentapeptide-4, Bioactive Ferment Lysate)",
    categoryNorm: "Often built around retinol or retinoid derivatives",
  },
  {
    dimension: "Ingredient disclosure",
    chiarel: "Every active and its exact percentage, published on the product page",
    categoryNorm: "Often grouped into an undisclosed \"proprietary blend\"",
  },
  {
    dimension: "Batch production",
    chiarel: "Made fresh, to order, in small batches",
    categoryNorm: "Manufactured in bulk and held in standing inventory",
  },
  {
    dimension: "Sourcing",
    chiarel: "Formulated at the water's source in Isola del Liri, Italy",
    categoryNorm: "Formulated wherever contract manufacturing is cheapest",
  },
  {
    dimension: "Distribution",
    chiarel: "Sold directly at chiarel.com only — one price, no markup layers",
    categoryNorm: "Sold through multiple retail markups before reaching the shelf",
  },
];

const ingredientTable = products
  .flatMap((p) =>
    (p.actives ?? []).map((a) => ({
      product: p.name,
      ingredient: a.name,
      percent: a.percent ?? "—",
    }))
  );

export default function Home() {
  const essence = getProductOrThrow("chiarel-essence");
  const masque = getProductOrThrow("recovery-masque");
  const terraCreme = getProductOrThrow("terra-radiance-creme");
  const n1 = getProductOrThrow("n1-neck-decollete");
  const foundingPair = getProductOrThrow("the-founding-pair");
  const ritualSet = getProductOrThrow("the-ritual-set");
  const featuredIcons = products.filter((p) =>
    ["cellular-cleanser", "lip-concentrate"].includes(p.slug)
  );
  const evidenceProducts = products.filter((p) =>
    ["chiarel-essence", "terra-radiance-creme", "recovery-masque"].includes(p.slug)
  );

  return (
    <>
      <HeroIntro />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            webPageJsonLd({
              url: SITE_URL,
              name: "CHIAREL™ — N1 Neck & Décolleté Renewal Emulsion",
              description:
                "CHIAREL's focused four-product ritual, led by N1 Neck & Décolleté Renewal Emulsion. Customer-tested skincare formulated in Isola del Liri, Italy. Every active ingredient disclosed.",
            })
          ),
        }}
      />
      {/* Only priced products get an Offer — N1 has no owner-approved price
          yet, so it's excluded here rather than publishing an inaccurate
          Offer. See CHIAREL_FOUR_PRODUCT_IMPLEMENTATION_PLAN.md §9. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(offerCatalogJsonLd(products.filter(isPurchasable))),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(researchArticleJsonLd),
        }}
      />

      {/* Hero — N1-led per CHIAREL_FOUR_PRODUCT_IMPLEMENTATION_PLAN.md §6.
          Supporting copy below is drafted from the brief's own supplied
          text verbatim (DRAFT — OWNER / REGULATORY APPROVAL REQUIRED before
          this is treated as final, per the brief's §15 review process).
          Formal Garden replaces the prior champagne-gold glow/backdrop
          tokens since N1's product color is Formal Garden, not the
          Founding Pair's champagne gold. */}
      <section className="relative w-full overflow-hidden bg-ivory">
        <div
          className="pointer-events-none absolute -right-1/4 top-0 h-full w-3/4"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 60% 70% at 70% 40%, rgba(31,81,41,0.16) 0%, rgba(31,81,41,0) 65%)",
          }}
        />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-16 md:min-h-[640px] md:grid-cols-2 md:py-20">
          <div className="hero-in order-2 max-w-xl md:order-1">
            <p className="text-[12px] uppercase tracking-[0.5em] text-ochre">
              CHIAREL™ · The House of Clarity™
            </p>
            <h1 className="mt-7 font-serif text-[clamp(2.25rem,1.4rem+5vw,4.5rem)] leading-[1.02] tracking-[-0.02em] text-ink">
              The Neck &amp; Décolleté Treatment Your Routine Forgot.
            </h1>
            {/* DRAFT — OWNER / REGULATORY APPROVAL REQUIRED */}
            <p className="mt-8 max-w-sm text-[15px] leading-relaxed text-ink/70">
              A fragrance-free nightly emulsion designed for the skin below
              the jawline — where visible dryness, crepey-looking texture,
              and fine lines often need more than a face cream.
            </p>
            <div className="mt-10 flex flex-col items-start gap-4">
              <Link
                href="/shop/n1-neck-decollete"
                className="inline-block border border-ink px-10 py-4 text-[12px] uppercase tracking-[0.3em] text-ink transition hover:border-ochre hover:text-ochre"
              >
                Discover N1
              </Link>
              <Link
                href="/ritual"
                className="text-[11px] uppercase tracking-[0.2em] text-ink/60 underline decoration-ochre/50 underline-offset-4 hover:text-ochre"
              >
                Build Your Ritual
              </Link>
            </div>
          </div>
          <div className="order-1 flex justify-center md:order-2 md:justify-end">
            <div className="product-reveal relative aspect-square w-full max-w-md">
              <div
                className="absolute inset-[8%] rounded-full blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, rgba(31,81,41,0.18) 0%, rgba(31,81,41,0) 70%)",
                }}
              />
              <Image
                src={n1.image}
                alt={productImageAlt(n1)}
                fill
                priority
                sizes="(max-width: 768px) 90vw, 448px"
                className="relative object-contain drop-shadow-[0_30px_40px_rgba(28,26,23,0.18)]"
              />
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-ink/65">
          Scroll
        </div>
      </section>

      {/* N1 visible-concern explanation — cosmetic, non-medical language only.
          DRAFT — OWNER / REGULATORY APPROVAL REQUIRED. */}
      <section className="section-y bg-white">
        <div className="section-x">
          <Reveal>
            <h2 className="font-serif text-3xl leading-snug">
              What N1 Is Designed For
            </h2>
          </Reveal>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Dryness",
              "Crepey-looking texture",
              "The appearance of horizontal lines",
              "Reduced visible suppleness",
            ].map((concern) => (
              <li
                key={concern}
                className="border border-ink/10 p-6 text-center font-serif text-lg leading-snug text-ink"
              >
                {concern}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* "Why the skin below the jawline needs its own ritual" —
          DRAFT — OWNER / REGULATORY APPROVAL REQUIRED. Cosmetic framing
          only, no medical claims about skin physiology differences. */}
      <section className="section-y border-y border-ink/10 bg-cloud/40">
        <div className="section-x-narrow">
          <Reveal className="text-center">
            <h2 className="font-serif text-3xl leading-snug">
              Why the Skin Below the Jawline Needs Its Own Ritual
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-ink/70">
              Most routines stop at the jawline. The neck and décolleté are
              treated, at best, as an afterthought of whatever face cream is
              left on the fingertips — not formulated for on their own terms.
              N1 is CHIAREL&rsquo;s answer: a dedicated nightly step for the
              skin most routines forget.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Four-product AM/PM ritual — replaces the prior five-step carousel
          section. Sourced from launchRitualProducts, not the legacy
          ritualProducts array, per
          CHIAREL_FOUR_PRODUCT_IMPLEMENTATION_PLAN.md §5. */}
      <section id="four-product-ritual" className="section-y bg-ivory">
        <div className="section-x">
          <Reveal>
            <h2 className="font-serif text-3xl">The CHIAREL Four-Product Ritual</h2>
            <p className="mt-4 max-w-2xl text-sm text-ink/70">
              A focused morning and evening practice for hydration, comfort,
              renewal, and the skin below the jawline.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-10 sm:grid-cols-2">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-ink/65">Morning</p>
              <p className="mt-3 font-serif text-xl leading-snug">
                CHIAREL Essence™ <span className="text-ink/40">→</span> Terra Radiance Crème™
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-ink/65">Evening</p>
              <p className="mt-3 font-serif text-xl leading-snug">
                CHIAREL Essence™ <span className="text-ink/40">→</span> Recovery Masque™{" "}
                <span className="text-ink/40">→</span> N1 Neck &amp; Décolleté Renewal Emulsion™
              </p>
            </div>
          </div>
          <RitualCarousel products={launchRitualProducts} />
          <p className="mt-6 max-w-2xl text-[13px] leading-relaxed text-ink/65">
            Cellular Cleanser™ and Cellular Mist™ remain available as{" "}
            <Link href="/ritual#optional-preparation" className="border-b border-ochre text-ochre">
              optional preparation
            </Link>{" "}
            ahead of either routine.
          </p>
        </div>
      </section>

      {/* Fit guidance — updated to include N1 alongside the existing entries */}
      <section className="section-y border-y border-ink/10 bg-white">
        <div className="section-x">
          <Reveal>
            <h2 className="font-serif text-3xl">Which CHIAREL™ Product Is Right for You?</h2>
            <p className="mt-4 max-w-2xl text-sm text-ink/70">
              Best for matching a product to what your skin is showing you,
              not the shelf. Not sure? Take the{" "}
              <Link href="/assessment" className="border-b border-ochre text-ochre">
                Skin Assessment
              </Link>
              .
            </p>
          </Reveal>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2">
            {fitGuidance.map((row, i) => (
              <li key={row.concern}>
                <Reveal delay={i * 0.08} className="border border-ink/10 p-6">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-ink/65">
                    Best for skin that…
                  </p>
                  <p className="mt-2 font-serif text-lg leading-snug text-ink">
                    {row.concern}
                  </p>
                  <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-ochre">
                    {row.fit}
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink/60">
                    {row.why}
                  </p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Evidence — asymmetric label+grid */}
      <section className="section-y-lg bg-ivory">
        <div className="section-x grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-16">
          <Reveal>
            <h2 className="font-serif text-3xl leading-snug">
              What&rsquo;s Actually in CHIAREL™ Formulas?
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink/70">
              Customer-tested, no hidden blends — every active, stated. Not a
              marketing claim, a matter of record.
            </p>
          </Reveal>
          <EvidenceGrid products={evidenceProducts} />
        </div>
      </section>

      {/* Full ingredient/formulation table — real actives + percentages from
          the product catalog. N1 has no actives yet, so it does not appear
          here — this table is never populated with invented figures. */}
      <section className="section-y bg-white">
        <div className="section-x">
          <Reveal>
            <h2 className="font-serif text-3xl leading-snug">
              Every Active, by Product and Percentage
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink/70">
              The complete formulation record across the House — no
              proprietary blends, no undisclosed percentages.
            </p>
          </Reveal>
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-ink/20 text-[11px] uppercase tracking-[0.16em] text-ink/65">
                  <th className="py-3 pr-4 font-normal">Product</th>
                  <th className="py-3 pr-4 font-normal">Active Ingredient</th>
                  <th className="py-3 font-normal">Concentration</th>
                </tr>
              </thead>
              <tbody>
                {ingredientTable.map((row, i) => (
                  <tr
                    key={`${row.product}-${row.ingredient}-${i}`}
                    className="border-b border-ink/10 transition-colors hover:bg-ochre/5"
                  >
                    <td className="py-3 pr-4 text-ink/80">{row.product}</td>
                    <td className="py-3 pr-4 text-ink/70">{row.ingredient}</td>
                    <td className="py-3 tabular-nums text-ochre">{row.percent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {products
              .flatMap((p) => (p.benefits ?? []).map((b) => ({ product: p.name, benefit: b })))
              .slice(0, 6)
              .map((row, i) => (
                <li key={i} className="flex items-start gap-3 text-[13px] leading-relaxed text-ink/70">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ochre" aria-hidden="true" />
                  <span>
                    <span className="text-ink/65">{row.product}: </span>
                    {row.benefit}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      </section>

      {/* Signature Duo — the two face-ritual hero treatments, no price */}
      <section className="section-y border-y border-ink/10 bg-white">
        <div className="section-x">
          <Reveal className="text-center">
            <h2 className="font-serif text-3xl">
              The Signature Serum. The Nightly Recovery.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-10 sm:grid-cols-2">
            {[essence, masque].map((p, i) => {
              const meta = (
                <Link href={`/shop/${p.slug}`}>
                  <p className="mt-4 font-serif text-2xl">{p.name}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-ink/65">
                    {p.step}
                  </p>
                  <p className="mt-1 text-[13px] text-ink/60">{p.descriptor}</p>
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
                      style={{ backgroundColor: NEUTRAL_FRAME_BG }}
                    >
                      <Image
                        src={p.image}
                        alt={productImageAlt(p)}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className={productHoverClass(p.step)}
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

      {/* Provenance — Isola del Liri, Italy */}
      <section className="relative section-y overflow-hidden border-y border-ink/10 text-ivory">
        <Image
          src="/assets/editorial/isola-del-liri-cascata.png"
          alt="Editorial illustration of the Cascata Grande waterfall running through Isola del Liri, Italy"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-garden/85" />
        <Reveal className="section-x-narrow relative text-center">
          <h2 className="font-serif text-4xl leading-tight md:text-5xl">
            Where Is CHIAREL™ Made?
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
            className="btn-press mt-6 inline-block border-b border-champagne pb-0.5 text-[12px] uppercase tracking-[0.18em] text-champagne transition-colors hover:text-ivory"
          >
            Read the Journal
          </Link>
        </Reveal>
      </section>

      {/* Formulated By */}
      <section className="relative section-y-lg overflow-hidden bg-ink text-ivory">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 55% at 50% 35%, rgba(214,197,160,0.16), transparent 70%)",
          }}
        />
        <Reveal className="section-x-narrow relative text-center">
          <h2 className="font-serif text-4xl leading-snug">
            Who Formulates CHIAREL™?
          </h2>
          <p className="mt-3 font-serif text-xl text-champagne">
            Grazia Savoriti
          </p>
          <p className="mt-2 text-[12px] uppercase tracking-[0.2em] text-ivory/50">
            Formulated by CHIAREL&rsquo;s Pharmacist · Cosmetic &amp;
            Nutraceutical Research
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
          <Link
            href="/house"
            className="mt-3 block text-[11px] uppercase tracking-[0.16em] text-ivory/50 hover:text-champagne"
          >
            Read her full bio →
          </Link>
          <a
            href={FORMULATOR_EXTERNAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block text-[11px] uppercase tracking-[0.16em] text-ivory/40 hover:text-champagne"
          >
            Verified profile at Natural You Srl →
          </a>
        </Reveal>
      </section>

      {/* Backed by Research — only currently supported, real citations */}
      <section className="section-y bg-ivory">
        <div className="section-x-narrow">
          <Reveal className="text-center">
            <h2 className="font-serif text-3xl">Backed by Published Research</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink/70">
              CHIAREL formulates with established, clinically studied
              ingredients — not novel, unstudied compounds. Each mechanism
              cited below is documented in peer-reviewed clinical and
              cosmetic-science literature, reviewed by our formulating
              pharmacist, not brand-authored claims.
            </p>
          </Reveal>
          <ul className="mx-auto mt-10 max-w-xl space-y-4 text-sm">
            <li className="border-l-2 border-ochre pl-5">
              <p className="text-ink/70">
                Palmitoyl Pentapeptide-4 (used in CHIAREL Essence™) is studied
                for its role in visible firmness and texture support.
              </p>
              <a
                href="https://pubmed.ncbi.nlm.nih.gov/?term=palmitoyl+pentapeptide+skin"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block border-b border-ink/30 text-[12px] text-ink/65 hover:border-ochre hover:text-ochre"
              >
                Published research, PubMed (NIH) →
              </a>
            </li>
            <li className="border-l-2 border-ochre pl-5">
              <p className="text-ink/70">
                Ceramide NP and Niacinamide (used in Terra Radiance Crème™)
                are widely studied for barrier support and environmental
                defense.
              </p>
              <a
                href="https://pubmed.ncbi.nlm.nih.gov/?term=ceramide+niacinamide+skin+barrier"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block border-b border-ink/30 text-[12px] text-ink/65 hover:border-ochre hover:text-ochre"
              >
                Published research, PubMed (NIH) →
              </a>
            </li>
            <li className="border-l-2 border-ochre pl-5">
              <p className="text-ink/70">
                Bioactive Ferment Lysate — a postbiotic used across the
                ritual — is studied for supporting barrier proteins and
                microbiome balance. See the full mechanism explainer.
              </p>
              <Link
                href="/science/bifida-ferment-lysate"
                className="mt-1 inline-block border-b border-ochre text-[12px] text-ochre"
              >
                Read the formulation science →
              </Link>
            </li>
            <li className="border-l-2 border-ochre pl-5">
              <p className="text-ink/70">
                L-Ornithine (used in Recovery Masque™) is studied for its
                role in the skin&rsquo;s Natural Moisturizing Factor and overnight
                barrier repair.
              </p>
              <a
                href="https://pubmed.ncbi.nlm.nih.gov/?term=ornithine+skin+barrier"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block border-b border-ink/30 text-[12px] text-ink/65 hover:border-ochre hover:text-ochre"
              >
                Published research, PubMed (NIH) →
              </a>
            </li>
            <li className="border-l-2 border-ochre pl-5">
              <p className="text-ink/70">
                Low molecular weight Hyaluronic Acid (used in Cellular Mist™)
                is studied for fast-absorbing surface hydration ahead of
                treatment.
              </p>
              <a
                href="https://pubmed.ncbi.nlm.nih.gov/?term=low+molecular+weight+hyaluronic+acid+skin+hydration"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block border-b border-ink/30 text-[12px] text-ink/65 hover:border-ochre hover:text-ochre"
              >
                Published research, PubMed (NIH) →
              </a>
            </li>
          </ul>
          <p className="mx-auto mt-6 max-w-xl text-[12px] leading-relaxed text-ink/60">
            N1 Neck &amp; Décolleté Renewal Emulsion has no product-specific
            testing results published yet — see its product page for status.
          </p>
        </div>
      </section>

      {/* Comparison content — CHIAREL's formulation approach vs. category norm */}
      <section className="section-y bg-cloud/40">
        <div className="section-x">
          <Reveal>
            <h2 className="font-serif text-3xl">
              CHIAREL™ vs. the Category Norm
            </h2>
            <p className="mt-4 max-w-2xl text-sm text-ink/70">
              CHIAREL formulates with peptide and postbiotic actives —
              compared to many category leaders built around retinol or
              retinoid derivatives, which can be harsher on sensitized skin.
            </p>
          </Reveal>
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-ink/20 text-[11px] uppercase tracking-[0.16em] text-ink/65">
                  <th className="py-3 pr-4 font-normal">Dimension</th>
                  <th className="py-3 pr-4 font-normal text-ochre">CHIAREL™</th>
                  <th className="py-3 font-normal">Category Norm</th>
                </tr>
              </thead>
              <tbody>
                {formulationApproach.map((row) => (
                  <tr
                    key={row.dimension}
                    className="border-b border-ink/10 align-top transition-colors hover:bg-ochre/5"
                  >
                    <td className="py-4 pr-4 font-serif text-base text-ink">{row.dimension}</td>
                    <td className="py-4 pr-4 text-ink/80">{row.chiarel}</td>
                    <td className="py-4 text-ink/65">{row.categoryNorm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <ResultsSection />

      {/* Deeper brand/philosophy section — The House of Clarity™, Advancing
          Cellular Clarity™, Modern Biological Stress™ — positioned below all
          the customer-facing product clarity above, per
          CHIAREL_FOUR_PRODUCT_IMPLEMENTATION_PLAN.md §6. */}
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
          <Link
            href="/journal/three-skins-one-house"
            className="btn-press mt-6 inline-block border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.18em] text-ochre"
          >
            Read the Origin Story
          </Link>
        </section>
      </Reveal>

      {/* FAQ */}
      <section id="faq" className="section-y bg-ivory">
        <div className="section-x-narrow">
          <Reveal>
            <h2 className="text-center font-serif text-3xl">
              Frequently Asked Questions
            </h2>
          </Reveal>
          <div className="mt-12 divide-y divide-ink/10 border-y border-ink/10">
            {faqs.map((faq, i) => (
              <Reveal key={faq.question} delay={i * 0.06}>
                <details className="group py-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-serif text-lg leading-snug text-ink">
                    {faq.question}
                    <span className="ml-4 shrink-0 text-xl text-ink/50 group-open:hidden" aria-hidden="true">+</span>
                    <span className="ml-4 hidden shrink-0 text-xl text-ink/50 group-open:inline" aria-hidden="true">−</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-ink/70">
                    {faq.answer}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Founding Pair — unchanged contents/price/route/CTAs; homepage
          prominence reduced by moving it below the N1 hero and the
          four-product ritual, per
          CHIAREL_FOUR_PRODUCT_IMPLEMENTATION_PLAN.md §6/§13. */}
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
              <Image src={terraCreme.image} alt={productImageAlt(terraCreme)} fill sizes="25vw" />
            </div>
          </Reveal>
          <Reveal delay={0.15} className="w-full md:w-2/5">
            <h2 className="font-serif text-3xl">The Founding Pair</h2>
            <p className="mt-2 text-sm text-ink/60">
              The Signature Serum &amp; The Icon
            </p>
            <p className="mt-3 max-w-md text-sm text-ink/70">
              CHIAREL Essence and Terra Radiance Crème — the essential
              ritual in two gestures, delivered together every 45 days.
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

      {/* Beyond the Ritual — Cellular Cleanser and Lip Concentrate remain
          fully live and purchasable; only their homepage framing changes to
          reflect that they're deferred from the primary four-product launch
          ritual, per CHIAREL_FOUR_PRODUCT_IMPLEMENTATION_PLAN.md §6. */}
      <section className="section-y bg-cloud/60">
        <div className="section-x">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl">Beyond the Ritual</h2>
              <p className="mt-2 max-w-xl text-sm text-ink/70">
                Additional CHIAREL products, available anytime — not part of
                the core four-product launch ritual, but never discontinued.
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

      {/* House note — closing */}
      <Reveal className="mx-auto max-w-3xl px-6 py-24 text-center md:py-32">
        <section>
          <h2 className="font-serif text-lg text-ink/65">The House</h2>
          <p className="mt-4 font-serif text-2xl leading-relaxed">
            From the waters of Isola del Liri — where the Cascata Grande
            falls through the town itself — CHIAREL™ practices La Bella
            Figura: the discipline of presenting one&rsquo;s best self,
            quietly.
          </p>
          <Link
            href="/house"
            className="btn-press mt-8 inline-block border-b border-ochre pb-1 text-[12px] uppercase tracking-[0.2em] text-ochre"
          >
            Discover the House
          </Link>
        </section>
      </Reveal>

      <p className="pb-10 text-center text-[11px] text-ink/65">
        Written by{" "}
        <a
          href={FORMULATOR_EXTERNAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="border-b border-ink/30 hover:border-ochre hover:text-ochre"
        >
          Grazia Savoriti
        </a>
        , CHIAREL&rsquo;s formulating pharmacist. Published{" "}
        {HOMEPAGE_PUBLISHED_DISPLAY}, last reviewed{" "}
        {HOMEPAGE_LAST_UPDATED_DISPLAY}.
      </p>
    </>
  );
}
