"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Checkout is a single-purpose page: the full site header (navigation, search of
// other pages) pulls people away from paying, so /checkout gets a quiet header
// of its own. Footer is left as it is. usePathname is available during SSR, so
// there is no flash of the full header.

function onCheckout(pathname: string | null): boolean {
  return pathname === "/checkout" || !!pathname?.startsWith("/checkout/");
}

export function HideOnCheckout({ children }: { children: React.ReactNode }) {
  return onCheckout(usePathname()) ? null : <>{children}</>;
}

export function CheckoutHeader() {
  if (!onCheckout(usePathname())) return null;
  return (
    <header className="border-b border-ink/10">
      <div className="mx-auto flex w-full max-w-container items-center justify-between px-margin py-4">
        <Link href="/" className="flex min-h-[44px] shrink-0 items-center" aria-label="CHIAREL, The House of Clarity">
          <Image
            src="/assets/brand/logo/chiarel-header-wordmark-ink-v2.png"
            alt="CHIAREL"
            width={450}
            height={72}
            priority
            className="h-auto w-[150px] shrink-0"
          />
        </Link>
        <Link
          href="/cart"
          className="tap-area text-eyebrow uppercase text-ink/70 underline underline-offset-4 hover:text-ochre"
        >
          Back to bag
        </Link>
      </div>
    </header>
  );
}
