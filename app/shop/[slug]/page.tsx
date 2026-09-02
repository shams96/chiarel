import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getProduct, products, ritualProducts } from "@/lib/products";
import PurchaseOptions from "@/components/PurchaseOptions";
import StickyPurchaseBar from "@/components/StickyPurchaseBar";
import Reveal from "@/components/Reveal";
import { productJsonLd } from "@/lib/seo";
import { productTint } from "@/lib/color";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const p = getProduct(params.slug);
  if (!p) return {};
  return {
    title: `${p.name} — ${p.descriptor}`,
    description: p.blurb,
    alternates: { canonical: `/shop/${p.slug}` },
    openGraph: { images: [{ url: p.image }] },
  };
}

export default function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const p = getProduct(params.slug);
  if (!p) notFound();

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(p)) }}
      />

      {/* Hero — gallery left, buy box right (stacked on mobile). Buy box sits
          beside the product from the first viewport, not below a full-bleed
          banner — the single highest-leverage PDP conversion fix. */}
      <div className="mx-auto max-w-6xl px-6 pt-8 md:pt-14">
        <div className="grid gap-8 md:grid-cols-2 md:items-start md:gap-14">
          {/* Gallery column — single image today; sized to take a second/third
              thumbnail or video without restructuring once more assets exist. */}
          <div className="md:sticky md:top-24">
            <div
              className="relative aspect-[4/5] w-full overflow-hidden rounded-md"
              style={{ backgroundColor: productTint(p.color.hex) }}
            >
              <Image
                src={p.image}
                alt={p.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              {p.badge && (
                <span className="absolute left-4 top-4 bg-ivory/90 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-ochre">
                  {p.badge}
                </span>
              )}
            </div>
          </div>

          {/* Buy box column */}
          <div className="md:pt-2">
            <h1 className="font-serif text-4xl leading-tight md:text-5xl">
              {p.name}
            </h1>
            <p className="mt-1 text-sm text-ink/60">{p.descriptor}</p>
            {p.role && (
              <p className="mt-4 inline-block border border-champagne px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-ochre">
                {p.role}
              </p>
            )}
            <p className="mt-6 max-w-md text-sm leading-relaxed text-ink/75">
              {p.blurb}
            </p>

            <div className="mt-8">
              <PurchaseOptions
                slug={p.slug}
                subscription={p.price.subscription}
                oneTime={p.price.oneTime}
                perDayCadenceDays={p.set ? 45 : undefined}
              />
            </div>

            <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-2 border-t border-ink/10 pt-6 text-[12px] text-ink/60">
              <div className="flex gap-1.5">
                <dt className="text-ink/40">Step:</dt>
                <dd>{p.step}</dd>
              </div>
              <div className="flex gap-1.5">
                <dt className="text-ink/40">Family:</dt>
                <dd>{p.family}</dd>
              </div>
              {p.complex && (
                <div className="flex gap-1.5">
                  <dt className="text-ink/40">Complex:</dt>
                  <dd>{p.complex}</dd>
                </div>
              )}
              <div className="flex gap-1.5">
                <dt className="text-ink/40">Size:</dt>
                <dd>{p.size}</dd>
              </div>
              <div className="flex items-center gap-1.5">
                <dt className="text-ink/40">Color:</dt>
                <dd className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full border border-ink/20"
                    style={{ backgroundColor: p.color.hex }}
                  />
                  {p.color.name}
                </dd>
              </div>
            </dl>
            {(p.slug === "terra-radiance-creme" || p.slug === "recovery-masque") && (
              <p className="mt-4 text-[12px] text-ink/50">
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

      {p.benefits && <KeyBenefits benefits={p.benefits} />}
      {p.slug === "recovery-masque" && <IncludedSpatula />}
      {p.actives && (
        <Reveal>
          <ClinicallyDosed actives={p.actives} />
        </Reveal>
      )}
      {p.complex && (
        <Reveal>
          <TheScience complex={p.complex} slug={p.slug} />
        </Reveal>
      )}
      <ScienceLinks slug={p.slug} />
      {p.ritualOrder !== null && (
        <Reveal>
          <CompleteYourRitual currentSlug={p.slug} />
        </Reveal>
      )}
      <StickyPurchaseBar
        slug={p.slug}
        name={p.name}
        image={p.image}
        subscriptionPrice={p.price.subscription}
      />
    </div>
  );
}

function KeyBenefits({ benefits }: { benefits: string[] }) {
  return (
    <Reveal className="border-t border-ink/10 bg-cloud/40 py-16">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-center font-serif text-2xl">Key benefits</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {benefits.map((b, i) => (
            <div
              key={b}
              className="card-elevated rounded-md bg-white p-6 text-sm leading-relaxed text-ink/75"
            >
              <span className="font-serif text-3xl text-ochre/80">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="mt-3">{b}</p>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

function IncludedSpatula() {
  return (
    <Reveal className="border-t border-ink/10 bg-white py-16">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 px-6 text-center md:flex-row md:text-left">
        <div className="relative aspect-square w-40 shrink-0 overflow-hidden rounded-sm bg-champagne/20">
          <Image
            src="/assets/products/applicator-spatula.png"
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

function ClinicallyDosed({
  actives,
}: {
  actives: { name: string; percent: string | null }[];
}) {
  return (
    <div className="mx-auto max-w-4xl border-t border-ink/10 px-6 py-16">
      <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-start md:gap-14">
        <div>
          <h2 className="font-serif text-2xl leading-snug">
            Clinically Dosed. No Hidden Blends.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink/70">
            Most formulations name an ingredient without saying how much of
            it is actually in the bottle. CHIAREL™ states the concentration
            of every active that governs performance — not as a marketing
            claim, but as a matter of record.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          {actives.map((a) => (
            <div key={a.name}>
              <p className="font-serif text-5xl text-ochre">
                {a.percent ?? "Complex"}
              </p>
              <p className="mt-2 text-sm text-ink/70">{a.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const mechanismBySlug: Record<string, { step: string; text: string }[]> = {
  "cellular-cleanser": [
    { step: "01", text: "A postbiotic lysate supports the skin's surface microbiome balance during cleansing." },
    { step: "02", text: "A prebiotic complex feeds that same microbial balance, rather than stripping it." },
    { step: "03", text: "Together, they let the cleanse step support the barrier instead of working against it." },
  ],
  "chiarel-essence": [
    { step: "01", text: "Palmitoyl Pentapeptide-4 is studied for supporting the skin's structural proteins." },
    { step: "02", text: "A postbiotic complex is studied for upregulating the proteins that hold the barrier together." },
    { step: "03", text: "Delivered as a concentrate, positioned as the ritual's central treatment step." },
  ],
  "terra-radiance-creme": [
    { step: "01", text: "Ceramide NP helps replace lipids the skin barrier naturally loses over the day." },
    { step: "02", text: "Niacinamide is studied for supporting barrier function and visible tone." },
    { step: "03", text: "Formulated for daytime wear, under environmental and daily stress." },
  ],
  "recovery-masque": [
    { step: "01", text: "L-Ornithine is a natural component of the skin's own moisture-regulation system." },
    { step: "02", text: "Panthenol supports moisture replenishment and comfort overnight." },
    { step: "03", text: "Formulated as the ritual's closing gesture, while the skin recovers at rest." },
  ],
};

function TheScience({ complex, slug }: { complex: string; slug: string }) {
  const steps = mechanismBySlug[slug];
  if (!steps) return null;
  return (
    <div className="border-t border-ink/10 bg-ink py-20 text-ivory">
      <div className="mx-auto max-w-2xl px-6">
        <h2 className="text-center font-serif text-2xl text-champagne">
          The science of {complex}
        </h2>
        <div className="relative mt-12 space-y-10 border-l border-champagne/25 pl-8">
          {steps.map((s, i) => (
            <div key={s.step} className="relative">
              <span className="absolute -left-[41px] top-0 flex h-6 w-6 items-center justify-center rounded-full border border-champagne/40 bg-ink text-[11px] text-champagne">
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed text-ivory/75">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const scienceLinksBySlug: Record<string, { label: string; href: string }[]> = {
  "cellular-cleanser": [
    { label: "Bifida Ferment Lysate, Explained", href: "/science/bifida-ferment-lysate" },
  ],
  "chiarel-essence": [
    { label: "Bifida Ferment Lysate, Explained", href: "/science/bifida-ferment-lysate" },
    { label: "Building a More Resilient Skin Barrier", href: "/science/barrier-resilience" },
  ],
  "recovery-masque": [
    { label: "L-Ornithine, Explained", href: "/science/l-ornithine" },
    { label: "Building a More Resilient Skin Barrier", href: "/science/barrier-resilience" },
  ],
};

function ScienceLinks({ slug }: { slug: string }) {
  const links = scienceLinksBySlug[slug];
  if (!links) return null;
  return (
    <div className="mx-auto mt-8 max-w-2xl px-6 text-center">
      <p className="text-[12px] text-ink/50">
        Formulated with:{" "}
        {links.map((l, i) => (
          <span key={l.href}>
            <Link href={l.href} className="border-b border-ochre text-ochre">
              {l.label}
            </Link>
            {i < links.length - 1 ? " · " : ""}
          </span>
        ))}
      </p>
    </div>
  );
}

function CompleteYourRitual({ currentSlug }: { currentSlug: string }) {
  const next = ritualProducts.find((r) => r.slug !== currentSlug);
  if (!next) return null;
  return (
    <div className="mx-auto mt-4 max-w-3xl border-t border-ink/10 px-6 pb-20 pt-14">
      <h2 className="text-center font-serif text-2xl">Complete your ritual</h2>
      <Link
        href={`/shop/${next.slug}`}
        className="mt-6 flex items-center gap-6 rounded-sm border border-ink/10 p-4 transition hover:border-ochre"
      >
        <div
          className="relative h-24 w-24 shrink-0 overflow-hidden rounded-sm"
          style={{ backgroundColor: productTint(next.color.hex) }}
        >
          <Image src={next.image} alt={next.name} fill sizes="96px" className="object-cover" />
        </div>
        <div>
          <p className="font-serif text-lg">{next.name}</p>
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-ink/40">
            {next.step}
          </p>
          <p className="text-[12px] text-ink/50">
            ${next.price.subscription} with subscription
          </p>
        </div>
      </Link>
    </div>
  );
}
