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
  setQty: (lineId: string, qty: number) => Promise<void>;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  count: number;
  subtotal: number;
  savings: number;
  loading: boolean;
  /** Re-syncs client state with the server cart — call after any change the
      add/remove helpers didn't make directly, e.g. after checkout clears the
      cart server-side, so the header/drawer don't keep showing stale counts. */
  refresh: () => Promise<void>;
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

  const setQty: CartContextValue["setQty"] = async (lineId, qty) => {
    if (qty < 1) return;
    const res = await fetch(`/api/cart/${lineId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qty }),
    });
    if (res.ok) setData(await res.json());
  };

  return (
    <CartContext.Provider
      value={{
        lines: data.lines,
        add,
        remove,
        setQty,
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        count: data.count,
        subtotal: data.subtotal,
        savings: data.savings,
        loading,
        refresh,
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
