"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

// The bag and checkout are single-purpose pages: the full site header
// (navigation to every other page) pulls people away from buying, so /cart and
// /checkout get a quiet header of their own (plan, Phase C: "stripped header ...
// on cart and checkout"). Footer is left as it is (owner rule). usePathname is
// available during SSR, so there is no flash of the full header.

function onCheckout(pathname: string | null): boolean {
  return pathname === "/checkout" || !!pathname?.startsWith("/checkout/");
}

function onBag(pathname: string | null): boolean {
  return pathname === "/cart";
}

function quiet(pathname: string | null): boolean {
  return onCheckout(pathname) || onBag(pathname);
}

export function HideOnCheckout({ children }: { children: React.ReactNode }) {
  return quiet(usePathname()) ? null : <>{children}</>;
}

export function CheckoutHeader() {
  const pathname = usePathname();
  if (!quiet(pathname)) return null;
  // From the bag the way out is back to the shop; from checkout it is back to the bag.
  const exit = onBag(pathname)
    ? { href: "/shop", label: "Continue shopping" }
    : { href: "/cart", label: "Back to bag" };
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
          href={exit.href}
          className="tap-area text-eyebrow uppercase text-ink/70 underline underline-offset-4 hover:text-ochre"
        >
          {exit.label}
        </Link>
      </div>
    </header>
  );
}
