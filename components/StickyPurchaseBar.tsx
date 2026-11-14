"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCart } from "@/lib/cart-context";
import { PURCHASE_CTA_ID } from "@/components/PurchaseOptions";
import { useSelectedTier } from "@/lib/pdp-plan";
import { addCtaLabel, tierToMode } from "@/lib/plan-labels";
import { purchaseOptionSummary } from "@/lib/pricing";

export default function StickyPurchaseBar({
  slug,
  name,
  image,
  subscriptionPrice,
  oneTimePrice,
}: {
  slug: string;
  name: string;
  image: string;
  subscriptionPrice: number;
  oneTimePrice: number;
}) {
  const [visible, setVisible] = useState(false);
  const { add } = useCart();
  // Follows the plan chosen in the purchase options above, so the button adds
  // what the page is showing, not always a subscription.
  const tier = useSelectedTier(slug);
  const summary = purchaseOptionSummary(slug, subscriptionPrice, oneTimePrice);
  const priceLine =
    tier === "single"
      ? `$${summary.subscription.perDelivery} / delivery · subscribe`
      : tier === "oneTime"
        ? `$${summary.oneTime.price} · one-time`
        : `$${summary.ritual.total} · 90 days, paid once`;

  // Show the bar only once the page's own "Begin the Ritual" button has
  // scrolled up out of view (not while it is on screen, and not before the
  // visitor has reached it). Falls back to a scroll threshold if the button
  // or IntersectionObserver is unavailable.
  useEffect(() => {
    const cta = document.getElementById(PURCHASE_CTA_ID);
    if (!cta || typeof IntersectionObserver === "undefined") {
      const onScroll = () => setVisible(window.scrollY > 620);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(cta);
    return () => observer.disconnect();
  }, []);

  const reduce = useReducedMotion();
  const off = reduce ? 0 : 96;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: off, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: off, opacity: 0 }}
          transition={{ duration: reduce ? 0.01 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-ivory/95 px-margin py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur"
        >
          <div className="mx-auto flex max-w-container items-center gap-3 sm:gap-4">
            <div className="relative hidden h-12 w-12 shrink-0 min-[400px]:block overflow-hidden bg-cloud/50">
              <Image src={image} alt={name} fill sizes="48px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-medium leading-tight">{name}</p>
              <p className="text-[12px] leading-snug text-ink" aria-live="polite">
                {priceLine}
              </p>
            </div>
            <button
              onClick={() => add(slug, tierToMode(tier))}
              className="btn-press min-h-[44px] shrink-0 whitespace-nowrap bg-ink px-4 sm:px-6 text-[12px] uppercase tracking-[0.2em] text-ivory transition hover:bg-ochre"
            >
              {addCtaLabel(tier)}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
