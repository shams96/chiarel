"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { computeUnitPrice, type CartMode } from "@/lib/pricing";
import { track } from "@/lib/analytics";

export type { CartMode };

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
  product: { slug: string; price: { subscription: number; oneTime: number } },
  mode: CartMode
): number {
  return computeUnitPrice(product.price.subscription, product.price.oneTime, mode, product.slug);
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
  /** Switches a line to another plan, keeping its quantity. Unlike add(), it does not open the drawer. */
  changePlan: (slug: string, mode: CartMode) => Promise<void>;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  count: number;
  subtotal: number;
  savings: number;
  loading: boolean;
  /** True while a quantity or plan change is in flight; controls should be disabled. */
  updating: boolean;
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
  const [updating, setUpdating] = useState(false);

  // Every fetch below is wrapped in try/catch: `fetch` itself rejects (not
  // just resolves with a non-ok response) on a real network failure — a
  // dropped connection, a sleeping serverless function waking up, a dev
  // server restart — and an uncaught rejection here crashes the whole page
  // to Next's unhandled-runtime-error overlay for what's really just a
  // transient network blip. Failing silently (leaving cart state as it was)
  // is the honest behavior: the action didn't happen, nothing changed.
  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) setData(await res.json());
    } catch {
      // Network failure — leave existing cart state as-is.
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  // One add at a time: a fresh visitor with no cart cookie yet would otherwise
  // mint a cart on each of two rapid clicks, and the last cookie would win.
  const adding = useRef(false);

  const add: CartContextValue["add"] = async (slug, mode) => {
    if (adding.current) return;
    adding.current = true;
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, mode }),
      });
      if (res.ok) {
        const next: CartApiResponse = await res.json();
        setData(next);
        const line = next.lines.find((l) => l.slug === slug && l.mode === mode);
        if (line) {
          track("add_to_cart", {
            currency: "USD",
            value: line.unitPrice,
            items: [{ item_id: slug, item_name: line.product.name, price: line.unitPrice, quantity: 1 }],
          });
        }
      }
      setIsOpen(true);
    } catch {
      // Network failure — the item wasn't added; cart state is unchanged.
    } finally {
      adding.current = false;
    }
  };

  const remove: CartContextValue["remove"] = async (slug) => {
    const line = data.lines.find((l) => l.slug === slug);
    if (!line) return;
    try {
      const res = await fetch(`/api/cart/${line.id}`, { method: "DELETE" });
      if (res.ok) setData(await res.json());
    } catch {
      // Network failure — the item wasn't removed; cart state is unchanged.
    }
  };

  const setQty: CartContextValue["setQty"] = async (lineId, qty) => {
    if (qty < 1 || updating) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/cart/${lineId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qty }),
      });
      if (res.ok) setData(await res.json());
    } catch {
      // Network failure — the quantity wasn't changed; cart state is unchanged.
    } finally {
      setUpdating(false);
    }
  };

  const changePlan: CartContextValue["changePlan"] = async (slug, mode) => {
    const line = data.lines.find((l) => l.slug === slug);
    if (!line || line.mode === mode || updating) return;
    setUpdating(true);
    try {
      // PATCH sets the plan outright (idempotent); POST would add a unit if a
      // stale client asked for the plan the server already holds.
      const res = await fetch(`/api/cart/${line.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      if (res.ok) {
        setData(await res.json());
        track("subscribe_toggle", { item_id: slug, plan: mode });
      }
    } catch {
      // Network failure — the plan wasn't changed; cart state is unchanged.
    } finally {
      setUpdating(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        lines: data.lines,
        add,
        remove,
        setQty,
        changePlan,
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        count: data.count,
        subtotal: data.subtotal,
        savings: data.savings,
        loading,
        updating,
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
