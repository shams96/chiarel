"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

// Fires view_item once per mount of a product page. Renders nothing.
export default function TrackViewItem({
  slug,
  name,
  price,
}: {
  slug: string;
  name: string;
  price: number;
}) {
  useEffect(() => {
    track("view_item", {
      currency: "USD",
      value: price,
      items: [{ item_id: slug, item_name: name, price }],
    });
  }, [slug, name, price]);
  return null;
}
