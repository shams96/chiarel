"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [social, setSocial] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [shareCopied, setShareCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/founding-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, social, referredBy, source }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/founding-100?ref=${encodeURIComponent(name || "a-friend")}`
      : "";

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "The Founding 100 — CHIAREL",
          text: "Half price, full refund when you share your result. Only 100 places.",
          url: shareUrl,
        });
        return;
      } catch {
        // user cancelled or share failed — fall through to copy
      }
    }
    await navigator.clipboard.writeText(shareUrl);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  }

  if (status === "done") {
    return (
      <div className="card-elevated flex w-full flex-col items-center gap-4 rounded-md bg-white p-8 text-center">
        <p className="font-serif text-xl text-ink">
          You&rsquo;re on the list — welcome to the House.
        </p>
        <p className="max-w-xs text-[13px] leading-relaxed text-ink/60">
          Know someone who&rsquo;d love this? Send them your link — if they
          join, it helps both of you stand out as founding voices of the
          House.
        </p>
        <button
          onClick={handleShare}
          className="btn-press w-full max-w-xs border border-ochre px-4 py-3 text-[12px] uppercase tracking-[0.2em] text-ochre transition hover:bg-ochre hover:text-white"
        >
          {shareCopied ? "Link copied" : "Share with a friend"}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card-elevated w-full rounded-md bg-white p-8"
    >
      {referredBy && (
        <p className="mb-4 text-[12px] text-ink/50">
          Referred by <span className="text-ochre">{referredBy}</span>
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          required
          placeholder="First name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-ink/20 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-ochre focus:outline-none"
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-ink/20 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-ochre focus:outline-none"
        />
        <input
          type="tel"
          placeholder="Phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border border-ink/20 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-ochre focus:outline-none"
        />
        <input
          type="text"
          placeholder="Instagram or TikTok (optional)"
          value={social}
          onChange={(e) => setSocial(e.target.value)}
          className="border border-ink/20 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-ochre focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-press mt-3 w-full bg-ink py-4 text-[12px] uppercase tracking-[0.25em] text-ivory transition hover:bg-ochre disabled:cursor-wait disabled:opacity-60"
      >
        {status === "loading" ? "Claiming your place…" : "Claim your place"}
      </button>
      {status === "error" && (
        <p className="mt-2 text-[12px] text-ochre" role="alert">
          Something went wrong — please try again.
        </p>
      )}
    </form>
  );
}
