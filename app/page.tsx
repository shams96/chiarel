import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { products, ritualProducts, getProductOrThrow } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import RitualCarousel from "@/components/RitualCarousel";
import EvidenceGrid from "@/components/EvidenceGrid";
import Reveal from "@/components/Reveal";
import { productTint } from "@/lib/color";
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

// Homepage-specific authorship metadata — renders a real <meta name="author">
// tag plus OpenGraph article:published_time/modified_time (property=, not
// name=, which is the convention crawlers actually check for freshness).
// The author link points to Grazia Savoriti's independent bio on Natural
// You Srl's own site (not chiarel.com) — an external, third-party-verified
// credential rather than a self-referential link back to our own /house page.
// Next.js replaces the whole openGraph object per-route rather than merging
// it with the root layout's, so title/description/siteName/url/images from
// layout.tsx are repeated here verbatim rather than relying on inheritance.
export const metadata: Metadata = {
  authors: [{ name: "Grazia Savoriti", url: FORMULATOR_EXTERNAL_URL }],
  openGraph: {
    type: "article",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — House of Skin Intelligence™`,
    description:
      "CHIAREL™ · House of Skin Intelligence™ · Advancing Cellular Clarity™. Intelligent formulations crafted in Isola del Liri, Italy.",
    url: SITE_URL,
    images: [{ url: "/assets/editorial/hero-shore-duo.png", width: 1536, height: 934 }],
    publishedTime: HOMEPAGE_PUBLISHED,
    modifiedTime: HOMEPAGE_LAST_UPDATED,
    authors: [FORMULATOR_EXTERNAL_URL],
  },
};

const faqs = [
  {
    question: "How much does CHIAREL cost?",
    answer:
      "CHIAREL Essence™, the Signature Serum, is $151 on a 45-day subscription or $189 one-time. The Founding Pair (Essence + Terra Radiance Crème) is $243 subscription or $347 one-time, and individual products range from $46 for the Lip Concentrate to $372 for the complete five-step Ritual Set. Subscription pricing sets a recurring 45-day delivery at the discounted rate; one-time purchase is priced per order.",
  },
  {
    question: "What is CHIAREL made of?",
    answer:
      "Every formula discloses its actives and concentrations plainly. CHIAREL Essence™ is built around Palmitoyl Pentapeptide-4 (3%) and Bioactive Ferment Lysate (0.30%); Terra Radiance Crème™ carries Ceramide NP (0.8%) and Niacinamide (3.0%). Each product page states its complete active ingredient list and percentage where applicable.",
  },
  {
    question: "Who formulates CHIAREL?",
    answer:
      "CHIAREL is formulated by Grazia Savoriti, CHIAREL's pharmacist specializing in cosmetic and nutraceutical research. Every formulation — from CHIAREL Essence™'s peptide complex to Terra Radiance Crème™'s barrier-support blend — is developed under her direct guidance, then produced fresh, to order, in small batches in Isola del Liri, Italy, rather than manufactured in bulk ahead of demand. She also reviews the published, peer-reviewed research cited for each active ingredient before it's formulated into a CHIAREL product, which is why every formula states its actives and exact percentages rather than grouping them into an undisclosed blend.",
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
      "CHIAREL formulas are produced in Isola del Liri, Italy, with manufacturing partner Natural You Srl, using water drawn where the Liri meets the Fibreno — a river fed entirely by limestone karst springs, with no surface tributaries of its own. That confluence of newly filtered spring water is what gives The Cascata Complex™ its name. Formulating on-site, rather than sourcing water and actives from a distance, is also why every CHIAREL batch is produced fresh, to order, instead of held in standing inventory ahead of demand.",
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
    concern: "Needs a hydration layer before treatment, or midday refresh",
    fit: "Cellular Mist™",
    why: "Low molecular weight Hyaluronic Acid for a fast-absorbing layer that preps skin for what follows.",
  },
  {
    concern: "Wants overnight recovery without a heavy routine",
    fit: "Recovery Masque™",
    why: "L-Ornithine and Panthenol formulated as the ritual's single closing, overnight gesture.",
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
  const foundingPair = getProductOrThrow("the-founding-pair");
  const ritualSet = getProductOrThrow("the-ritual-set");
  const terraCreme = getProductOrThrow("terra-radiance-creme");
  const featuredIcons = products.filter((p) =>
    ["cellular-cleanser", "lip-concentrate"].includes(p.slug)
  );
  const evidenceProducts = products.filter((p) =>
    ["chiarel-essence", "terra-radiance-creme", "recovery-masque"].includes(p.slug)
  );

  return (
    <>
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
              name: "CHIAREL™ — House of Skin Intelligence™",
              description:
                "Clinically dosed skincare formulated in Isola del Liri, Italy. Every active ingredient disclosed.",
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(offerCatalogJsonLd(products)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(researchArticleJsonLd),
        }}
      />

      {/* Hero — capped height so this photo's crop doesn't over-zoom on tall viewports; text anchored left, clear of the products on the right. */}
      <section className="relative flex h-[86dvh] max-h-[840px] min-h-[660px] w-full items-center overflow-hidden bg-ink">
        <Image
          src="/assets/editorial/hero-shore-duo.png"
          alt="CHIAREL Essence™ and Recovery Masque™ at the shore"
          fill
          priority
          className="object-cover object-[88%_50%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/25 to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
          <div className="hero-in max-w-xl text-ivory">
            <p className="text-[12px] uppercase tracking-[0.5em] text-champagne">
              House of Skin Intelligence™
            </p>
            <h1 className="mt-7 font-serif text-[13vw] leading-[0.95] tracking-[-0.02em] sm:text-6xl md:text-7xl lg:text-[5.5rem]">
              Advancing
              <br />
              Cellular Clarity™
            </h1>
            <p className="mt-8 max-w-sm text-[15px] leading-relaxed text-ivory/80">
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

      {/* Campaign banner — commissioned editorial illustration of the Cascata
          Grande (watercolor-and-ink style, not a photograph) standing in for
          real location photography, which doesn't exist yet. Deliberately
          illustrative rather than photorealistic so it's never mistaken for
          a documentary photo of the actual site — swap in a real place photo
          when one exists. */}
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
            className="mt-6 inline-block border-b border-champagne pb-0.5 text-[12px] uppercase tracking-[0.18em] text-champagne"
          >
            Read the Journal
          </Link>
        </Reveal>
      </section>

      {/* Evidence — asymmetric label+grid, deliberately not another centered
          block, so it doesn't repeat the Provenance section directly above it */}
      <section className="section-y-lg bg-ivory">
        <div className="section-x grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-16">
          <Reveal>
            <h2 className="font-serif text-3xl leading-snug">
              What&rsquo;s Actually in CHIAREL™ Formulas?
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink/70">
              Clinically dosed, no hidden blends — every active, stated. Not a
              marketing claim, a matter of record.
            </p>
          </Reveal>
          <EvidenceGrid products={evidenceProducts} />
        </div>
      </section>

      {/* Full ingredient/formulation table — real actives + percentages from
          the product catalog, addressing the lack of scannable, tabular,
          original-data content that generative engines preferentially lift. */}
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
                <tr className="border-b border-ink/20 text-[11px] uppercase tracking-[0.16em] text-ink/50">
                  <th className="py-3 pr-4 font-normal">Product</th>
                  <th className="py-3 pr-4 font-normal">Active Ingredient</th>
                  <th className="py-3 font-normal">Concentration</th>
                </tr>
              </thead>
              <tbody>
                {ingredientTable.map((row, i) => (
                  <tr key={`${row.product}-${row.ingredient}-${i}`} className="border-b border-ink/10">
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
                    <span className="text-ink/40">{row.product}: </span>
                    {row.benefit}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      </section>

      {/* Signature Duo — the two hero treatments, no price (story, not shelf) */}
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
                  <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-ink/40">
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
                      style={{ backgroundColor: productTint(p.color.hex) }}
                    >
                      <Image
                        src={p.image}
                        alt={p.name}
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

      {/* Formulated By — enlarged founder/formulator credibility block */}
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

      {/* Backed by Research — genuine third-party citations for the actives
          named above, not just a claim of "clinically dosed" */}
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
                className="mt-1 inline-block border-b border-ink/30 text-[12px] text-ink/50 hover:border-ochre hover:text-ochre"
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
                className="mt-1 inline-block border-b border-ink/30 text-[12px] text-ink/50 hover:border-ochre hover:text-ochre"
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
                className="mt-1 inline-block border-b border-ink/30 text-[12px] text-ink/50 hover:border-ochre hover:text-ochre"
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
                className="mt-1 inline-block border-b border-ink/30 text-[12px] text-ink/50 hover:border-ochre hover:text-ochre"
              >
                Published research, PubMed (NIH) →
              </a>
            </li>
          </ul>
        </div>
      </section>

      {/* Ritual carousel — paced, not a shelf */}
      <section className="section-y bg-ivory">
        <div className="section-x">
          <Reveal>
            <h2 className="font-serif text-3xl">
              How Does the CHIAREL™ Ritual Work?
            </h2>
            <p className="mt-4 max-w-2xl text-sm text-ink/70">
              Cleanse · Tone · Serum · Moisturize — delivered. A subscription
              keeps every step arriving on your rhythm, the consistency the
              skin recognises.
            </p>
          </Reveal>
          <RitualCarousel products={ritualProducts} />
        </div>
      </section>

      {/* Fit guidance — "who this is for" mapped to real skin concerns and
          real actives, not generic brand narrative */}
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
                  <p className="text-[11px] uppercase tracking-[0.16em] text-ink/40">
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
          <p className="mt-6 max-w-2xl text-[13px] leading-relaxed text-ink/50">
            Not every step is necessary for every routine — the Ritual is
            built to be used in full or picked apart by the single product
            your skin needs most.
          </p>

          <div className="mt-14 border-t border-ink/10 pt-10">
            <h3 className="font-serif text-xl text-ink">
              Common Skin Concerns This Addresses
            </h3>
            <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-ink/60">
              If you&rsquo;re experiencing any of the following, here&rsquo;s
              what in the ritual is formulated to help.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              <li className="text-[13px] leading-relaxed text-ink/70">
                <span className="font-medium text-ink">
                  Dehydration or a compromised moisture barrier:
                </span>{" "}
                addressed with Ceramide NP and low molecular weight
                Hyaluronic Acid.
              </li>
              <li className="text-[13px] leading-relaxed text-ink/70">
                <span className="font-medium text-ink">
                  Sensitive, reactive, or easily irritated skin:
                </span>{" "}
                addressed with a prebiotic complex formulated to cleanse
                without stripping the barrier.
              </li>
              <li className="text-[13px] leading-relaxed text-ink/70">
                <span className="font-medium text-ink">
                  Fine lines, dullness, uneven texture, or loss of visible
                  firmness:
                </span>{" "}
                addressed with Palmitoyl Pentapeptide-4 at 3% concentration.
              </li>
              <li className="text-[13px] leading-relaxed text-ink/70">
                <span className="font-medium text-ink">
                  Environmental stress and everyday exposure:
                </span>{" "}
                addressed with Niacinamide for daily environmental defense.
              </li>
              <li className="text-[13px] leading-relaxed text-ink/70">
                <span className="font-medium text-ink">
                  Combination skin needing balance, not stripping:
                </span>{" "}
                addressed by pairing a gentle cleanser with a light,
                fast-absorbing mist rather than a heavy single-step product.
              </li>
              <li className="text-[13px] leading-relaxed text-ink/70">
                <span className="font-medium text-ink">
                  Slow overnight recovery:
                </span>{" "}
                addressed with L-Ornithine and Panthenol in the closing,
                overnight step of the ritual.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Comparison content — CHIAREL's formulation approach vs. the
          category norm, framed generically (no named competitors) */}
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
                <tr className="border-b border-ink/20 text-[11px] uppercase tracking-[0.16em] text-ink/50">
                  <th className="py-3 pr-4 font-normal">Dimension</th>
                  <th className="py-3 pr-4 font-normal text-ochre">CHIAREL™</th>
                  <th className="py-3 font-normal">Category Norm</th>
                </tr>
              </thead>
              <tbody>
                {formulationApproach.map((row) => (
                  <tr key={row.dimension} className="border-b border-ink/10 align-top">
                    <td className="py-4 pr-4 font-serif text-base text-ink">{row.dimension}</td>
                    <td className="py-4 pr-4 text-ink/80">{row.chiarel}</td>
                    <td className="py-4 text-ink/50">{row.categoryNorm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Founding Pair — the featured purchase, price shown once here */}
      <section className="section-y bg-champagne/25">
        <div className="section-x flex flex-col items-center gap-10 md:flex-row">
          <Reveal className="grid w-full grid-cols-5 gap-4 md:w-3/5">
            <div
              className="card-elevated product-frame col-span-3 aspect-[4/5] rounded-md"
              style={{ backgroundColor: productTint(essence.color.hex) }}
            >
              <Image src={essence.image} alt={essence.name} fill sizes="35vw" />
            </div>
            <div
              className="card-elevated product-frame col-span-2 aspect-[4/5] self-end rounded-md"
              style={{ backgroundColor: productTint(terraCreme.color.hex) }}
            >
              <Image src={terraCreme.image} alt={terraCreme.name} fill sizes="25vw" />
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
            <p className="mt-6 text-[11px] uppercase tracking-[0.14em] text-ink/40">
              Available online only at chiarel.com — not sold in retail
              stores or through other sellers.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Icon Products — curated selection, not the full shelf. Header row is
          left/right split rather than centered, so it doesn't repeat the
          centered-heading shape used everywhere else on the page. */}
      <section className="section-y bg-cloud/60">
        <div className="section-x">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-serif text-2xl">
              Which CHIAREL™ Products Are Best-Sellers?
            </h2>
            <Link
              href="/shop"
              className="border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.18em] text-ochre"
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

      {/* FAQ — direct-answer content for pricing, formulation, and availability questions */}
      <section className="section-y bg-ivory">
        <div className="section-x-narrow">
          <Reveal>
            <h2 className="text-center font-serif text-3xl">
              Frequently Asked Questions
            </h2>
          </Reveal>
          <dl className="mt-12 divide-y divide-ink/10">
            {faqs.map((faq, i) => (
              <Reveal key={faq.question} delay={i * 0.06} className="py-6">
                <dt>
                  <h3 className="font-serif text-lg leading-snug">
                    {faq.question}
                  </h3>
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-ink/70">
                  {faq.answer}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* Editorial — Ritual philosophy */}
      <Reveal className="section-y-lg mx-auto max-w-3xl px-6 text-center">
        <section>
          <h2 className="font-serif text-lg text-ink/50">The Philosophy</h2>
          <p className="mt-5 font-serif text-3xl leading-relaxed text-ink">
            &ldquo;Skin is not one thing. A house built to serve it should not
            pretend otherwise.&rdquo;
          </p>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-ink/70">
            CHIAREL Intelligence™ began as a question at a kitchen table —
            the working method still holds: start with the biology in front
            of you, formulate it properly, and disclose exactly what went
            in. It is the same discipline behind La Bella Figura —
            presenting one&rsquo;s best self, quietly, without announcement.
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
          <h2 className="font-serif text-lg text-ink/50">The House</h2>
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

      <p className="pb-10 text-center text-[11px] text-ink/40">
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
