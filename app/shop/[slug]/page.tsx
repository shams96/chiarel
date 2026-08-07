import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getProduct, products, ritualProducts } from "@/lib/products";
import PurchaseOptions from "@/components/PurchaseOptions";
import { productJsonLd } from "@/lib/seo";

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
    <div className="mx-auto max-w-6xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(p)) }}
      />
      <div className="grid gap-12 md:grid-cols-2">
        <div
          className="relative aspect-square overflow-hidden rounded-sm"
          style={{ backgroundColor: `${p.color.hex}55` }}
        >
          <Image
            src={p.image}
            alt={p.name}
            fill
            priority
            sizes="50vw"
            className="object-cover"
          />
        </div>
        <div>
          <p className="eyebrow">
            {p.step} · {p.family}
          </p>
          <h1 className="mt-2 font-serif text-4xl">{p.name}</h1>
          <p className="mt-1 text-sm text-ink/60">{p.descriptor}</p>
          {p.role && (
            <p className="mt-3 inline-block border border-champagne px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-ochre">
              {p.role}
            </p>
          )}
          <p className="mt-6 max-w-md text-sm leading-relaxed text-ink/75">
            {p.blurb}
          </p>
          <dl className="mt-6 space-y-1.5 text-[13px] text-ink/60">
            {p.complex && (
              <div className="flex gap-2">
                <dt className="font-medium text-ink/80">Signature Complex:</dt>
                <dd>{p.complex}</dd>
              </div>
            )}
            <div className="flex gap-2">
              <dt className="font-medium text-ink/80">Size:</dt>
              <dd>{p.size}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-ink/80">Category Color:</dt>
              <dd className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full border border-ink/20"
                  style={{ backgroundColor: p.color.hex }}
                />
                {p.color.name}
              </dd>
            </div>
          </dl>
          <PurchaseOptions
            slug={p.slug}
            subscription={p.price.subscription}
            oneTime={p.price.oneTime}
          />
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

      {p.ritualOrder !== null && <CompleteYourRitual currentSlug={p.slug} />}
    </div>
  );
}

function CompleteYourRitual({ currentSlug }: { currentSlug: string }) {
  const next = ritualProducts.find((r) => r.slug !== currentSlug);
  if (!next) return null;
  return (
    <div className="mx-auto mt-20 max-w-6xl border-t border-ink/10 px-6 pt-14">
      <p className="eyebrow">Complete Your Ritual</p>
      <Link
        href={`/shop/${next.slug}`}
        className="mt-4 flex items-center gap-6 rounded-sm border border-ink/10 p-4 transition hover:border-ochre"
      >
        <div
          className="relative h-24 w-24 shrink-0 overflow-hidden rounded-sm"
          style={{ backgroundColor: `${next.color.hex}55` }}
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
