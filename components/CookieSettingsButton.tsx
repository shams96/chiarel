"use client";

import { openConsentSettings } from "@/lib/consent";

export default function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={openConsentSettings}
      className="flex min-h-[44px] items-center text-left text-cloud transition-colors hover:text-champagne"
    >
      Cookie settings
    </button>
  );
}
