"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCart } from "@/lib/cart-context";
import { PURCHASE_CTA_ID } from "@/components/PurchaseOptions";

export default function StickyPurchaseBar({
  slug,
  name,
  image,
  subscriptionPrice,
}: {
  slug: string;
  name: string;
  image: string;
  subscriptionPrice: number;
}) {
  const [visible, setVisible] = useState(false);
  const { add } = useCart();

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
          <div className="mx-auto flex max-w-container items-center gap-4">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-cloud/50">
              <Image src={image} alt={name} fill sizes="48px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{name}</p>
              <p className="truncate text-[12px] text-ink/65">
                ${subscriptionPrice} / delivery · subscribe
              </p>
            </div>
            <button
              onClick={() => add(slug, "subscription")}
              className="btn-press whitespace-nowrap bg-ink px-6 py-2.5 text-[12px] uppercase tracking-[0.2em] text-ivory transition hover:bg-ochre"
            >
              Add to Bag
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
