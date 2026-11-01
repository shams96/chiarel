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

// Two floating rounded cards (Formal Garden, Red Ochre) carry every footer
// element — nav, trust badges, contact CTA. One outlined "CHIAREL" wordmark
// crosses the seam between them as two clip-aligned copies of the same text,
// each tinted for its own background, so it reads as one engraved mark. It has
// a band of its own, reserved by padding on both cards, so it never sits behind
// copy. Side by side (md+) the word spans the full width and the card seam cuts
// through it; stacked (phones) it sits on the horizontal seam, top half on the
// green card and bottom half on the red. Sizes are container-query units
// (cqw of the grid below), so it scales evenly at every width.
// Wordmark: font 14cqw, tracked 0.35em to span ~100cqw. Glyph bottom sits at
// roughly 0.8em of its line box, which sets the reserved padding below.
export default function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-cloud">
      <div className="mx-auto w-full max-w-container px-margin py-14 sm:py-20">
        <div className="relative grid grid-cols-1 gap-1 [container-type:inline-size] md:grid-cols-[1fr_2fr] md:gap-5">
          {/* Left card — Formal Garden, product shot */}
          <div className="relative h-[280px] overflow-hidden rounded-[1.5rem] bg-garden md:h-auto md:min-h-[460px]">
            <div className="relative h-full w-full">
              <Image
                src="/assets/products/clarity-night-creme-jar.png"
                alt="Clarity Night Crème jar"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-contain object-bottom p-8 pb-[calc(2rem+7cqw)] md:pb-8 md:pt-[calc(2rem+12cqw)]"
              />
            </div>
          </div>

          {/* Right card — Red Ochre, all footer content */}
          <div className="relative flex min-h-[460px] flex-col justify-between overflow-hidden rounded-[1.5rem] bg-ochre p-8 pt-[calc(2rem+7cqw)] text-cloud sm:p-10 sm:pt-[calc(2.5rem+7cqw)] md:p-12 md:pt-[calc(2rem+12cqw+1.5rem)]">
            <div className="relative z-10">
              <h2 className="font-serif text-h3">
                <Link
                  href="/contact"
                  className="tap-area inline-flex min-h-[44px] items-center gap-3 border-b border-champagne pb-0.5 text-cloud transition hover:text-champagne"
                >
                  Write to the House <span aria-hidden="true">→</span>
                </Link>
              </h2>
            </div>

            <nav className="relative z-10 mt-10 grid grid-cols-2 gap-x-8 gap-y-8 text-[13px] sm:grid-cols-3">
              {navColumns.map((col) => (
                <div key={col.heading} className="flex flex-col">
                  <p className="mb-1 text-eyebrow uppercase text-cloud/70">
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

            <ul className="relative z-10 mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-cloud/15 pt-6 text-eyebrow uppercase text-cloud/75">
              {trustBadges.map((badge) => (
                <li key={badge} className="flex items-center gap-2">
                  <span className="inline-block h-1 w-1 rounded-full bg-champagne" aria-hidden="true" />
                  {badge}
                </li>
              ))}
            </ul>
          </div>

          {/* Engraved wordmark. md+: full-width band at the top of both cards,
              each copy clipped to its own card (left card = (100% - gap) / 3).
              Below md: on the seam between the stacked cards (left card is a
              fixed 280px tall, gap 4px), split at the optical middle of the
              capitals. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
            <p
              className="wordmark absolute left-0 top-[calc(282px-6.44cqw)] w-full whitespace-nowrap font-serif text-[14cqw] leading-none tracking-[0.35em] text-transparent md:top-8"
              style={{ WebkitTextStroke: "1px rgba(214,197,160,0.6)" }}
              data-tone="garden"
            >
              CHIAREL
            </p>
            <p
              className="wordmark absolute left-0 top-[calc(282px-6.44cqw)] w-full whitespace-nowrap font-serif text-[14cqw] leading-none tracking-[0.35em] text-transparent md:top-8"
              style={{ WebkitTextStroke: "1px rgba(240,242,235,0.5)" }}
              data-tone="ochre"
            >
              CHIAREL
            </p>
          </div>
        </div>

        <p className="mt-8 text-[12px] text-ink/65">
          © {new Date().getFullYear()} CHIAREL™ · 1HubSolutions, LLC. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
