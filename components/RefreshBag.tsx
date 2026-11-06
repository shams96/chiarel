"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart-context";

// The order page empties the bag on the server once payment is confirmed. The
// header count and drawer live in the browser, so this re-reads the bag; without
// it they keep showing the items just bought until the next full reload.
export default function RefreshBag() {
  const { refresh } = useCart();
  useEffect(() => {
    void refresh();
  }, [refresh]);
  return null;
}
