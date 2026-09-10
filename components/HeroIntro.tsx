"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

// The one signature, once-per-session moment on the site (per craft-floor
// convention set in globals.css: "one authored moment, not scattered
// effects" — this is the biggest one, so it lives in its own component
// rather than bolted onto app/page.tsx's existing hero-in/product-reveal
// entrance, which still plays underneath and is what the visitor sees the
// instant this overlay clears).
//
// Sequence (droplet → ripple → botanical line art → wordmark → headline →
// CTA) lands the whole thing, exit fade included, at ~5.0s. The original
// build held to a 3-4s target; the droplet fall was slowed down on request
// (a quick fall read as a blip, not a considered moment), which pushed the
// total past that window — a deliberate trade of the timing guardrail for
// the requested feel. Every stage animates transform/opacity only (no
// width/height/layout properties) so it stays cheap on low-end devices.
//
// Session flag is set the moment we decide to play, not after it finishes —
// so a refresh or back-navigation mid-sequence can't retrigger it. That
// matches "never repeats during the visit" literally, at the cost of a
// visitor who navigates away mid-animation not seeing the rest on return;
// that trade favors the "never repeats" guarantee over completeness.
const SESSION_FLAG = "chiarel-hero-intro-seen";

const HOLD_MS = 4600; // time from mount to the start of the exit fade
const EXIT_MS = 400; // overlay fade-out duration

type Phase = "idle" | "playing" | "exiting" | "done";

export default function HeroIntro() {
  const [phase, setPhase] = useState<Phase>("idle");
  const prefersReducedMotion = useReducedMotion();
  const skipButtonRef = useRef<HTMLButtonElement>(null);
  // Memoizes the play/skip decision AND the exit deadline across React 18
  // dev Strict Mode's intentional double-invocation of this effect (mount →
  // cleanup → mount) — and, empirically, occasional additional dev-only
  // remounts beyond that double-invoke. A plain `setTimeout` armed fresh on
  // each invocation and cancelled by the next cleanup can lose the race
  // entirely if a remount lands after the timer is armed but the next one
  // never gets a chance to re-arm before the window closes — reproduced
  // live in testing (the overlay never advanced past "playing"). Storing an
  // absolute deadline instead of a relative delay makes every invocation,
  // however many there are, agree on the same target time, and a
  // self-correcting interval (checked against Date.now(), not an elapsed
  // counter) picks up correctly regardless of how many times it's been
  // torn down and recreated in between.
  const decisionRef = useRef<"skip" | "play" | null>(null);
  const exitAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (decisionRef.current === null) {
      let alreadySeen = false;
      try {
        alreadySeen = sessionStorage.getItem(SESSION_FLAG) === "1";
      } catch {
        // Private-mode/blocked storage: fail open (skip the intro) rather
        // than risk a broken storage call throwing on every homepage visit.
        alreadySeen = true;
      }

      decisionRef.current = alreadySeen || prefersReducedMotion ? "skip" : "play";

      if (decisionRef.current === "play") {
        try {
          sessionStorage.setItem(SESSION_FLAG, "1");
        } catch {
          // Ignore — worst case the intro can replay if storage is unavailable.
        }
      }
    }

    if (decisionRef.current === "skip") {
      setPhase("done");
      return;
    }

    if (exitAtRef.current === null) {
      exitAtRef.current = Date.now() + HOLD_MS;
    }

    setPhase("playing");
    const checkInterval = window.setInterval(() => {
      if (exitAtRef.current !== null && Date.now() >= exitAtRef.current) {
        setPhase((current) => (current === "playing" ? "exiting" : current));
      }
    }, 100);
    return () => window.clearInterval(checkInterval);
    // prefersReducedMotion is read once at mount; it isn't expected to
    // change mid-session and re-running this effect on its change would
    // restart a sequence that may already be playing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== "playing" && phase !== "exiting") return;
    // Lock scroll while the intro owns the screen; restore on either
    // exit-complete or unmount so a fast route change never leaves the
    // page stuck unscrollable.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [phase]);

  const skip = useCallback(() => {
    setPhase((current) => (current === "playing" ? "exiting" : current));
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    // Only Escape/Enter/Space skip — anything else (notably Tab) must keep
    // its normal keyboard-navigation behavior instead of being swallowed.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Enter" || event.key === " ") {
        skip();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    // Move focus to the skip control so a keyboard user isn't stranded
    // with focus on whatever the underlying page happened to hold.
    skipButtonRef.current?.focus();
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, skip]);

  if (phase === "idle" || phase === "done") return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Chiarel intro animation"
      onClick={skip}
      // Plain CSS transition rather than Framer Motion's `animate` prop —
      // in testing, changing `animate` on this element's opacity target
      // never actually moved the rendered opacity (confirmed via a debug
      // attribute: React re-rendered with the new prop correctly, Framer
      // Motion just never applied it), so onAnimationComplete never fired
      // and the overlay stuck at phase "exiting" forever. A plain style
      // transition plus the native transitionend event has no such
      // dependency and matches how the rest of this codebase already
      // handles simple opacity/transform fades (see .card-elevated,
      // .product-reveal in globals.css). Framer Motion is kept for the
      // choreographed children below, where it does work correctly.
      style={{ opacity: phase === "exiting" ? 0 : 1, transition: `opacity ${EXIT_MS}ms ease-in-out` }}
      onTransitionEnd={(event) => {
        if (event.propertyName === "opacity" && phase === "exiting") setPhase("done");
      }}
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-ivory"
    >
      {/* Droplet — a slow, weighted fall (1.6s, not the original 0.7s):
          gravity reads as unhurried at first and only gathers speed in the
          last third, per the "slow the drop down" note — a quick fall
          registered as a blip rather than a considered moment. */}
      <motion.div
        aria-hidden="true"
        initial={{ y: -140, opacity: 1 }}
        animate={{ y: 0, opacity: [1, 1, 0] }}
        transition={{
          duration: 1.6,
          delay: 0.2,
          times: [0, 0.92, 1],
          ease: [0.64, 0, 0.86, 0.32],
        }}
        className="absolute h-3 w-3 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, #F3E6C8 0%, #D6C5A0 55%, #9B4722 100%)",
          boxShadow: "0 0 12px rgba(155,71,34,0.35)",
        }}
      />

      {/* Ripple — expands and fades from the point of impact (timed to the
          slower droplet: impact now lands at 0.2 + 1.6 = 1.8s) */}
      <motion.div
        aria-hidden="true"
        initial={{ scale: 0, opacity: 0.55 }}
        animate={{ scale: 7, opacity: 0 }}
        transition={{ duration: 0.9, delay: 1.8, ease: "easeOut" }}
        className="absolute h-16 w-16 rounded-full border border-champagne"
      />

      {/* Botanical line art — a specific olive sprig, not a generic
          abstract-fern gesture. Olive is the actual flora of the Liri
          valley/Lazio (the real setting behind The Cascata Complex™'s
          water story), so this is a considered, place-specific motif
          rather than any stock "botanical" shorthand: one curved stem,
          seven leaves at alternating, decreasing size going up the
          branch (as a real sprig tapers), each leaf its own closed
          almond outline rather than a bare line. */}
      <motion.svg
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.9, y: 6 }}
        animate={{ opacity: 0.2, scale: 1, y: 0 }}
        transition={{ duration: 1, delay: 2.1, ease: "easeOut" }}
        viewBox="0 0 200 200"
        className="pointer-events-none absolute h-48 w-48 text-ochre md:h-64 md:w-64"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinejoin="round"
      >
        {/* stem, gently curved as a real branch rather than a straight rule */}
        <path d="M100 195 C 98 160 102 130 99 95 C 96 62 101 40 100 22" />
        {/* leaves, base-to-tip, largest near the base and smallest at the crown */}
        <path d="M99 150 Q80 128 65 130 Q80 152 99 150 Z" />
        <path d="M100 120 Q122 96 138 102 Q122 122 100 120 Z" />
        <path d="M98 90 Q80 70 68 74 Q80 92 98 90 Z" />
        <path d="M100 60 Q118 42 128 46 Q116 62 100 60 Z" />
        <path d="M99 35 Q84 20 78 24 Q88 36 99 35 Z" />
        {/* terminal bud pair at the crown */}
        <path d="M100 22 Q90 10 82 14 Q92 22 100 22 Z" />
        <path d="M100 22 Q110 10 118 14 Q108 22 100 22 Z" />
      </motion.svg>

      {/* Wordmark — same styling as the live header, so the crossfade
          into the real page reads as continuous, not a swap */}
      <div aria-hidden="true" className="relative flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 3.0 }}
          className="flex flex-col items-center leading-none"
        >
          <span className="font-serif text-3xl tracking-[0.35em] text-ink md:text-4xl">
            CHIAREL
          </span>
          <span className="mt-2 text-[10px] uppercase tracking-[0.28em] text-ochre">
            House of Skin Intelligence™
          </span>
        </motion.div>

        <motion.p
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 3.35, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 font-serif text-xl tracking-[-0.01em] text-ink/80 md:text-2xl"
        >
          Advancing Cellular Clarity™
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 3.7 }}
          className="mt-8 text-[11px] uppercase tracking-[0.3em] text-ink/50"
        >
          Enter the Ritual
        </motion.div>
      </div>

      <motion.button
        ref={skipButtonRef}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          skip();
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 1 }}
        aria-label="Skip intro animation"
        className="absolute bottom-8 right-8 text-[10px] uppercase tracking-[0.3em] text-ink/40 transition hover:text-ochre focus:text-ochre focus:outline focus:outline-1 focus:outline-offset-4 focus:outline-ochre"
      >
        Skip
      </motion.button>
    </div>
  );
}
