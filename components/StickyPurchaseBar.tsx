"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useCart } from "@/lib/cart-context";

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
  const { scrollY } = useScroll();
  const { add } = useCart();

  useMotionValueEvent(scrollY, "change", (y) => setVisible(y > 620));

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 96, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 96, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-ivory/95 px-6 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur"
        >
          <div className="mx-auto flex max-w-6xl items-center gap-4">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-sm bg-cloud/50">
              <Image src={image} alt={name} fill sizes="48px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{name}</p>
              <p className="text-[12px] text-ink/50">
                ${subscriptionPrice} with subscription
              </p>
            </div>
            <button
              onClick={() => add(slug, "subscription")}
              className="btn-press whitespace-nowrap bg-ink px-6 py-2.5 text-[11px] uppercase tracking-[0.2em] text-ivory transition hover:bg-ochre"
            >
              Add to Bag
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
