import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { track, trackPurchaseOnce, __resetAnalyticsForTests, PURCHASE_DEDUPE_KEY } from "@/lib/analytics";
import { CONSENT_STORAGE_KEY, readConsent, writeConsent } from "@/lib/consent";
import { getMeasurementId } from "@/lib/analytics-config";
import Analytics from "@/components/Analytics";
import CookieSettingsLink from "@/components/CookieSettingsLink";

function makeStorage(initial: Record<string, string> = {}, throws = false) {
  const data = { ...initial };
  return {
    getItem: (k: string) => {
      if (throws) throw new Error("blocked");
      return k in data ? data[k] : null;
    },
    setItem: (k: string, v: string) => {
      if (throws) throw new Error("blocked");
      data[k] = v;
    },
  };
}

const purchase = {
  transaction_id: "order_1",
  currency: "USD" as const,
  value: 100,
  shipping: 0,
  items: [{ item_id: "x", item_name: "X", price: 100, quantity: 1 }],
};

let gtag: ReturnType<typeof vi.fn>;
function setWindow(opts: { consent?: string; withGtag?: boolean; throws?: boolean } = {}) {
  gtag = vi.fn();
  const storage = makeStorage(opts.consent ? { [CONSENT_STORAGE_KEY]: opts.consent } : {}, opts.throws);
  vi.stubGlobal("window", {
    localStorage: storage,
    gtag: opts.withGtag === false ? undefined : gtag,
    dispatchEvent: vi.fn(),
  });
  return storage;
}

beforeEach(() => __resetAnalyticsForTests());
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("track consent gating", () => {
  it("sends when configured and consent granted", () => {
    setWindow({ consent: "granted" });
    track("email_signup", { source: "t" });
    expect(gtag).toHaveBeenCalledWith("event", "email_signup", { source: "t" });
  });
  it("does nothing without a stored choice", () => {
    setWindow();
    track("email_signup", { source: "t" });
    expect(gtag).not.toHaveBeenCalled();
  });
  it("does nothing when declined", () => {
    setWindow({ consent: "denied" });
    track("email_signup", { source: "t" });
    expect(gtag).not.toHaveBeenCalled();
  });
  it("is a no-op when analytics is not configured (no window.gtag)", () => {
    setWindow({ consent: "granted", withGtag: false });
    expect(() => track("email_signup", { source: "t" })).not.toThrow();
  });
  it("is a no-op on the server (no window)", () => {
    expect(() => track("email_signup", { source: "t" })).not.toThrow();
  });
  it("treats blocked storage as no consent", () => {
    setWindow({ consent: "granted", throws: true });
    expect(readConsent()).toBeNull();
    track("email_signup", { source: "t" });
    expect(gtag).not.toHaveBeenCalled();
  });
  it("writeConsent survives blocked storage", () => {
    setWindow({ throws: true });
    expect(() => writeConsent("granted")).not.toThrow();
  });
});

describe("trackPurchaseOnce", () => {
  it("sends once per order id, even across repeated calls", () => {
    setWindow({ consent: "granted" });
    expect(trackPurchaseOnce(purchase)).toBe(true);
    expect(trackPurchaseOnce(purchase)).toBe(false);
    expect(gtag).toHaveBeenCalledTimes(1);
  });
  it("dedupes across page loads via storage", () => {
    const storage = setWindow({ consent: "granted" });
    trackPurchaseOnce(purchase);
    expect(storage.getItem(PURCHASE_DEDUPE_KEY)).toContain("order_1");
    __resetAnalyticsForTests(); // simulate a reload
    expect(trackPurchaseOnce(purchase)).toBe(false);
    expect(gtag).toHaveBeenCalledTimes(1);
  });
  it("sends different orders", () => {
    setWindow({ consent: "granted" });
    trackPurchaseOnce(purchase);
    trackPurchaseOnce({ ...purchase, transaction_id: "order_2" });
    expect(gtag).toHaveBeenCalledTimes(2);
  });
  it("does not burn the dedupe slot without consent", () => {
    setWindow();
    expect(trackPurchaseOnce(purchase)).toBe(false);
    setWindow({ consent: "granted" });
    expect(trackPurchaseOnce(purchase)).toBe(true);
  });
});

describe("configuration no-ops", () => {
  it("getMeasurementId is null when unset, malformed, or staging", () => {
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "");
    expect(getMeasurementId()).toBeNull();
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "not-an-id");
    expect(getMeasurementId()).toBeNull();
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-ABCD1234");
    expect(getMeasurementId()).toBe("G-ABCD1234");
    vi.stubEnv("APP_ENV", "staging");
    expect(getMeasurementId()).toBeNull();
  });
  it("Analytics and CookieSettingsLink render nothing when unset", () => {
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "");
    expect(Analytics()).toBeNull();
    expect(CookieSettingsLink()).toBeNull();
  });
  it("Analytics renders when configured, but not on staging", () => {
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-ABCD1234");
    expect(Analytics()).not.toBeNull();
    expect(CookieSettingsLink()).not.toBeNull();
    vi.stubEnv("APP_ENV", "staging");
    expect(Analytics()).toBeNull();
    expect(CookieSettingsLink()).toBeNull();
  });
  it("bootstrap sets Consent Mode v2 defaults to denied", () => {
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-ABCD1234");
    const html = JSON.stringify(Analytics());
    expect(html).toContain("analytics_storage:'denied'");
    expect(html).toContain("ad_storage:'denied'");
  });
});
