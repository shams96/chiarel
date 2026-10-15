"use client";

import { useCallback, useEffect, useState } from "react";
import Script from "next/script";
import {
  CONSENT_CHANGE_EVENT,
  CONSENT_OPEN_EVENT,
  readConsent,
  writeConsent,
  type ConsentChoice,
} from "@/lib/consent";

// Mounted only when a GA4 measurement id is configured (see
// components/Analytics.tsx). Loads gtag.js ONLY after the visitor accepts;
// declining (or never answering) loads nothing. Consent Mode v2 defaults are
// set inline in the layout (everything denied) before this ever runs.
//
// Accept and Decline are deliberately identical in size, weight and
// prominence — declining is as easy as accepting.
export default function AnalyticsProvider({ measurementId }: { measurementId: string }) {
  const [consent, setConsent] = useState<ConsentChoice | null>(null);
  const [ready, setReady] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(false);

  useEffect(() => {
    const stored = readConsent();
    setConsent(stored);
    setBannerOpen(stored === null);
    setReady(true);

    const onChange = (e: Event) => setConsent((e as CustomEvent<ConsentChoice>).detail);
    const onOpen = () => setBannerOpen(true);
    window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
    window.addEventListener(CONSENT_OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
      window.removeEventListener(CONSENT_OPEN_EVENT, onOpen);
    };
  }, []);

  // Keep Google Consent Mode in sync with the choice. Ads signals stay denied
  // always — this site only uses measurement.
  useEffect(() => {
    if (!ready || !window.gtag) return;
    window.gtag("consent", "update", {
      analytics_storage: consent === "granted" ? "granted" : "denied",
    });
    if (consent !== "granted") clearGaCookies();
  }, [consent, ready]);

  const choose = useCallback((choice: ConsentChoice) => {
    writeConsent(choice);
    setBannerOpen(false);
  }, []);

  return (
    <>
      {consent === "granted" && (
        <Script
          id="ga4-loader"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        />
      )}
      {bannerOpen && (
        <div
          role="dialog"
          aria-label="Cookie preferences"
          className="fixed inset-x-0 bottom-0 z-[9990] border-t border-ink/15 bg-cloud px-4 py-5 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] sm:px-6"
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
            <p className="text-[13px] leading-relaxed text-ink/75">
              We use analytics cookies to understand how the site is used. They
              stay off unless you accept. Essential cookies (your bag) are always
              on. See our{" "}
              <a href="/privacy" className="border-b border-ochre pb-0.5 text-ochre">
                Privacy Policy
              </a>
              .
            </p>
            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={() => choose("denied")}
                className="min-h-[44px] flex-1 border border-ink px-6 sm:min-w-[8rem] py-3 text-[12px] uppercase tracking-[0.2em] text-ink transition hover:border-ochre hover:text-ochre sm:flex-none"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={() => choose("granted")}
                className="min-h-[44px] flex-1 border border-ink px-6 sm:min-w-[8rem] py-3 text-[12px] uppercase tracking-[0.2em] text-ink transition hover:border-ochre hover:text-ochre sm:flex-none"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function clearGaCookies() {
  try {
    const host = window.location.hostname;
    const parts = host.split(".");
    const domains = [host, parts.length > 1 ? `.${parts.slice(-2).join(".")}` : host];
    document.cookie
      .split(";")
      .map((c) => c.split("=")[0].trim())
      .filter((n) => n === "_ga" || n.startsWith("_ga_") || n === "_gid")
      .forEach((n) => {
        domains.forEach((d) => {
          document.cookie = `${n}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${d}`;
        });
        document.cookie = `${n}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      });
  } catch {
    // ignore
  }
}
