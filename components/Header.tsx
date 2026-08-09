"use client";

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
  "Hurry — the Founding 100 is closing fast",
  "Half price, full refund when you share your result",
  "Only 100 places, then it’s gone",
  "See the terms →",
];

function TickerHalf() {
  return (
    <span className="flex shrink-0 items-center text-[11px] uppercase tracking-[0.16em]">
      {tickerMessages.map((msg, i) => (
        <span key={i} className="flex items-center gap-3 px-3">
          {msg}
          <span className="text-ivory/50">·</span>
        </span>
      ))}
    </span>
  );
}

export default function Header() {
  const { count, open } = useCart();
  return (
    <header className="site-header sticky top-0 z-50 border-b border-ink/10">
      <Link
        href="/founding-100"
        aria-label="The Founding 100 is open — half price, full refund when you share your result. See the terms."
        className="block overflow-hidden whitespace-nowrap bg-ochre py-2 text-ivory transition hover:opacity-90"
      >
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
      </div>
    </header>
  );
}
