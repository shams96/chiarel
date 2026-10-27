import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";

// Two panels directly under the hero: the face first, then the neck and
// décolleté. Replaces the former "below the jawline" feature section; its
// "What It Is Designed For" list lives in the second panel.
// Cosmetic, non-medical language only.
const faceProducts = [
  { name: "Clarity Essence™", concern: "For fine lines and firmness", href: "/shop/clarity-essence" },
  { name: "Clarity Day Crème™", concern: "For dry skin under daily stress", href: "/shop/clarity-day-creme" },
  { name: "Clarity Night Crème™", concern: "For smoother-looking texture", href: "/shop/clarity-night-creme" },
  {
    name: "Clarity Eye Contour Concentrate™",
    concern: "For puffiness, dark circles and fine lines",
    href: "/shop/clarity-eye-contour-concentrate",
  },
];

const concerns = [
  "Dryness",
  "Crepey-looking texture",
  "The appearance of horizontal lines",
  "The look of improved suppleness",
];

export default function HomeFaceBeyond() {
  return (
    <section className="grid md:grid-cols-2">
      <div className="bg-peachdust px-6 py-14 text-ink md:px-12 md:py-20">
        <Reveal className="mx-auto max-w-[34rem] md:mx-0">
          <div className="border-t border-redochre pt-6">
            <h2 className="font-serif text-3xl leading-snug text-redochre">The Face, First</h2>
            <p className="mt-2 font-serif text-lg italic">We begin where you are most seen.</p>
            <p className="mt-4 text-sm leading-relaxed">Four formulas, each made for one purpose.</p>
          </div>
          <div className="relative mx-auto mt-8 aspect-square w-full max-w-[16rem]">
            <Image
              src="/assets/products/clarity-essence-bottle.png"
              alt="Clarity Essence™ in its glass bottle"
              fill
              sizes="(max-width: 768px) 60vw, 256px"
              className="object-contain"
            />
          </div>
          <ul className="mt-8 grid gap-5">
            {faceProducts.map((p) => (
              <li key={p.href}>
                <Link href={p.href} className="font-serif text-xl text-redochre underline underline-offset-4">
                  {p.name}
                </Link>
                <p className="mt-1 text-sm">{p.concern}</p>
              </li>
            ))}
          </ul>
          <Link
            href="/shop"
            className="mt-8 inline-block text-[12px] uppercase tracking-[0.3em] text-redochre underline underline-offset-[6px]"
          >
            Shop the face
          </Link>
        </Reveal>
      </div>

      <div className="bg-garden px-6 py-14 text-ivory md:px-12 md:py-20">
        <Reveal delay={0.1} className="mx-auto max-w-[34rem] md:mx-0">
          <h2 className="font-serif text-3xl leading-snug">Beyond the Face</h2>
          <p className="mt-2 font-serif text-lg italic">
            The neck and décolleté are the skin most routines forget.
          </p>
          <p className="mt-4 text-sm leading-relaxed">
            Clarity Neck &amp; Décolleté Crème™ gives the skin below the jaw the
            same discipline as the face, for crepey-looking skin on the neck
            and chest. One ritual, one standard, from the cheekbone to the
            collarbone.
          </p>
          <div className="mx-auto mt-8 flex aspect-square w-full max-w-[16rem] items-center justify-center bg-peachdust p-6">
            <div className="relative h-full w-full">
              <Image
                src="/assets/products/clarity-neck-decollete-creme-bottle.png"
                alt="Clarity Neck & Décolleté Crème™ in its green glass bottle"
                fill
                sizes="(max-width: 768px) 60vw, 256px"
                className="object-contain"
              />
            </div>
          </div>
          <h3 className="mt-8 font-serif text-xl">What It Is Designed For</h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {concerns.map((concern) => (
              <li
                key={concern}
                className="border border-champagne px-4 py-3 font-serif text-base leading-snug"
              >
                {concern}
              </li>
            ))}
          </ul>
          <Link
            href="/shop/clarity-neck-decollete-creme"
            className="btn-press mt-8 inline-block bg-champagne px-8 py-3 text-[12px] uppercase tracking-[0.3em] text-ink"
          >
            Shop Clarity Neck &amp; Décolleté Crème™
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
