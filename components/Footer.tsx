import Link from "next/link";

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
          </div>
        </div>
        <p className="mt-10 text-[11px] text-ink/50">
          © {new Date().getFullYear()} CHIAREL™ · 1HubSolutions, LLC. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
