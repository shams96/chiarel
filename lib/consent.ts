// Cookie/analytics consent state. Opt-in required in every region (one code
// path, strictest rule): until a visitor explicitly accepts, nothing
// non-essential loads. Stored in localStorage only; every access is wrapped
// because storage can throw (private mode, blocked site data) — in that case
// consent reads as "unset" and analytics simply stays off.

export type ConsentChoice = "granted" | "denied";

export const CONSENT_STORAGE_KEY = "chiarel_consent_v1";
export const CONSENT_CHANGE_EVENT = "chiarel:consent-change";
export const CONSENT_OPEN_EVENT = "chiarel:consent-open";

export function readConsent(): ConsentChoice | null {
  try {
    const v = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function writeConsent(choice: ConsentChoice): void {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // Storage unavailable — the choice still applies for this page view via the event below.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: choice }));
}

/** Reopens the banner (footer "Cookie settings" link). */
export function openConsentSettings(): void {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}
