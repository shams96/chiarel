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

      {/* Image-led top: full-width visual, purchase panel below the fold of the image */}
      <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden bg-ink">
        <Image
          src={p.image}
          alt={p.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ backgroundColor: productTint(p.color.hex) }}
        />
      </div>

      <div className="mx-auto max-w-3xl px-6 py-14 text-center">
        <p className="eyebrow">
          {p.step} · {p.family}
        </p>
        <h1 className="mt-2 font-serif text-5xl">{p.name}</h1>
        <p className="mt-1 text-sm text-ink/60">{p.descriptor}</p>
        {p.role && (
          <p className="mt-4 inline-block border border-champagne px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-ochre">
            {p.role}
          </p>
        )}
        <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-ink/75">
          {p.blurb}
        </p>
      </div>

      <div className="mx-auto max-w-lg px-6">
        <PurchaseOptions
          slug={p.slug}
          subscription={p.price.subscription}
          oneTime={p.price.oneTime}
          perDayCadenceDays={p.set ? 45 : undefined}
        />
        <dl className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-2 border-t border-ink/10 pt-6 text-[12px] text-ink/60">
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
          <p className="mt-4 text-center text-[12px] text-ink/50">
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

      {p.benefits && <KeyBenefits benefits={p.benefits} />}
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
      <div className="mx-auto max-w-2xl px-6">
        <p className="eyebrow text-center">Key Benefits</p>
        <ul className="mt-8 space-y-4">
          {benefits.map((b) => (
            <li key={b} className="flex items-start gap-3 text-sm text-ink/75">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ochre" />
              {b}
            </li>
          ))}
        </ul>
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
    <div className="mx-auto max-w-3xl border-t border-ink/10 px-6 py-16 text-center">
      <p className="eyebrow">Clinically Dosed. No Hidden Blends.</p>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink/70">
        Most formulations name an ingredient without saying how much of it is
        actually in the bottle. CHIAREL™ states the concentration of every
        active that governs performance — not as a marketing claim, but as a
        matter of record.
      </p>
      <div className="mt-10 grid gap-8 sm:grid-cols-2">
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
        <p className="eyebrow text-center text-champagne">
          The Science of {complex}
        </p>
        <div className="mt-10 space-y-8">
          {steps.map((s) => (
            <div key={s.step} className="flex gap-5">
              <span className="font-serif text-2xl text-champagne">{s.step}</span>
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
      <p className="eyebrow text-center">Complete Your Ritual</p>
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
          <p className="text-[11px] uppercase tracking-[0.18em] text-ink/50">
            {next.step}
          </p>
          <p className="font-serif text-lg">{next.name}</p>
          <p className="text-[12px] text-ink/50">
            ${next.price.subscription} with subscription
          </p>
        </div>
      </Link>
    </div>
  );
}
