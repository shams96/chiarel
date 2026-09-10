"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

// The one signature, once-per-session moment on the site (per craft-floor
// convention set in globals.css: "one authored moment, not scattered
// effects" — this is the biggest one, so it lives in its own component
// rather than bolted onto app/page.tsx's existing hero-in/product-reveal
// entrance, which still plays underneath and is what the visitor sees the
// instant this overlay clears).
//
// Concept: light and glass, not botanical growth — a beam sweep, a droplet
// landing on a polished glass plane, a ripple, a refraction glint —
// expressing precision and luminous clarity rather than nature/wellness
// imagery. Sequence lands at ~2.9s total (exit fade included), against a
// ~3s target.
//
// First-paint fix: earlier builds returned `null` while phase was "idle",
// so the real page was what actually painted first (server-rendered HTML
// has no overlay in it at all), and the white overlay only appeared once a
// post-hydration effect fired — a visible flash of real content before the
// intro. Fixed by having "idle" render the same blank white overlay as
// "playing" (just without the animated children yet), so the very first
// paint — server-rendered, before any client JS runs — is already the
// blank white page. The decision effect below runs via useLayoutEffect
// rather than useEffect so a skip (repeat visit / reduced motion) clears
// that overlay before the browser paints the next frame, keeping any
// flash to the unavoidable minimum of one frame.
//
// Every stage animates transform/opacity (and, for the ripple, SVG
// rx/ry) only — no width/height/layout properties — so it stays cheap on
// low-end devices.
//
// Session flag is set the moment we decide to play, not after it finishes —
// so a refresh or back-navigation mid-sequence can't retrigger it. That
// matches "never repeats during the visit" literally, at the cost of a
// visitor who navigates away mid-animation not seeing the rest on return;
// that trade favors the "never repeats" guarantee over completeness.
const SESSION_FLAG = "chiarel-hero-intro-v3-seen";

const HOLD_MS = 2600; // time from mount to the start of the exit fade
const EXIT_MS = 300; // overlay fade-out duration

// useLayoutEffect warns "does nothing on the server" during Next.js SSR;
// effects never run during server rendering regardless of which hook is
// used, so aliasing to useEffect there is purely cosmetic (silences the
// warning) and changes no behavior.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

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

  if (phase === "done") return null;

  // "idle" (the very first render, both server and client, before the
  // decision effect has run) renders this same container with no animated
  // children — a blank white overlay. That's deliberate: it's what
  // guarantees the first thing ever painted is a clear white page, not a
  // flash of the real hero underneath.
  const showContent = phase === "playing" || phase === "exiting";

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
      {showContent && (
        <>
          {/* Light beam — reworked as a precision scan, not a decorative
              wipe: a warm ochre wash trailing a bright core edge, and where
              that core crosses center it leaves a soft mark that lingers
              exactly where the droplet is about to land — the beam isn't
              incidental light, it's locating the point of impact before
              the drop arrives. Colors are the brand's own (ochre/champagne)
              rather than a generic white glow, and the core's visibility
              comes from an ochre box-shadow glow rather than fill contrast
              alone, so it still reads clearly against the ivory ground.
              Moves on the site's own signature ease (cubic-bezier(0.16,1,
              0.3,1), the curve behind .hero-in in globals.css) instead of a
              generic ease-in-out, so the motion feels considered rather
              than mechanical. */}
          <motion.div
            aria-hidden="true"
            initial={{ x: "-140%", opacity: 0 }}
            animate={{ x: "240%", opacity: [0, 0.65, 0] }}
            transition={{ duration: 0.75, delay: 0.15, ease: [0.16, 1, 0.3, 1], times: [0, 0.5, 1] }}
            className="absolute top-0 h-full w-1/3 -skew-x-12"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(155,71,34,0.4), rgba(214,197,160,0.55), transparent)",
              filter: "blur(10px)",
            }}
          />
          <motion.div
            aria-hidden="true"
            initial={{ x: "-140%", opacity: 0 }}
            animate={{ x: "240%", opacity: [0, 1, 0] }}
            transition={{ duration: 0.75, delay: 0.15, ease: [0.16, 1, 0.3, 1], times: [0, 0.5, 1] }}
            className="absolute top-0 h-full w-[3px] -skew-x-12"
            style={{
              background: "linear-gradient(180deg, transparent 10%, #F3E6C8 50%, transparent 90%)",
              boxShadow: "0 0 24px 4px rgba(155,71,34,0.45)",
            }}
          />

          {/* The mark the scan leaves behind — arrives as the beam's core
              crosses center, holds through the droplet's fall, and is
              absorbed into the ripple on impact */}
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 0.35, 0.2], scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5, times: [0, 0.4, 1], ease: "easeOut" }}
            className="absolute h-24 w-24 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(155,71,34,0.4) 0%, transparent 70%)" }}
          />

          {/* Glass surface — a thin reflective plane the droplet lands on,
              present just before impact so the drop reads as landing ON
              something engineered, not falling into open space. */}
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, scaleX: 0.6 }}
            animate={{ opacity: 0.6, scaleX: 1 }}
            transition={{ duration: 0.3, delay: 0.5, ease: "easeOut" }}
            className="absolute h-px w-44 md:w-64"
            style={{ background: "linear-gradient(90deg, transparent, rgba(214,197,160,0.9), transparent)" }}
          />

          {/* Droplet — a slow, weighted fall (0.85s) onto the glass plane,
              timed to be clearly visible rather than a blink-and-miss-it
              blip. Lands at 0.55 + 0.85 = 1.40s. */}
          <motion.div
            aria-hidden="true"
            initial={{ y: -130, opacity: 1 }}
            animate={{ y: 0, opacity: [1, 1, 0] }}
            transition={{
              duration: 0.85,
              delay: 0.55,
              times: [0, 0.92, 1],
              ease: [0.6, 0, 0.85, 0.3],
            }}
            className="absolute h-3 w-3 rounded-full"
            style={{
              background: "radial-gradient(circle at 35% 30%, #F3E6C8 0%, #D6C5A0 55%, #9B4722 100%)",
              boxShadow: "0 0 12px rgba(155,71,34,0.35)",
            }}
          />

          {/* Ripple — a real SVG ellipse animated via rx/ry (not a
              CSS-scaled circle). A non-uniform CSS transform (scaleX/scaleY)
              on a bordered div distorts the border's apparent thickness
              unevenly and can render the ring almost invisible — reproduced
              live in testing (no ripple was visible at all). Animating the
              ellipse's own geometry keeps stroke-width constant regardless
              of aspect ratio, and holds at full opacity briefly before
              fading so it has a moment to actually be seen. */}
          <svg
            aria-hidden="true"
            viewBox="0 0 200 100"
            className="absolute h-16 w-40 overflow-visible md:h-20 md:w-52"
          >
            <motion.ellipse
              cx="100"
              cy="50"
              initial={{ rx: 2, ry: 1, opacity: 0.75 }}
              animate={{ rx: 95, ry: 34, opacity: [0.75, 0.75, 0] }}
              transition={{ duration: 0.6, delay: 1.4, times: [0, 0.35, 1], ease: "easeOut" }}
              fill="none"
              stroke="#9B4722"
              strokeWidth="1.5"
            />
          </svg>

          {/* Refraction glint — a brief bright flash just after impact,
              simulating light bending through the glass. Offset slightly
              from the ripple's own start so the two don't fire in the same
              instant and cancel each other out visually. Previously used
              #F8F6F1 as the fill — the exact same hex as this overlay's own
              bg-ivory background, so it had zero contrast to be seen by at
              all regardless of opacity. Given a warm champagne core and an
              ochre glow instead, matching how the beam's core reads. */}
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, scaleX: 0.3, rotate: -8 }}
            animate={{ opacity: [0, 1, 0], scaleX: [0.3, 1.4, 1.1] }}
            transition={{ duration: 0.3, delay: 1.48, ease: "easeOut" }}
            className="absolute h-px w-24 rounded-full"
            style={{
              background: "linear-gradient(90deg, transparent, #F3E6C8, transparent)",
              boxShadow: "0 0 10px 2px rgba(155,71,34,0.5)",
            }}
          />

          {/* Wordmark — same styling as the live header, so the crossfade
              into the real page reads as continuous, not a swap */}
          <div aria-hidden="true" className="relative flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.75 }}
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
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.95, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 font-serif text-xl tracking-[-0.01em] text-ink/80 md:text-2xl"
            >
              Advancing Cellular Clarity™
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, delay: 2.15 }}
              className="mt-4 max-w-xs text-[12px] leading-relaxed text-ink/60"
            >
              Intelligent formulations, precision-made in Isola del Liri, Italy.
            </motion.p>
          </div>

          {/* Product emergence — a soft bloom of light off to one side,
              foreshadowing the real product photo's position in the hero
              behind this overlay, so the crossfade hands off to it rather
              than introducing it cold */}
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 0.5, scale: 1 }}
            transition={{ duration: 0.45, delay: 2.2, ease: "easeOut" }}
            className="pointer-events-none absolute right-[12%] top-1/2 h-40 w-40 -translate-y-1/2 rounded-full md:h-56 md:w-56"
            style={{
              background: "radial-gradient(circle, rgba(214,197,160,0.45) 0%, rgba(214,197,160,0) 72%)",
              filter: "blur(2px)",
            }}
          />

          <motion.button
            ref={skipButtonRef}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              skip();
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            aria-label="Skip intro animation"
            className="absolute bottom-8 right-8 text-[10px] uppercase tracking-[0.3em] text-ink/40 transition hover:text-ochre focus:text-ochre focus:outline focus:outline-1 focus:outline-offset-4 focus:outline-ochre"
          >
            Skip
          </motion.button>
        </>
      )}
    </div>
  );
}
