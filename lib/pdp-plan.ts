import { useSyncExternalStore } from "react";
import type { Tier } from "@/lib/plan-labels";

// Which plan is selected on a product page, shared by the plan options and the
// sticky purchase bar so the bar adds what the visitor actually chose. Before
// this, the bar always added a subscription whatever the page showed.
//
// Per product slug, kept for the life of the tab (so coming back to a product
// keeps the choice). The server render and first client render both use the
// default, so hydration matches.

export const DEFAULT_TIER: Tier = "ninetyDay";

const selected = new Map<string, Tier>();
const listeners = new Set<() => void>();

export function getSelectedTier(slug: string): Tier {
  return selected.get(slug) ?? DEFAULT_TIER;
}

export function setSelectedTier(slug: string, tier: Tier): void {
  if (getSelectedTier(slug) === tier) return;
  selected.set(slug, tier);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSelectedTier(slug: string): Tier {
  return useSyncExternalStore(
    subscribe,
    () => getSelectedTier(slug),
    () => DEFAULT_TIER,
  );
}

/** Test helper: forget every selection. */
export function resetSelectedTiers(): void {
  selected.clear();
  listeners.forEach((l) => l());
}
