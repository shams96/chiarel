import Link from "next/link";

const trustBadges = [
  "Complimentary shipping at $150",
  "90-Day Guarantee on your first order",
  "Secure checkout via Stripe",
  "Formulated by a pharmacist",
  "Made to order in Isola del Liri, Italy",
  "Every active ingredient disclosed",
];

export default function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-cloud/60">
      <div className="mx-auto max-w-6xl px-6 py-12 text-sm text-ink/70">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div>
            <p className="font-serif text-xl tracking-[0.3em] text-ink">CHIAREL</p>
            <p className="mt-2 max-w-xs text-[13px]">
              House of Skin Intelligence™ · Advancing Cellular Clarity™
            </p>
            <p className="mt-4 text-[12px]">
              Isola del Liri · Roma, Italia — crafted with Natural You Srl
            </p>
          </div>
          <div className="flex gap-12 text-[13px]">
            <div className="flex flex-col gap-2">
              <Link href="/ritual">The Ritual</Link>
              <Link href="/shop">Shop</Link>
              <Link href="/science">The Science</Link>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/house">The House</Link>
              <Link href="/journal">Journal</Link>
              <Link href="/account">Account</Link>
              <Link href="/press">Press</Link>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/contact">Contact</Link>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
            </div>
          </div>
        </div>

        <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-2 border-t border-ink/10 pt-6 text-[11px] uppercase tracking-[0.14em] text-ink/50">
          {trustBadges.map((badge) => (
            <li key={badge} className="flex items-center gap-2">
              <span className="inline-block h-1 w-1 rounded-full bg-ochre" aria-hidden="true" />
              {badge}
            </li>
          ))}
        </ul>

        <p className="mt-8 text-[11px] text-ink/50">
          © {new Date().getFullYear()} CHIAREL™ · 1HubSolutions, LLC. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
