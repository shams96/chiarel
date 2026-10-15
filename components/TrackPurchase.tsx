"use client";

import { useEffect } from "react";
import { trackPurchaseOnce, type AnalyticsEvents } from "@/lib/analytics";

// Fires purchase for a confirmed-paid order, deduped per order id. Renders nothing.
export default function TrackPurchase({ purchase }: { purchase: AnalyticsEvents["purchase"] }) {
  useEffect(() => {
    trackPurchaseOnce(purchase);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchase.transaction_id]);
  return null;
}
