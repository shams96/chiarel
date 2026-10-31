"use client";

import { useRef, useState } from "react";
import { productHref } from "@/lib/products";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useDialog } from "@/lib/use-dialog";

const nav = [
  { href: "/shop", label: "Shop" },
  { href: productHref("n1-neck-decollete"), label: "Clarity Neck & Décolleté Crème" },
  { href: "/ritual", label: "The Ritual" },
  { href: "/science", label: "The Science" },
  { href: "/house", label: "The House" },
  { href: "/journal", label: "Journal" },
  { href: "/account", label: "Account" },
];

export default function Header() {
  const { count, open } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLElement>(null);
  useDialog(menuOpen, menuRef, () => setMenuOpen(false));
  return (
    <>
      <header className="site-header sticky top-0 z-50 overflow-x-hidden border-b border-ink/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex min-h-[44px] shrink-0 items-center" aria-label="CHIAREL, The House of Clarity">
          {/* The wordmark with the House line needs about 210px to stay legible, so
              anything narrower than a desktop header gets the wordmark alone. Files: public/assets/brand/logo. */}
          <Image
            src="/assets/brand/logo/chiarel-header-wordmark-ink-v2.png"
            alt="CHIAREL"
            width={450}
            height={72}
            priority
            className="h-auto w-[150px] shrink-0 lg:hidden"
          />
          <Image
            src="/assets/brand/logo/chiarel-header-house-ink-v2.png"
            alt="CHIAREL, The House of Clarity"
            width={630}
            height={157}
            priority
            className="hidden h-auto w-[210px] shrink-0 lg:block"
          />
        </Link>
        <nav className="hidden gap-3 md:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="inline-flex min-h-[44px] items-center px-2 text-[12px] uppercase tracking-[0.18em] text-ink/80 transition hover:text-ochre"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1 sm:gap-3">
          {/* Mobile: direct path to Shop without opening the menu */}
          <Link
            href="/shop"
            className="btn-press inline-flex min-h-[44px] items-center px-2 text-[12px] uppercase tracking-[0.18em] text-ink/80 transition hover:text-ochre md:hidden"
          >
            Shop
          </Link>
          <button
            onClick={open}
            aria-label={count > 0 ? `Open bag, ${count} items` : "Open bag"}
            className="btn-press relative inline-flex min-h-[44px] items-center px-2 text-[12px] uppercase tracking-[0.18em] text-ink/80 transition hover:text-ochre"
          >
            Bag
            {count > 0 && (
              <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-ochre px-1 text-[10px] text-ivory">
                {count}
              </span>
            )}
          </button>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="btn-press relative flex h-11 w-11 flex-col items-center justify-center gap-1.5 md:hidden"
          >
            <span
              className={`block h-px w-5 bg-ink transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                menuOpen ? "translate-y-[3.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-px w-5 bg-ink transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                menuOpen ? "-translate-y-[3.5px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>
    </header>
      {/* Rendered outside <header> deliberately: .site-header has
          backdrop-filter (see globals.css), which establishes a new
          containing block for position:fixed descendants — a fixed-position
          menu panel nested inside it resolves "fixed" against the header's
          own box instead of the viewport, collapsing the overlay into a
          small box pinned near the top instead of a full-height panel. */}
      <div
        className={`fixed inset-0 z-[80] bg-ink/40 transition-opacity md:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
      <aside
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        id="mobile-menu"
        className={`cart-panel fixed right-0 top-0 z-[90] flex h-full w-full max-w-xs flex-col bg-ivory transition-transform md:hidden ${
          menuOpen ? "translate-x-0 shadow-2xl" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
          <span className="font-serif text-xl tracking-[0.25em]">MENU</span>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="btn-press flex h-11 w-11 items-center justify-center text-xl text-ink/65 transition-colors hover:text-ink"
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
    </>
  );
}
