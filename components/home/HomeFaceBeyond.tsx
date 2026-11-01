import ResponsiveImage from "@/components/ResponsiveImage";
import Link from "next/link";
import Reveal from "@/components/Reveal";

// Two panels under the hero: the face first (four product cards, each a scene
// photograph), then the neck and décolleté (the festive Neck scene, with the
// "What It Is Designed For" list). Cosmetic, non-medical language only.
const faceProducts = [
  {
    name: "Clarity Essence™",
    concern: "For fine lines and firmness",
    href: "/shop/clarity-essence",
    image: "/assets/products/clarity-essence-ribbon-scene-2-v2.jpg",
    alt: "Clarity Essence™ bottle on a plinth with a frosted flower and a green CHIAREL velvet ribbon",
  },
  {
    name: "Clarity Day Crème™",
    concern: "For dry skin under daily stress",
    href: "/shop/clarity-day-creme",
    image: "/assets/products/clarity-day-creme-ribbon-scene-v2.jpg",
    alt: "Clarity Day Crème™ jar on travertine with a green CHIAREL velvet ribbon",
  },
  {
    name: "Clarity Night Crème™",
    concern: "For smoother-looking texture",
    href: "/shop/clarity-night-creme",
    image: "/assets/products/clarity-night-creme-ribbon-scene-v2.jpg",
    alt: "Clarity Night Crème™ jar among moss and ferns with a Red Ochre CHIAREL velvet ribbon",
  },
  {
    name: "Clarity Eye Contour Concentrate™",
    concern: "For puffiness, dark circles and fine lines",
    href: "/shop/clarity-eye-contour-concentrate",
    image: "/assets/products/clarity-eye-contour-concentrate-ribbon-scene-v2.jpg",
    alt: "Clarity Eye Contour Concentrate™ bottle among blush petals with a green CHIAREL velvet ribbon",
  },
];

const concerns = [
  "Dryness",
  "Crepey-looking texture",
  "The appearance of horizontal lines",
  "The look of improved suppleness",
];

const gutter = "px-[clamp(1.5rem,4.5vw,7rem)]";

export default function HomeFaceBeyond() {
  return (
    <section className="grid lg:grid-cols-2">
      <div className={`bg-ivory ${gutter} py-16 text-ink md:py-24`}>
        <Reveal className="mx-auto max-w-[56rem]">
          <div className="border-t border-ochre pt-7">
            <h2 className="font-serif text-[clamp(2rem,1.1rem+2.2vw,3.8rem)] leading-tight text-ochre">
              The Face, First
            </h2>
            <p className="mt-3 font-serif text-[clamp(1.15rem,0.9rem+0.7vw,1.9rem)] italic">
              We begin where you are most seen.
            </p>
            <p className="mt-4 text-[clamp(1rem,0.85rem+0.35vw,1.3rem)] leading-relaxed">
              Four formulas, each made for one purpose.
            </p>
          </div>

          <ul className="mt-10 grid grid-cols-2 gap-x-[clamp(1rem,2vw,2.5rem)] gap-y-[clamp(1.75rem,3vw,3.5rem)]">
            {faceProducts.map((p) => (
              <li key={p.href}>
                <Link href={p.href} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden bg-ivory">
                    <ResponsiveImage
                      src={p.image}
                      alt={p.alt}
                      sizes="(max-width: 1024px) 45vw, 22vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  </div>
                  <h3 className="mt-4 font-serif text-[clamp(1.05rem,0.85rem+0.6vw,1.65rem)] leading-snug text-ochre underline decoration-ochre/0 underline-offset-4 transition group-hover:decoration-ochre">
                    {p.name}
                  </h3>
                  <p className="mt-1 text-[clamp(0.9rem,0.8rem+0.25vw,1.15rem)] leading-snug">{p.concern}</p>
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/shop"
            className="mt-12 inline-block text-[clamp(12px,0.65rem+0.3vw,15px)] uppercase tracking-[0.3em] text-ochre underline underline-offset-[6px]"
          >
            Shop the face
          </Link>
        </Reveal>
      </div>

      <div className={`bg-cloud ${gutter} py-16 text-ink md:py-24 lg:border-l lg:border-ink/15`}>
        <Reveal delay={0.1} className="mx-auto max-w-[56rem]">
          <Link href="/shop/clarity-neck-decollete-creme" className="group block">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-ivory">
              <ResponsiveImage
                src="/assets/products/clarity-neck-decollete-creme-festive-scene-v2.jpg"
                alt="Clarity Neck & Décolleté Crème™ in its green glass bottle, framed by a frosted flower and Red Ochre CHIAREL velvet ribbon"
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
            </div>
          </Link>

          <h2 className="mt-10 font-serif text-[clamp(2rem,1.1rem+2.2vw,3.8rem)] leading-tight">
            Beyond the Face
          </h2>
          <p className="mt-3 font-serif text-[clamp(1.15rem,0.9rem+0.7vw,1.9rem)] italic">
            The neck and décolleté are the skin most routines forget.
          </p>
          <p className="mt-4 text-[clamp(1rem,0.85rem+0.35vw,1.3rem)] leading-relaxed">
            Clarity Neck &amp; Décolleté Crème™ gives the skin below the jaw the
            same discipline as the face, for crepey-looking skin on the neck
            and chest. One ritual, one standard, from the cheekbone to the
            collarbone.
          </p>

          <h3 className="mt-10 font-serif text-[clamp(1.25rem,1rem+0.7vw,2rem)]">What It Is Designed For</h3>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {concerns.map((concern) => (
              <li
                key={concern}
                className="border border-ink/20 px-5 py-4 font-serif text-[clamp(1rem,0.85rem+0.35vw,1.3rem)] leading-snug"
              >
                {concern}
              </li>
            ))}
          </ul>
          <Link
            href="/shop/clarity-neck-decollete-creme"
            className="btn-press mt-10 inline-block bg-garden px-[clamp(2rem,3vw,3.25rem)] py-[clamp(0.9rem,1.1vw,1.3rem)] text-[clamp(12px,0.6rem+0.3vw,14px)] uppercase tracking-[0.3em] text-ivory"
          >
            Shop Clarity Neck &amp; Décolleté Crème™
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
