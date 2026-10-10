"use client";

import { useEffect } from "react";

// Catches errors thrown by any Server or Client Component below the root
// layout — most likely a database call failing (e.g. the Supabase pooler
// being unreachable). Without this, an uncaught error here renders Next's
// generic unstyled default error page with no way back into the site.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-ivory px-6 text-center">
      <p className="text-[11px] uppercase tracking-[0.3em] text-ochre">
        CHIAREL™
      </p>
      <h1 className="mt-6 font-serif text-3xl text-ink">
        Something went wrong on our end
      </h1>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink/60">
        This page hit an unexpected error — often a brief connection issue.
        Trying again usually resolves it.
      </p>
      <div className="mt-8 flex items-center gap-6">
        <button
          onClick={reset}
          className="btn-press bg-ink px-8 py-3 text-[12px] uppercase tracking-[0.25em] text-ivory transition hover:bg-ochre"
        >
          Try again
        </button>
        <a
          href="/"
          className="border-b border-ochre pb-0.5 text-[12px] uppercase tracking-[0.18em] text-ochre"
        >
          Return home
        </a>
      </div>
    </div>
  );
}
