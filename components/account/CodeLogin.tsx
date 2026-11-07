"use client";

// Customer sign-in: email, then a six-digit code, on one page. No passwords.
// The six boxes behave as one logical input (group + per-digit labels, paste and
// autofill spread across the boxes, auto-submit on the sixth digit). The server
// answers the same for every address, so this form never says whether an account
// exists. return_to is only passed along; the server re-checks it.
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const LEN = 6;
const RESEND_AFTER_S = 30;

const NOTICES: Record<string, string> = {
  failed: "Google sign-in could not be completed. Please try again, or use your email.",
  rate_limited: "Too many attempts. Please try again in a few minutes.",
};

type Props = {
  googleEnabled?: boolean;
  returnTo?: string;
  /** Pre-filled address (order confirmation). */
  initialEmail?: string;
  /** Label on the first button. */
  cta?: string;
  notice?: string;
  /** Compact layout for use inside another page. */
  compact?: boolean;
};

export default function CodeLogin({ googleEnabled = false, returnTo = "/account", initialEmail = "", cta = "Continue", notice, compact = false }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState(initialEmail);
  const [digits, setDigits] = useState<string[]>(Array(LEN).fill(""));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    notice && Object.hasOwn(NOTICES, notice) ? NOTICES[notice] : null
  );
  const [wait, setWait] = useState(0);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const submitted = useRef(false);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  useEffect(() => {
    if (step === "code") boxes.current[0]?.focus();
  }, [step]);

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/account/code/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.status === 400) {
        setError("Please enter a valid email address.");
      } else if (res.status === 429) {
        setError("Too many attempts. Please try again in a few minutes.");
      } else if (!res.ok) {
        setError("Something went wrong. Please try again, or continue with Google or as a guest.");
      } else {
        setDigits(Array(LEN).fill(""));
        submitted.current = false;
        setWait(RESEND_AFTER_S);
        setStep("code");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const verify = useCallback(
    async (code: string) => {
      if (submitted.current) return;
      submitted.current = true;
      setBusy(true);
      setError(null);
      try {
        const res = await fetch("/api/account/code/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code, return_to: returnTo }),
        });
        if (res.ok) {
          const json = await res.json();
          router.push(typeof json.redirect === "string" ? json.redirect : "/account");
          router.refresh();
          return;
        }
        setError(
          res.status === 429
            ? "Too many attempts. Please try again in a few minutes."
            : "That code did not work. Check it, or send a new one."
        );
        setDigits(Array(LEN).fill(""));
        submitted.current = false;
        setBusy(false);
        boxes.current[0]?.focus();
      } catch {
        setError("Something went wrong. Please try again.");
        submitted.current = false;
        setBusy(false);
      }
    },
    [email, returnTo, router]
  );

  function setFrom(index: number, raw: string) {
    const entered = raw.replace(/\D/g, "");
    if (!entered) {
      setDigits((d) => d.map((v, i) => (i === index ? "" : v)));
      return;
    }
    const next = [...digits];
    // A paste or an autofill arrives as several digits at once; spread them.
    entered
      .slice(0, LEN - index)
      .split("")
      .forEach((ch, i) => (next[index + i] = ch));
    setDigits(next);
    const last = Math.min(index + entered.length, LEN - 1);
    boxes.current[last]?.focus();
    if (next.every(Boolean)) void verify(next.join(""));
  }

  function onKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      e.preventDefault();
      setDigits((d) => d.map((v, i) => (i === index - 1 ? "" : v)));
      boxes.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      boxes.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < LEN - 1) {
      boxes.current[index + 1]?.focus();
    }
  }

  const input =
    "w-full border border-ink/30 bg-white/60 px-4 py-3 text-[16px] text-ink outline-none transition focus:border-garden focus-visible:ring-2 focus-visible:ring-garden/40 disabled:opacity-70";
  const primary =
    "flex min-h-[48px] w-full items-center justify-center bg-garden px-5 py-3 text-[14px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-70";

  return (
    <div className={compact ? "" : "w-full max-w-md"}>
      {step === "email" ? (
        <form onSubmit={sendCode} className="flex flex-col gap-4" noValidate>
          <label htmlFor="account-email" className="text-[12px] uppercase tracking-[0.16em] text-ink">
            Email
          </label>
          <input
            id="account-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
            className={input}
            aria-describedby={error ? "account-error" : undefined}
          />
          {error && (
            <p id="account-error" role="alert" className="text-[14px] text-ochre">
              {error}
            </p>
          )}
          <button type="submit" disabled={busy || !email.trim()} className={primary}>
            {busy ? "Sending…" : cta}
          </button>
          {googleEnabled && (
            <>
              <p className="text-center text-[12px] uppercase tracking-[0.2em] text-ink" aria-hidden="true">
                or
              </p>
              {/* A plain link: the browser must follow the redirect to Google. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href={`/api/auth/google/start?intent=customer&return_to=${encodeURIComponent(returnTo)}`}
                className="flex min-h-[48px] w-full items-center justify-center border border-garden px-5 py-3 text-[14px] uppercase tracking-[0.18em] text-garden transition-colors hover:bg-garden hover:text-white"
              >
                Continue with Google
              </a>
            </>
          )}
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          <p role="status" className="text-[15px] leading-relaxed text-ink">
            We sent a code to <span className="break-all text-ink">{email.trim().toLowerCase()}</span>.
          </p>
          <div role="group" aria-label="Six digit sign-in code" className="flex gap-2">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  boxes.current[i] = el;
                }}
                value={d}
                onChange={(e) => setFrom(i, e.target.value)}
                onKeyDown={(e) => onKeyDown(i, e)}
                onFocus={(e) => e.currentTarget.select()}
                disabled={busy}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                aria-label={`Digit ${i + 1} of ${LEN}`}
                className="h-14 min-w-0 flex-1 border border-ink/30 bg-white/60 text-center text-[22px] text-ink outline-none transition focus:border-garden focus-visible:ring-2 focus-visible:ring-garden/40 disabled:opacity-70"
              />
            ))}
          </div>
          <div aria-live="polite" className="min-h-[1.5rem]">
            {busy && <p className="text-[14px] text-ink">Checking…</p>}
            {error && (
              <p role="alert" className="text-[14px] text-ochre">
                {error}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 text-[13px]">
            <button
              type="button"
              disabled={wait > 0 || busy}
              onClick={() => sendCode()}
              className="min-h-[44px] text-ink underline underline-offset-4 disabled:cursor-not-allowed disabled:no-underline disabled:text-ink/70"
            >
              {wait > 0 ? `Resend in ${wait}s` : "Send a new code"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setStep("email");
                setError(null);
              }}
              className="min-h-[44px] text-ink underline underline-offset-4"
            >
              Use a different email
            </button>
          </div>
          <p className="text-[13px] leading-relaxed text-ink">
            It can take a minute, and it may land in your spam folder.
          </p>
        </div>
      )}
    </div>
  );
}
