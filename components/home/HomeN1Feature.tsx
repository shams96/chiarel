import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { getProductOrThrow, productImageAlt } from "@/lib/products";

// N1 as the featured new product (merges the former N1 hero copy, the
// "what N1 is designed for" list and the "below the jawline" explainer).
// Cosmetic, non-medical language only.
// DRAFT — OWNER / REGULATORY APPROVAL REQUIRED (unchanged from prior copy).
const concerns = [
  "Dryness",
  "Crepey-looking texture",
  "The appearance of horizontal lines",
  "Reduced visible suppleness",
];

export default function HomeN1Feature() {
  const n1 = getProductOrThrow("n1-neck-decollete");

  return (
    <section className="section-y border-y border-ink/10 bg-cloud/40">
      <div className="section-x grid items-center gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
        <Reveal>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden">
            <Image
              src="/assets/products/n1-neck-decollete-marble-roses.jpg"
              alt={productImageAlt(n1)}
              fill
              sizes="(max-width: 768px) 80vw, 384px"
              className="object-cover"
            />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-[11px] uppercase tracking-[0.3em] text-ochre">New</p>
          <h2 className="mt-3 font-serif text-3xl leading-snug">
            Why the Skin Below the Jawline Needs Its Own Ritual
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink/70">
            Most routines stop at the jawline. The neck and décolleté are
            treated, at best, as an afterthought of whatever face cream is
            left on the fingertips — not formulated for on their own terms.
            N1 is CHIAREL&rsquo;s answer: a dedicated nightly step for the
            skin most routines forget, finished with a delicate CHIAREL
            accord.
          </p>
          <h3 className="mt-8 font-serif text-xl">What N1 Is Designed For</h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {concerns.map((concern) => (
              <li
                key={concern}
                className="border border-ink/10 bg-white/60 px-4 py-3 font-serif text-base leading-snug text-ink"
              >
                {concern}
              </li>
            ))}
          </ul>
          <Link
            href="/shop/n1-neck-decollete"
            className="btn-press mt-8 inline-block border border-ink px-8 py-3 text-[12px] uppercase tracking-[0.3em] text-ink transition hover:border-ochre hover:text-ochre"
          >
            Discover N1
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
