"use client";

import { Suspense, useId, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { track } from "@/lib/analytics";
import { SMS_CONSENT_TEXT } from "@/lib/sms-consent";

/**
 * The Founding 100 capture card. Deliberately plain — no product color tint,
 * no restated "Coming Soon" heading — because it now sits inside a hero that
 * already carries the headline and imagery; this card's only job is to be
 * the fastest possible path from "I want in" to a saved signup.
 */
export default function ComingSoonPackshot(props: { source: string }) {
  return (
    <Suspense fallback={<ComingSoonPackshotInner {...props} referredBy="" />}>
      <ComingSoonPackshotWithReferral {...props} />
    </Suspense>
  );
}

function ComingSoonPackshotWithReferral(props: { source: string }) {
  const searchParams = useSearchParams();
  const referredBy = searchParams.get("ref") || "";
  return <ComingSoonPackshotInner {...props} referredBy={referredBy} />;
}

function ComingSoonPackshotInner({
  source,
  referredBy,
}: {
  source: string;
  referredBy: string;
}) {
  // Two of these cards render on /founding-100, so field ids must be unique per instance.
  const uid = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [shareCopied, setShareCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email) return;
    setStatus("loading");
    setErrorMessage("");
    try {
      const res = await fetch("/api/founding-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, smsConsent, dateOfBirth, referredBy, source }),
      });
      if (res.ok) track("email_signup", { source });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(typeof data.error === "string" ? data.error : "");
      }
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/founding-100?ref=${encodeURIComponent(name || "a-friend")}`
      : "";

  // Plain links for WhatsApp, email and Facebook work on every device, with or
  // without an installed app or a system share sheet (the browser share sheet
  // on a desktop often offers nothing usable). Copy link falls back to a hidden
  // field when the clipboard API is unavailable.
  const shareMessage = "I have a place with the CHIAREL Founding Members: one hundred numbered places, with early access to every new formula.";
  const encodedUrl = encodeURIComponent(shareUrl);
  const shareLinks = [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${shareMessage} ${shareUrl}`)}` },
    {
      label: "Email",
      href: `mailto:?subject=${encodeURIComponent("The CHIAREL Founding Members")}&body=${encodeURIComponent(`${shareMessage}

${shareUrl}`)}`,
    },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
  ];

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const field = document.createElement("textarea");
      field.value = shareUrl;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      document.body.removeChild(field);
    }
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  }

  if (status === "done") {
    return (
      <div className="card-elevated flex w-full flex-col items-center gap-4 rounded-md bg-white p-8 text-center">
        <p className="font-serif text-xl text-ink">
          You&rsquo;re on the list — welcome to the House.
        </p>
        <p className="max-w-xs text-[13px] leading-relaxed text-ink">
          Know someone who&rsquo;d love this? Send them your link.
        </p>
        <div className="grid w-full max-w-xs grid-cols-2 gap-2">
          {shareLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-press flex min-h-[44px] items-center justify-center border border-ochre px-3 py-3 text-[12px] uppercase tracking-[0.2em] text-ochre transition hover:bg-ochre hover:text-white"
            >
              {l.label}<span className="sr-only"> (opens in a new tab)</span>
            </a>
          ))}
          <button
            type="button"
            onClick={handleCopy}
            className="btn-press flex min-h-[44px] items-center justify-center border border-ochre px-3 py-3 text-[12px] uppercase tracking-[0.2em] text-ochre transition hover:bg-ochre hover:text-white"
          >
            {shareCopied ? "Link copied" : "Copy link"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card-elevated w-full rounded-md bg-white p-8"
    >
      {referredBy && (
        <p className="mb-4 text-[12px] text-ink">
          Referred by <span className="text-ochre">{referredBy}</span>
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <label htmlFor={`founding-first-name-${uid}`} className="sr-only">First name</label>
        <input
          id={`founding-first-name-${uid}`}
          type="text"
          autoComplete="given-name"
          required
          placeholder="First name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-ink/20 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/70 focus:border-ochre focus:outline-none"
        />
        <label htmlFor={`founding-email-${uid}`} className="sr-only">Email</label>
        <input
          id={`founding-email-${uid}`}
          type="email"
          autoComplete="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-ink/20 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/70 focus:border-ochre focus:outline-none"
        />
        <label htmlFor={`founding-phone-${uid}`} className="sr-only">Mobile number for text updates (optional)</label>
        <input
          id={`founding-phone-${uid}`}
          type="tel"
          autoComplete="tel"
          placeholder="Mobile for text updates (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border border-ink/20 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/70 focus:border-ochre focus:outline-none"
        />
        <label htmlFor={`founding-dob-${uid}`} className="sr-only">Date of birth</label>
        <input
          id={`founding-dob-${uid}`}
          type="date"
          autoComplete="bday"
          required
          aria-label="Date of birth"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          className="border border-ink/20 bg-white px-4 py-3 text-sm text-ink focus:border-ochre focus:outline-none sm:col-span-2"
        />
      </div>
      <label className="mt-3 flex cursor-pointer items-start gap-3 text-[12px] leading-snug text-ink">
        <input
          type="checkbox"
          checked={smsConsent}
          onChange={(e) => setSmsConsent(e.target.checked)}
          required={phone.trim() !== ""}
          className="mt-0.5 h-6 w-6 shrink-0 accent-ochre"
        />
        <span>
          {SMS_CONSENT_TEXT}{" "}
          <Link href="/sms-terms" className="border-b border-ochre pb-0.5 text-ochre">SMS Terms</Link>{" "}
          and{" "}
          <Link href="/privacy" className="border-b border-ochre pb-0.5 text-ochre">Privacy Policy</Link>.
          Tick only if you entered a mobile number above.
        </span>
      </label>
      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-press mt-3 w-full bg-ink py-4 text-[12px] uppercase tracking-[0.25em] text-ivory transition hover:bg-ochre disabled:cursor-wait disabled:opacity-60"
      >
        {status === "loading" ? "Joining the list…" : "Join the list"}
      </button>
      {status === "error" && (
        <p className="mt-2 text-[12px] text-ochre" role="alert">
          {errorMessage || "Something went wrong — please try again."}
        </p>
      )}
    </form>
  );
}
