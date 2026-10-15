"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { CONSENT_TEXT } from "@/lib/email-consent";
import { track } from "@/lib/analytics";

type Props = {
  /** "inline" sits on cloud/ivory page backgrounds; "footer" is for the dark ochre/garden footer panel. */
  variant?: "inline" | "footer";
  /** Where the signup happened, stored with the subscriber (a-z, 0-9, - and _). */
  source: string;
  heading?: string;
  blurb?: string;
};

type Status = "idle" | "loading" | "success" | "error";

export default function EmailSignup({
  variant = "inline",
  source,
  heading = "Be first to know",
  blurb = "Occasional notes from the House.",
}: Props) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const dark = variant === "footer";
  const text = dark ? "text-cloud" : "text-ink";
  const muted = dark ? "text-cloud/75" : "text-ink/70";
  const field = dark
    ? "border-cloud/40 bg-transparent text-cloud placeholder:text-cloud/60 focus:border-champagne"
    : "border-ink/20 bg-white text-ink placeholder:text-ink/65 focus:border-ochre";
  const button = dark
    ? "bg-champagne text-ink hover:bg-cloud"
    : "bg-ink text-ivory hover:bg-ochre";
  const link = dark ? "border-champagne text-champagne" : "border-ochre text-ochre";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent, website, source }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      track("email_signup", { source });
      setStatus("success");
      setMessage("Thank you. You are on the list.");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <section aria-labelledby={`${id}-h`} className={text}>
      <h2 id={`${id}-h`} className="font-serif text-2xl">
        {heading}
      </h2>
      <p className={`mt-2 max-w-md text-sm ${muted}`}>{blurb}</p>

      {status === "success" ? (
        <p role="status" aria-live="polite" className="mt-5 text-sm">
          {message}
        </p>
      ) : (
        <form onSubmit={onSubmit} noValidate className="mt-5 max-w-md">
          <label htmlFor={`${id}-email`} className={`block text-[11px] uppercase tracking-[0.16em] ${muted}`}>
            Email address
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              id={`${id}-email`}
              type="email"
              name="email"
              required
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`min-h-[44px] flex-1 border px-4 py-3 text-sm focus:outline-none ${field}`}
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className={`btn-press min-h-[44px] px-6 py-3 text-[12px] uppercase tracking-[0.2em] transition disabled:cursor-wait disabled:opacity-60 ${button}`}
            >
              {status === "loading" ? "Joining…" : "Join"}
            </button>
          </div>

          {/* Honeypot: hidden from people and assistive tech, bots fill it. */}
          <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
            <label>
              Website
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </label>
          </div>

          <label className="mt-4 flex min-h-[44px] cursor-pointer items-start gap-3 text-[13px] leading-snug">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              required
              className="mt-0.5 h-5 w-5 shrink-0 accent-ochre"
            />
            <span className={muted}>
              {CONSENT_TEXT}{" "}
              <Link href="/privacy" className={`border-b pb-0.5 ${link}`}>
                Privacy Policy
              </Link>
            </span>
          </label>

          <p role={status === "error" ? "alert" : "status"} aria-live="polite" className="mt-2 min-h-[1.25rem] text-[13px]">
            {status === "error" ? message : ""}
          </p>
        </form>
      )}
    </section>
  );
}
