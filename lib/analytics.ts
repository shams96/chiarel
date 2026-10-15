import { readConsent } from "@/lib/consent";

// Provider-agnostic event API. Callers use track(); only this file knows the
// provider is GA4. track() is a safe no-op unless (a) analytics is configured
// (the root layout installed window.gtag) and (b) the visitor opted in.

export type AnalyticsItem = {
  item_id: string;
  item_name: string;
  price?: number;
  quantity?: number;
};

export type AnalyticsEvents = {
  view_item: { currency: "USD"; value: number; items: AnalyticsItem[] };
  add_to_cart: { currency: "USD"; value: number; items: AnalyticsItem[] };
  begin_checkout: { currency: "USD"; value: number; items: AnalyticsItem[] };
  purchase: {
    transaction_id: string;
    currency: "USD";
    value: number;
    shipping: number;
    items: AnalyticsItem[];
  };
  subscribe_toggle: { item_id: string; plan: string };
  email_signup: { source: string };
  assessment_complete: { recommended: string[] };
};

export type AnalyticsEventName = keyof AnalyticsEvents;

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    gtag?: Gtag;
    dataLayer?: unknown[];
  }
}

export function track<E extends AnalyticsEventName>(event: E, params: AnalyticsEvents[E]): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return; // not configured / staging
  if (readConsent() !== "granted") return; // opt-in required
  try {
    window.gtag("event", event, params);
  } catch {
    // Analytics must never break the page.
  }
}

export const PURCHASE_DEDUPE_KEY = "chiarel_purchases_tracked";
const sentThisPage = new Set<string>();

/**
 * Sends `purchase` at most once per order id — across re-renders, reloads, and
 * revisits of the confirmation URL. Only marks the order as sent when the
 * event was actually eligible to send (configured + consented), so an order
 * viewed before opting in isn't permanently suppressed.
 */
export function trackPurchaseOnce(params: AnalyticsEvents["purchase"]): boolean {
  if (typeof window === "undefined") return false;
  if (typeof window.gtag !== "function" || readConsent() !== "granted") return false;
  const id = params.transaction_id;
  if (sentThisPage.has(id)) return false;
  let seen: string[] = [];
  try {
    const raw = window.localStorage.getItem(PURCHASE_DEDUPE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) seen = parsed.filter((x): x is string => typeof x === "string");
  } catch {
    // unreadable — fall back to the in-memory guard only
  }
  if (seen.includes(id)) return false;
  sentThisPage.add(id);
  track("purchase", params);
  try {
    window.localStorage.setItem(PURCHASE_DEDUPE_KEY, JSON.stringify([...seen, id].slice(-50)));
  } catch {
    // ignore
  }
  return true;
}

/** Test hook: clears the in-memory dedupe guard. */
export function __resetAnalyticsForTests(): void {
  sentThisPage.clear();
}
