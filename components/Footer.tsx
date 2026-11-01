import Image from "next/image";
import Link from "next/link";
import CookieSettingsLink from "@/components/CookieSettingsLink";
import EmailSignup from "@/components/EmailSignup";

const trustBadges = [
  "Complimentary shipping on every plan",
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
      { href: "/shop/clarity-neck-decollete-creme", label: "Clarity Neck & Décolleté Crème" },
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
        <div className="relative grid grid-cols-1 gap-1 md:grid-cols-[1fr_2fr] md:gap-5">
          {/* Left card — Formal Garden, product shot */}
          <div className="relative h-[280px] overflow-hidden rounded-[1.5rem] bg-garden md:h-auto md:min-h-[460px]">
            <div className="relative h-full w-full">
              <Image
                src="/assets/products/clarity-night-creme-jar.png"
                alt="Clarity Night Crème jar"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-contain object-bottom p-8 max-md:pb-14"
              />
            </div>
          </div>

          {/* Right card — Red Ochre, all footer content */}
          <div className="relative flex min-h-[460px] flex-col justify-between overflow-hidden rounded-[1.5rem] bg-ochre p-8 text-cloud max-md:pt-14 sm:p-10 md:p-12">
            <div className="relative z-10">
              <h2 className="font-serif text-3xl leading-tight sm:text-4xl md:ml-[calc(14.71vw-2.625rem)] md:mt-[calc(7.2vw+1.5rem)]">
                <Link
                  href="/contact"
                  className="tap-area inline-flex items-center gap-3 border-b border-champagne pb-0.5 text-cloud transition hover:text-champagne"
                >
                  Write to the House <span aria-hidden="true">→</span>
                </Link>
              </h2>
            </div>

            <nav className="relative z-10 mt-10 grid grid-cols-2 gap-x-8 gap-y-8 pb-6 text-[13px] sm:grid-cols-3">
              {navColumns.map((col) => (
                <div key={col.heading} className="flex flex-col">
                  <p className="mb-1 text-[11px] uppercase tracking-[0.14em] text-cloud/60">
                    {col.heading}
                  </p>
                  {col.links.map((link) => (
                    <Link key={link.href} href={link.href} className="flex min-h-[44px] items-center text-cloud transition-colors hover:text-champagne">
                      {link.label}
                    </Link>
                  ))}
                  {col.heading === "Legal" && <CookieSettingsLink />}
                </div>
              ))}
            </nav>

            <div className="relative z-10 mt-10">
              <EmailSignup variant="footer" source="footer" />
            </div>

            <ul className="relative z-10 mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-cloud/15 pt-6 text-[10px] uppercase tracking-[0.12em] text-cloud/65">
              {trustBadges.map((badge) => (
                <li key={badge} className="flex items-center gap-2">
                  <span className="inline-block h-1 w-1 rounded-full bg-champagne" aria-hidden="true" />
                  {badge}
                </li>
              ))}
            </ul>
          </div>

          {/* The heading above starts just past the L of the wordmark (the word spans
              39.91vw from its left edge; L ends 14.71vw - 0.625rem into the red
              card) and sits just under the letters (0.8em below the word's top). */}
          {/* Engraved wordmark — one word, two tonal treatments split at the
              card boundary. Positioned so the R (2.8em from the word's left edge,
              em = 9vw) is centred on the seam between the cards: seam =
              (100% - gap) / 3 + gap / 2, and the tints switch exactly there. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-20 hidden overflow-hidden md:block"
          >
            <p
              className="absolute left-[calc((100%-1.25rem)/3+0.625rem-25.2vw)] top-14 whitespace-nowrap font-serif text-[9vw] leading-none tracking-tight text-transparent"
              style={{
                WebkitTextStroke: "1px rgba(214,197,160,0.5)",
                clipPath: "inset(0 calc(100% - 25.2vw) 0 0)",
              }}
            >
              CHIAREL
            </p>
            <p
              className="absolute left-[calc((100%-1.25rem)/3+0.625rem-25.2vw)] top-14 whitespace-nowrap font-serif text-[9vw] leading-none tracking-tight text-transparent"
              style={{
                WebkitTextStroke: "1px rgba(240,242,235,0.4)",
                clipPath: "inset(0 0 0 25.2vw)",
              }}
            >
              CHIAREL
            </p>
          </div>

          {/* Below md the cards stack, so the wordmark sits on the seam: top half
              on the green card, bottom half on the red (left card is 280px,
              gap 4px, split at the optical middle of the capitals). */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 overflow-hidden md:hidden">
            <p
              className="wordmark-seam-top absolute left-0 top-[calc(282px-5.75vw)] w-full whitespace-nowrap pl-[0.3em] text-center font-serif text-[12.5vw] leading-none tracking-[0.3em] text-transparent"
              style={{ WebkitTextStroke: "1px rgba(214,197,160,0.6)" }}
            >
              CHIAREL
            </p>
            <p
              className="wordmark-seam-bottom absolute left-0 top-[calc(282px-5.75vw)] w-full whitespace-nowrap pl-[0.3em] text-center font-serif text-[12.5vw] leading-none tracking-[0.3em] text-transparent"
              style={{ WebkitTextStroke: "1px rgba(240,242,235,0.5)" }}
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
