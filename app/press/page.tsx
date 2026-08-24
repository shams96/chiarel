import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { products } from "@/lib/products";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Press Kit",
  description:
    "CHIAREL™ press kit: brand fact sheet, the six-formulation launch lineup, downloadable wordmarks and monogram, and press contact information.",
  alternates: { canonical: "/press" },
};

const launchSkus = products.filter((p) => !p.set);

const assets = [
  {
    file: "CHIAREL_Wordmark_RedOchre.svg",
    label: "Wordmark — Red Ochre",
    bg: "bg-ivory",
  },
  {
    file: "CHIAREL_Wordmark_PeachDust.svg",
    label: "Wordmark — Peach Dust",
    bg: "bg-ocean",
  },
  {
    file: "CHIAREL_Favicon_Monogram.svg",
    label: "Monogram",
    bg: "bg-ivory",
  },
];

export default function PressPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-serif text-4xl leading-tight">CHIAREL™ Press Kit</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink/70">
        Brand facts, the launch lineup, and downloadable assets for
        journalists, editors, and press covering the House.
      </p>

      {/* Brand Fact Sheet */}
      <section className="mt-14">
        <h2 className="font-serif text-2xl text-ink">Brand Fact Sheet</h2>
        <dl className="mt-6 space-y-5 text-sm leading-relaxed text-ink/80">
          <div>
            <dt className="text-[11px] uppercase tracking-[0.16em] text-ink/50">
              Name
            </dt>
            <dd className="mt-1">CHIAREL™</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.16em] text-ink/50">
              Tagline
            </dt>
            <dd className="mt-1">House of Skin Intelligence™</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.16em] text-ink/50">
              Mission
            </dt>
            <dd className="mt-1 max-w-xl">
              Advancing Cellular Clarity™ — supporting the skin&rsquo;s own
              intelligence against Modern Biological Stress™, with restraint,
              precision, and respect for the skin&rsquo;s biology.
            </dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.16em] text-ink/50">
              Founding Story
            </dt>
            <dd className="mt-1 max-w-xl">
              The question started at a kitchen table, not a lab — one
              household, three different skin types (reactive, combination,
              mature), and no formulation house precise enough to serve all
              three with equal rigor. That question became the brief, formulated
              properly under a pharmacist&rsquo;s guidance in Isola del Liri.{" "}
              <Link
                href="/journal/three-skins-one-house"
                className="border-b border-ochre text-ochre"
              >
                Read the full origin story
              </Link>
              .
            </dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.16em] text-ink/50">
              Provenance
            </dt>
            <dd className="mt-1 max-w-xl">
              Formulated in Isola del Liri, Italy — a town in the Liri valley
              built around the Cascata Grande waterfall, roughly an hour and
              a half from Rome — in partnership with manufacturing partner
              Natural You Srl.{" "}
              <Link href="/house" className="border-b border-ochre text-ochre">
                More on the House
              </Link>
              .
            </dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.16em] text-ink/50">
              Parent Company
            </dt>
            <dd className="mt-1">1HubSolutions, LLC</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.16em] text-ink/50">
              Website
            </dt>
            <dd className="mt-1">
              <a href={SITE_URL} className="border-b border-ochre text-ochre">
                {SITE_URL.replace("https://", "")}
              </a>
            </dd>
          </div>
        </dl>
      </section>

      {/* Product Lineup */}
      <section className="mt-16 border-t border-ink/10 pt-12">
        <h2 className="font-serif text-2xl text-ink">The Launch Lineup</h2>
        <p className="mt-2 max-w-xl text-sm text-ink/70">
          Six formulations, each assigned a signature category color across
          the ritual.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {launchSkus.map((p) => (
            <li
              key={p.slug}
              className="flex items-start gap-4 border border-ink/10 p-4"
            >
              <span
                className="mt-1 inline-block h-4 w-4 shrink-0 rounded-full border border-ink/20"
                style={{ backgroundColor: p.color.hex }}
                aria-hidden
              />
              <div>
                <p className="font-serif text-lg leading-tight text-ink">
                  {p.name}
                </p>
                <p className="mt-1 text-[13px] text-ink/60">{p.descriptor}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-ink/40">
                  {p.color.name} · {p.family}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <Link
          href="/shop"
          className="mt-6 inline-block border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.16em] text-ochre"
        >
          View the full shop
        </Link>
      </section>

      {/* Brand Assets */}
      <section className="mt-16 border-t border-ink/10 pt-12">
        <h2 className="font-serif text-2xl text-ink">Brand Assets</h2>
        <p className="mt-2 max-w-xl text-sm text-ink/70">
          Approved wordmark and monogram files for editorial use. Please do
          not alter colors, proportions, or the ™ symbol.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {assets.map((a) => (
            <div key={a.file} className="border border-ink/10 p-5">
              <div
                className={`flex h-28 items-center justify-center rounded-sm ${a.bg}`}
              >
                <Image
                  src={`/assets/brand/${a.file}`}
                  alt={`CHIAREL™ ${a.label}`}
                  width={140}
                  height={56}
                  className="h-auto max-h-16 w-auto"
                />
              </div>
              <p className="mt-3 text-[13px] text-ink/70">{a.label}</p>
              <a
                href={`/assets/brand/${a.file}`}
                download
                className="mt-1 inline-block border-b border-ochre pb-0.5 text-[11px] uppercase tracking-[0.14em] text-ochre"
              >
                Download SVG
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="mt-16 border-t border-ink/10 pt-12">
        <h2 className="font-serif text-2xl text-ink">Press Inquiries</h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/70">
          For interview requests, high-resolution imagery, or additional
          brand materials, please reach out.
        </p>
        <a
          href="mailto:press@chiarel.com"
          className="mt-4 inline-block border-b border-ochre pb-0.5 text-sm text-ochre"
        >
          press@chiarel.com
        </a>
      </section>
    </div>
  );
}
