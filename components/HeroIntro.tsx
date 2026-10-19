"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

// The one signature, once-per-session moment on the site (per craft-floor
// convention set in globals.css: "one authored moment, not scattered
// effects"). It lives in its own component rather than bolted onto
// app/page.tsx's hero-in/product-reveal entrance, which still plays
// underneath and is what the visitor sees the instant this overlay clears.
//
// Concept: a single drop of golden essence. It swells and hangs, falls with
// real gravity into a pool of liquid gold, and the pool opens into slow,
// flattened ripples (seen at an angle, like a liquid surface, not as flat
// circles from above) while the wordmark rises out of it. Champagne gold, not
// the site's Red Ochre UI accent: this is product matter, not interface chrome.
// The pace is deliberately slow, ~6s, because a luxury moment has to be
// watched; Skip is on screen from the start and any tap, Escape, Enter or
// Space ends it.
//
// First-paint: "idle" renders the same blank ivory overlay as "playing" (just
// without the animated children), so the first, server-rendered paint is
// already a clean page, not a flash of the hero. The decision effect runs in a
// layout effect so a skip (repeat visit / reduced motion) clears the overlay
// before the next frame.
//
// Every stage animates transform/opacity (and, for the ripples, SVG rx/ry)
// only, no layout properties, so it stays cheap on low-end devices.
//
// The session flag is set the moment we decide to play, so a refresh or
// back-navigation mid-sequence can't retrigger it.
const SESSION_FLAG = "chiarel-hero-intro-v7-seen";

const HOLD_MS = 6200; // mount to the start of the exit fade: wordmark settles ~4.5s, then holds ~1.7s
const EXIT_MS = 400; // overlay fade-out duration

// Timeline (seconds from mount)
const SWELL_AT = 0.3; // drop forms at the top
const FALL_AT = 1.5; // drop lets go
const IMPACT_AT = 2.3; // drop meets the pool
const WORDMARK_AT = 3.3; // wordmark starts rising out of the pool
const DROP_TRAVEL = -210; // px the drop hangs above the pool

const RING_COUNT = 5;

// useLayoutEffect warns "does nothing on the server" during Next.js SSR;
// aliasing to useEffect there only silences the warning.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type Phase = "idle" | "playing" | "exiting" | "done";

export default function HeroIntro() {
  const [phase, setPhase] = useState<Phase>("idle");
  const prefersReducedMotion = useReducedMotion();
  const skipButtonRef = useRef<HTMLButtonElement>(null);
  // Memoizes the play/skip decision AND the exit deadline across React dev
  // Strict Mode's double-invoked effects (and occasional extra dev remounts).
  // An absolute deadline checked against Date.now() lets every invocation
  // agree on the same target time however many times the interval is torn
  // down and recreated.
  const decisionRef = useRef<"skip" | "play" | null>(null);
  const exitAtRef = useRef<number | null>(null);

  useIsomorphicLayoutEffect(() => {
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
          // Ignore: worst case the intro can replay if storage is unavailable.
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
    // prefersReducedMotion is read once at mount; re-running this effect on
    // its change would restart a sequence that may already be playing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== "playing" && phase !== "exiting") return;
    // Lock scroll while the intro owns the screen; restore on either
    // exit-complete or unmount so a fast route change never leaves the
    // page stuck unscrollable.
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    // Hiding overflow removes a classic (non-overlay) scrollbar, which
    // widens the layout and re-wraps the hero text when it comes back: a
    // layout shift. Pad by the scrollbar width so the layout stays put.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [phase]);

  const skip = useCallback(() => {
    setPhase((current) => (current === "playing" ? "exiting" : current));
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    // Only Escape/Enter/Space skip; anything else (notably Tab) must keep
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

  if (phase === "done") return null;

  // "idle" (the very first render, before the decision effect has run)
  // renders this same container with no animated children: a blank ivory
  // overlay, so the first thing ever painted is a clear page.
  const showContent = phase === "playing" || phase === "exiting";

  const fallEnd = IMPACT_AT;
  const fallSpan = fallEnd; // keyframe clock runs from mount to impact + settle
  const settle = 0.18; // squash into the pool after impact

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Chiarel intro animation"
      onClick={skip}
      // Plain CSS transition rather than Framer Motion's `animate` prop: a
      // style transition plus the native transitionend event has no
      // dependency on Framer applying the target (it was observed not to
      // here, leaving the overlay stuck at "exiting"). Framer Motion is kept
      // for the choreographed children below, where it works correctly.
      style={{ opacity: phase === "exiting" ? 0 : 1, transition: `opacity ${EXIT_MS}ms ease-in-out` }}
      onTransitionEnd={(event) => {
        if (event.propertyName === "opacity" && phase === "exiting") setPhase("done");
      }}
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-ivory"
    >
      {showContent && (
        <>
          {/* Warm light: the ivory ground gathers a faint champagne glow
              around the pool, like the lit surface of liquid gold. */}
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 55% at 50% 56%, rgba(226,176,70,0.34) 0%, rgba(240,220,170,0.18) 45%, rgba(248,246,241,0) 75%)",
            }}
          />

          {/* The pool: a soft golden sheen on the surface that opens at
              impact, then flattened ripples (rx wide, ry ~30% of it) so the
              surface reads as viewed at an angle. Each ring is a gold stroke
              with a thin bright highlight riding just above it. */}
          <svg
            aria-hidden="true"
            viewBox="0 0 640 220"
            className="pointer-events-none absolute w-[min(170vw,1800px)] overflow-visible"
            style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
          >
            <defs>
              <linearGradient id="hi-ring" x1="0" y1="0" x2="640" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#A9700F" />
                <stop offset="0.5" stopColor="#EDBE55" />
                <stop offset="1" stopColor="#A9700F" />
              </linearGradient>
              <radialGradient id="hi-sheen" cx="50%" cy="50%" r="50%">
                <stop offset="0" stopColor="#F6DE9A" stopOpacity="1" />
                <stop offset="0.55" stopColor="#E3A93A" stopOpacity="0.55" />
                <stop offset="1" stopColor="#E3B454" stopOpacity="0" />
              </radialGradient>
            </defs>

            <motion.ellipse
              cx="320"
              cy="110"
              initial={{ rx: 8, ry: 2.4, opacity: 0 }}
              animate={{ rx: 560, ry: 168, opacity: [0, 0.8, 0.35, 0] }}
              transition={{
                delay: IMPACT_AT,
                rx: { duration: 3.4, ease: [0.25, 0.55, 0.55, 1] },
                ry: { duration: 3.4, ease: [0.25, 0.55, 0.55, 1] },
                opacity: { duration: 3.4, times: [0, 0.15, 0.6, 1], ease: "easeOut" },
              }}
              fill="url(#hi-sheen)"
            />

            {Array.from({ length: RING_COUNT }, (_, i) => {
              const end = 600; // every ring runs past the screen edge and leaves, like a real ripple
              const start = IMPACT_AT + i * 0.28;
              const peak = 1 - i * 0.12;
              return (
                <g key={i}>
                  <motion.ellipse
                    cx="320"
                    cy="110"
                    initial={{ rx: 6, ry: 1.8, opacity: 0 }}
                    animate={{ rx: end, ry: end * 0.3, opacity: [0, peak, peak * 0.75, 0] }}
                    transition={{
                      delay: start,
                      rx: { duration: 2.8, ease: [0.2, 0.4, 0.6, 0.85] },
                      ry: { duration: 2.8, ease: [0.2, 0.4, 0.6, 0.85] },
                      opacity: { duration: 2.8, times: [0, 0.1, 0.7, 1], ease: "easeOut" },
                    }}
                    fill="none"
                    stroke="url(#hi-ring)"
                    strokeWidth={3.6 - i * 0.4}
                  />
                  <motion.ellipse
                    cx="320"
                    cy="108.6"
                    initial={{ rx: 6, ry: 1.8, opacity: 0 }}
                    animate={{ rx: end, ry: end * 0.3, opacity: [0, peak * 0.8, peak * 0.55, 0] }}
                    transition={{
                      delay: start,
                      rx: { duration: 2.8, ease: [0.2, 0.4, 0.6, 0.85] },
                      ry: { duration: 2.8, ease: [0.2, 0.4, 0.6, 0.85] },
                      opacity: { duration: 2.8, times: [0, 0.1, 0.7, 1], ease: "easeOut" },
                    }}
                    fill="none"
                    stroke="#FFF4CF"
                    strokeWidth={1.3}
                  />
                </g>
              );
            })}
          </svg>

          {/* Impact flash: a small bright bloom where the drop enters the gold */}
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: [0, 0.9, 0], scale: [0.4, 1.5, 1.9] }}
            transition={{ duration: 0.7, delay: IMPACT_AT - 0.05, ease: "easeOut" }}
            className="pointer-events-none absolute h-24 w-24 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(255,240,194,0.95) 0%, rgba(232,185,74,0.4) 40%, transparent 70%)" }}
          />

          {/* The drop. Outer element does the travel: it hangs, then falls
              on a gravity curve (slow start, fast arrival), stretching as it
              speeds up, and is squashed into the surface on arrival.
              transform-origin sits at the base so the squash reads as the
              drop sinking into the pool. */}
          <motion.div
            aria-hidden="true"
            initial={{ y: DROP_TRAVEL, scaleY: 1, opacity: 1 }}
            animate={{
              y: [DROP_TRAVEL, DROP_TRAVEL, 0, 0],
              scaleY: [1, 1, 1.22, 0.1],
              opacity: [1, 1, 1, 0],
            }}
            transition={{
              duration: fallSpan + settle,
              times: [0, FALL_AT / (fallSpan + settle), fallEnd / (fallSpan + settle), 1],
              ease: ["linear", [0.5, 0, 0.9, 0.55], "easeOut"],
            }}
            className="absolute"
            style={{ transformOrigin: "50% 100%" }}
          >
            {/* Inner element does the swell: the drop gathers at its tip
                (origin top) before it lets go. */}
            <motion.svg
              viewBox="0 0 60 84"
              className="block h-[104px] w-[74px] overflow-visible md:h-[128px] md:w-[91px]"
              initial={{ scale: 0.25, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.1, delay: SWELL_AT, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: "50% 0%", filter: "drop-shadow(0 8px 20px rgba(154,98,8,0.4))" }}
            >
              <defs>
                <linearGradient id="hi-drop" x1="0.1" y1="0" x2="0.9" y2="1">
                  <stop offset="0" stopColor="#FFE9A0" />
                  <stop offset="0.4" stopColor="#E7A92A" />
                  <stop offset="1" stopColor="#9A6208" />
                </linearGradient>
                <radialGradient id="hi-core" cx="0.5" cy="0.72" r="0.5">
                  <stop offset="0" stopColor="#FFF6D6" stopOpacity="0.55" />
                  <stop offset="1" stopColor="#FFF6D6" stopOpacity="0" />
                </radialGradient>
              </defs>
              <path
                d="M30 2 C30 2 4 38 4 57 a26 26 0 0 0 52 0 C56 38 30 2 30 2 Z"
                fill="url(#hi-drop)"
              />
              {/* inner glow, as if lit from below through the liquid */}
              <path d="M30 2 C30 2 4 38 4 57 a26 26 0 0 0 52 0 C56 38 30 2 30 2 Z" fill="url(#hi-core)" />
              {/* rim light on the shadow side */}
              <path
                d="M52 50 C52 62 44 76 30 79"
                fill="none"
                stroke="#FFE9A8"
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity="0.55"
              />
              {/* specular highlight */}
              <ellipse cx="19" cy="52" rx="4.2" ry="11" transform="rotate(14 19 52)" fill="#FFFFFF" opacity="0.78" />
              <circle cx="24" cy="36" r="1.8" fill="#FFFFFF" opacity="0.7" />
            </motion.svg>
          </motion.div>

          {/* Wordmark: same styling as the live header, so the crossfade into
              the real page reads as continuous, not a swap. It rises as the
              last ripples fade. */}
          <div aria-hidden="true" className="relative flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: WORDMARK_AT, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center leading-none"
            >
              <span className="font-serif text-3xl tracking-[0.35em] text-ink md:text-4xl">CHIAREL</span>
              <span className="mt-2 text-[10px] uppercase tracking-[0.28em] text-ochre">The House of Clarity™</span>
            </motion.div>

            <motion.p
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: WORDMARK_AT + 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 font-serif text-xl tracking-[-0.01em] text-ink/80 md:text-2xl"
            >
              Advancing Cellular Clarity™
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: WORDMARK_AT + 0.55 }}
              className="mt-4 max-w-xs text-[12px] leading-relaxed text-ink/60"
            >
              Intelligent formulations, precision-made in Isola del Liri, Italy.
            </motion.p>
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
            transition={{ duration: 0.4, delay: 0.3 }}
            aria-label="Skip intro animation"
            className="absolute bottom-3 right-3 flex min-h-[44px] min-w-[44px] items-center justify-center px-3 text-[10px] uppercase tracking-[0.3em] text-ink/65 transition hover:text-ochre focus:text-ochre focus:outline focus:outline-1 focus:outline-offset-4 focus:outline-ochre"
          >
            Skip
          </motion.button>
        </>
      )}
    </div>
  );
}
