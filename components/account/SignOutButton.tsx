"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function out() {
    setBusy(true);
    try {
      await fetch("/api/account/signout", { method: "POST" });
    } finally {
      router.push("/account/login");
      router.refresh();
    }
  }
  return (
    <button
      type="button"
      onClick={out}
      disabled={busy}
      className="min-h-[44px] text-[12px] uppercase tracking-[0.14em] text-ink underline underline-offset-4 disabled:opacity-70"
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
