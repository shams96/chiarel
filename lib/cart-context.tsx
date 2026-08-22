"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type CartMode = "ninetyDay" | "subscription" | "oneTime";

export type CartLine = {
  id: string;
  slug: string;
  mode: CartMode;
  qty: number;
  unitPrice: number;
  product: { name: string; image: string; descriptor: string };
};

/** Kept for callers that price a product client-side before it's in the cart (e.g. PDP tier previews). */
export function unitPrice(
  product: { price: { subscription: number; oneTime: number } },
  mode: CartMode
): number {
  if (mode === "ninetyDay") return product.price.subscription * 2;
  return mode === "subscription"
    ? product.price.subscription
    : product.price.oneTime;
}

type CartApiResponse = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  savings: number;
};

type CartContextValue = {
  lines: CartLine[];
  add: (slug: string, mode: CartMode) => Promise<void>;
  remove: (slug: string) => Promise<void>;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  count: number;
  subtotal: number;
  savings: number;
  loading: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CartApiResponse>({
    lines: [],
    count: 0,
    subtotal: 0,
    savings: 0,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/cart");
    if (res.ok) setData(await res.json());
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const add: CartContextValue["add"] = async (slug, mode) => {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, mode }),
    });
    if (res.ok) setData(await res.json());
    setIsOpen(true);
  };

  const remove: CartContextValue["remove"] = async (slug) => {
    const line = data.lines.find((l) => l.slug === slug);
    if (!line) return;
    const res = await fetch(`/api/cart/${line.id}`, { method: "DELETE" });
    if (res.ok) setData(await res.json());
  };

  return (
    <CartContext.Provider
      value={{
        lines: data.lines,
        add,
        remove,
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        count: data.count,
        subtotal: data.subtotal,
        savings: data.savings,
        loading,
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
