"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";

const nav = [
  { href: "/ritual", label: "The Ritual" },
  { href: "/shop", label: "Shop" },
  { href: "/science", label: "The Science" },
  { href: "/house", label: "The House" },
  { href: "/journal", label: "Journal" },
  { href: "/account", label: "Account" },
];

const tickerMessages = [
  <>
    <span className="text-ochre">Hurry</span> — the Founding 100 is closing fast
  </>,
  "The 90-Day Ritual, half price. We return the rest.",
  "Only 100 places, then it’s gone",
  <span className="text-ochre">See the terms →</span>,
];

function TickerHalf() {
  return (
    <span className="flex shrink-0 items-center text-[11px] font-medium uppercase tracking-[0.16em]">
      {tickerMessages.map((msg, i) => (
        <span key={i} className="flex items-center gap-3 px-3">
          {msg}
          <span className="text-champagne/40">·</span>
        </span>
      ))}
    </span>
  );
}

export default function Header() {
  const { count, open } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="site-header sticky top-0 z-50 border-b border-ink/10">
      <Link
        href="/founding-100"
        aria-label="The Founding 100 is open — the 90-Day Ritual at half price. Complete it and we return the rest. See the terms."
        className="relative flex items-center gap-2 overflow-hidden whitespace-nowrap border-b border-champagne/30 bg-ink py-2.5 text-champagne transition hover:bg-ink/90"
      >
        <span className="ml-4 flex shrink-0 items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ochre opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-ochre" />
          </span>
        </span>
        <div className="marquee-track flex w-max">
          <TickerHalf />
          <TickerHalf />
        </div>
      </Link>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex flex-col leading-none">
          <span className="font-serif text-2xl tracking-[0.35em] text-ink">
            CHIAREL
          </span>
          <span className="mt-1 text-[9px] uppercase tracking-[0.28em] text-ochre">
            House of Skin Intelligence™
          </span>
        </Link>
        <nav className="hidden gap-7 md:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-[12px] uppercase tracking-[0.18em] text-ink/80 transition hover:text-ochre"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-5">
          <button
            onClick={open}
            aria-label="Open cart"
            className="relative text-[12px] uppercase tracking-[0.18em] text-ink/80 transition hover:text-ochre"
          >
            Bag
            {count > 0 && (
              <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-ochre px-1 text-[10px] text-ivory">
                {count}
              </span>
            )}
          </button>
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 md:hidden"
          >
            <span className="block h-px w-5 bg-ink" />
            <span className="block h-px w-5 bg-ink" />
          </button>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-[80] bg-ink/40 transition-opacity md:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMenuOpen(false)}
      />
      <aside
        id="mobile-menu"
        className={`cart-panel fixed right-0 top-0 z-[90] flex h-full w-full max-w-xs flex-col bg-ivory shadow-2xl transition-transform md:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
          <span className="font-serif text-xl tracking-[0.25em]">MENU</span>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="flex h-11 w-11 items-center justify-center text-xl text-ink/50 hover:text-ink"
          >
            ×
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-6 py-6">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setMenuOpen(false)}
              className="border-b border-ink/10 py-4 text-[13px] uppercase tracking-[0.18em] text-ink/80 transition hover:text-ochre"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </aside>
    </header>
  );
}
