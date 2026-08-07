"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getProduct } from "@/lib/products";

export type CartLine = {
  slug: string;
  mode: "subscription" | "oneTime";
  qty: number;
};

type CartContextValue = {
  lines: CartLine[];
  add: (slug: string, mode: "subscription" | "oneTime") => void;
  remove: (slug: string) => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  count: number;
  subtotal: number;
  savings: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "chiarel-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const add: CartContextValue["add"] = (slug, mode) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.slug === slug);
      if (existing) {
        return prev.map((l) =>
          l.slug === slug ? { ...l, mode, qty: l.qty + 1 } : l
        );
      }
      return [...prev, { slug, mode, qty: 1 }];
    });
    setIsOpen(true);
  };

  const remove: CartContextValue["remove"] = (slug) => {
    setLines((prev) => prev.filter((l) => l.slug !== slug));
  };

  let subtotal = 0;
  let savings = 0;
  for (const line of lines) {
    const p = getProduct(line.slug);
    if (!p) continue;
    const unit =
      line.mode === "subscription" ? p.price.subscription : p.price.oneTime;
    subtotal += unit * line.qty;
    savings += (p.price.oneTime - unit) * line.qty;
  }

  return (
    <CartContext.Provider
      value={{
        lines,
        add,
        remove,
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        count: lines.reduce((n, l) => n + l.qty, 0),
        subtotal,
        savings,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
