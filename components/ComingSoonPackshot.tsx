"use client";

import { useState } from "react";
import Link from "next/link";

export default function ComingSoonPackshot({
  productName,
  color,
}: {
  productName: string;
  color: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [social, setSocial] = useState("");
  const [referral, setReferral] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/founding-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          social,
          referral,
          source: `${productName} — Coming Soon`,
        }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div
      className="relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-sm px-6 text-center"
      style={{ backgroundColor: `${color}55` }}
    >
      <p className="text-[10px] uppercase tracking-[0.22em] text-ink/50">
        The Full Portrait
      </p>
      <p className="mt-1 font-serif text-2xl text-ink/80">Coming Soon</p>
      <p className="mt-3 max-w-[220px] text-[12px] leading-relaxed text-ink/60">
        Be one of the first 100 Founding Members: {productName} at half its
        price. Share your result, and we return the rest.{" "}
        <Link href="/founding-100" className="border-b border-ochre text-ochre">
          See the terms
        </Link>
        .
      </p>

      {status === "done" ? (
        <p className="mt-4 text-[12px] text-ochre">
          You&rsquo;re on the list — welcome to the House.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-4 flex w-full max-w-[240px] flex-col gap-2"
        >
          <input
            type="text"
            required
            placeholder="First name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-ink/20 bg-white/80 px-3 py-2 text-[13px] text-ink placeholder:text-ink/40 focus:border-ochre focus:outline-none"
          />
          <input
            type="email"
            required
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-ink/20 bg-white/80 px-3 py-2 text-[13px] text-ink placeholder:text-ink/40 focus:border-ochre focus:outline-none"
          />
          <input
            type="tel"
            placeholder="Phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border border-ink/20 bg-white/80 px-3 py-2 text-[13px] text-ink placeholder:text-ink/40 focus:border-ochre focus:outline-none"
          />
          <input
            type="text"
            placeholder="Instagram or TikTok (optional)"
            value={social}
            onChange={(e) => setSocial(e.target.value)}
            className="border border-ink/20 bg-white/80 px-3 py-2 text-[13px] text-ink placeholder:text-ink/40 focus:border-ochre focus:outline-none"
          />
          <input
            type="email"
            placeholder="Recommend a friend's email (optional)"
            value={referral}
            onChange={(e) => setReferral(e.target.value)}
            className="border border-ink/20 bg-white/80 px-3 py-2 text-[13px] text-ink placeholder:text-ink/40 focus:border-ochre focus:outline-none"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="border border-ochre bg-ochre px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {status === "loading" ? "Joining…" : "Join the Founding 100"}
          </button>
          {status === "error" && (
            <p className="text-[11px] text-red-700">
              Something went wrong — please try again.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
