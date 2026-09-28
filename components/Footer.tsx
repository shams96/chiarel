import Image from "next/image";
import Link from "next/link";

const trustBadges = [
  "Complimentary shipping at $150",
  "90-Day Guarantee on your first order",
  "Secure checkout via Stripe",
  "Formulated by a pharmacist",
  "Made to order in Isola del Liri, Italy",
  "Every active ingredient disclosed",
];

const navColumns = [
  {
    heading: "Shop",
    links: [
      { href: "/shop", label: "Shop All" },
      { href: "/shop/n1-neck-decollete", label: "Neck & Décolleté" },
      { href: "/ritual", label: "The Ritual" },
      { href: "/science", label: "The Science" },
    ],
  },
  {
    heading: "House",
    links: [
      { href: "/house", label: "The House" },
      { href: "/journal", label: "Journal" },
      { href: "/account", label: "Account" },
      { href: "/press", label: "Press" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
];

// Two floating rounded cards (Formal Garden left, Red Ochre right) carry every
// footer element — nav, trust badges, contact CTA. A single "CHIAREL" wordmark
// spans both cards as two clip-path-aligned copies of the same text, each tinted
// for its own background, so it reads as one continuous engraved mark rather
// than two separate logos. Only the copyright line sits outside the cards.
export default function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-cloud">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="relative grid grid-cols-1 gap-4 md:grid-cols-[1fr_2fr] md:gap-5">
          {/* Left card — Formal Garden, product shot */}
          <div className="relative min-h-[280px] overflow-hidden rounded-[1.5rem] bg-garden md:min-h-[460px]">
            <div className="relative h-full w-full">
              <Image
                src="/assets/products/recovery-masque-jar.png"
                alt="CHIAREL Recovery Masque jar"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-contain object-bottom p-8"
              />
            </div>
          </div>

          {/* Right card — Red Ochre, all footer content */}
          <div className="relative flex min-h-[460px] flex-col justify-between overflow-hidden rounded-[1.5rem] bg-ochre p-8 text-cloud sm:p-10 md:p-12">
            <div className="relative z-10">
              <h2 className="font-serif text-3xl leading-tight sm:text-4xl">
                Contact{" "}
                <span
                  className="text-transparent"
                  style={{ WebkitTextStroke: "1px #F0F2EB" }}
                >
                  CHIAREL
                </span>
              </h2>
              <Link
                href="/contact"
                className="mt-6 inline-block border-b border-champagne pb-0.5 text-[12px] uppercase tracking-[0.2em] text-champagne transition hover:text-cloud"
              >
                Reach the House →
              </Link>
            </div>

            <nav className="relative z-10 mt-10 grid grid-cols-2 gap-x-8 gap-y-8 text-[13px] sm:grid-cols-3">
              {navColumns.map((col) => (
                <div key={col.heading} className="flex flex-col gap-2">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-cloud/60">
                    {col.heading}
                  </p>
                  {col.links.map((link) => (
                    <Link key={link.href} href={link.href} className="text-cloud hover:text-champagne">
                      {link.label}
                    </Link>
                  ))}
                </div>
              ))}
            </nav>

            <ul className="relative z-10 mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-cloud/15 pt-6 text-[10px] uppercase tracking-[0.12em] text-cloud/65">
              {trustBadges.map((badge) => (
                <li key={badge} className="flex items-center gap-2">
                  <span className="inline-block h-1 w-1 rounded-full bg-champagne" aria-hidden="true" />
                  {badge}
                </li>
              ))}
            </ul>
          </div>

          {/* Engraved wordmark — one word, two tonal treatments split at the
              card boundary (~1/3 : 2/3, matching the grid columns above) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-20 hidden overflow-hidden md:block"
          >
            <p
              className="absolute left-[2%] top-8 whitespace-nowrap font-serif text-[9vw] leading-none tracking-tight text-transparent"
              style={{
                WebkitTextStroke: "1px rgba(214,197,160,0.5)",
                clipPath: "inset(0 66.666% 0 0)",
              }}
            >
              CHIAREL
            </p>
            <p
              className="absolute left-[2%] top-8 whitespace-nowrap font-serif text-[9vw] leading-none tracking-tight text-transparent"
              style={{
                WebkitTextStroke: "1px rgba(240,242,235,0.4)",
                clipPath: "inset(0 0 0 33.333%)",
              }}
            >
              CHIAREL
            </p>
          </div>
        </div>

        <p className="mt-8 text-[11px] text-ink/65">
          © {new Date().getFullYear()} CHIAREL™ · 1HubSolutions, LLC. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
