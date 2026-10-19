"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, motion, useMotionTemplate, useMotionValue, useReducedMotion, useTransform } from "framer-motion";

// The one signature, once-per-session moment on the site (per craft-floor
// convention set in globals.css: "one authored moment, not scattered
// effects"). It lives in its own component rather than bolted onto
// app/page.tsx's hero-in/product-reveal entrance, which still plays
// underneath and is what the visitor sees the instant this overlay clears.
//
// Concept: a drop of golden essence lands on skin. Skin does not splash; it
// dips under the drop and the drop is taken in. From that exact point one
// slow, soft wave of light travels outward across the skin, and the skin it
// has passed through is left smoother, warmer and more luminous, with a
// faint depth of warmth beneath the surface. The wordmark rises as the wave
// leaves the frame. The wave is light and surface relief, not drawn rings
// (rings read as water), and "beneath the surface" is only a warm glow, not a
// cross-section: it is a metaphor, never a claim.
//
// How it is built: two skin layers (a slightly uneven, dull one and a
// smooth, radiant one) with the radiant layer revealed by an elliptical mask
// whose radius is one motion value; a crest (light on the outer edge, a
// shallow shadow just inside it) and a warm subsurface glow ride the same
// value, so everything stays locked to the wave front. The ellipse (wider
// than tall) gives the low camera angle of a macro shot.
//
// First-paint: "idle" renders the same blank ivory overlay as "playing" (just
// without the animated children), so the first, server-rendered paint is
// already a clean page, not a flash of the hero. The decision effect runs in a
// layout effect so a skip (repeat visit / reduced motion) clears the overlay
// before the next frame.
//
// Sizes are in vmax so the wave scales with the screen. Skip is on screen
// from the start and any tap, Escape, Enter or Space ends it.
//
// The session flag is set the moment we decide to play, so a refresh or
// back-navigation mid-sequence can't retrigger it.
const SESSION_FLAG = "chiarel-hero-intro-v8-seen";

const HOLD_MS = 7000; // mount to the start of the exit fade
const EXIT_MS = 500; // overlay fade-out duration

// Timeline (seconds from mount)
const SKIN_IN = 1.1; // skin fades up out of the ivory
const SWELL_AT = 0.4; // drop forms at the top
const FALL_AT = 1.6; // drop lets go
const IMPACT_AT = 2.5; // drop meets the skin
const WAVE_S = 4.2; // wave travel time, centre to past the screen edges
const WORDMARK_AT = 4.3; // wordmark rises as the wave passes the centre

const WAVE_START = -14; // vmax; negative so nothing shows before impact
const WAVE_END = 112; // vmax; beyond every screen corner at the 0.62 ellipse
const ELLIPSE = "ellipse 100vmax 62vmax at 50% 50%"; // wave front shape, wider than tall

// Skin texture from two inline SVG noises: a fine grain for pores and a very
// low frequency mottle for uneven tone. Static images, no per-frame cost.
const svgUri = (inner: string, size: number) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'><filter id='n'>${inner}</filter><rect width='${size}' height='${size}' filter='url(#n)'/></svg>`,
  )}")`;
const GRAIN = svgUri(
  "<feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.46  0 0 0 0 0.32  0 0 0 0 0.26  0 0 0 0.42 0'/>",
  320,
);
const MOTTLE = svgUri(
  "<feTurbulence type='fractalNoise' baseFrequency='0.0045' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.66  0 0 0 0 0.44  0 0 0 0 0.36  0 0 0 0.55 -0.12'/>",
  1200,
);

// Skin tones are built from Peach Dust (#FAD6C9) and Champagne Gold (#D6C5A0),
// both ratified colours, warmed and lightened so the screen stays ivory-led.
const SKIN_DULL = `${MOTTLE}, ${GRAIN}, radial-gradient(ellipse at 50% 46%, #F0DDD0 0%, #E9D0C2 65%, #E3C8B9 100%)`;
const SKIN_RADIANT = `${GRAIN}, radial-gradient(ellipse at 50% 50%, rgba(246,208,140,0.34) 0%, rgba(246,208,140,0) 55%), radial-gradient(ellipse at 50% 50%, #FCEFE3 0%, #F8E1D0 55%, #F3D6C3 100%)`;

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

  // The wave front radius, in vmax. Everything that follows the wave reads it.
  const wave = useMotionValue(WAVE_START);
  const maskInner = useTransform(wave, (v) => v - 5);
  const maskOuter = useTransform(wave, (v) => v + 5);
  const shadowAt = useTransform(wave, (v) => v - 14);
  const shadowPeak = useTransform(wave, (v) => v - 7);
  const crestAt = useTransform(wave, (v) => v);
  const crestEnd = useTransform(wave, (v) => v + 7);
  const glowMid = useTransform(wave, (v) => Math.max(v * 0.6, 0));
  const glowEnd = useTransform(wave, (v) => Math.max(v * 0.95, 0));
  const revealMask = useMotionTemplate`radial-gradient(${ELLIPSE}, #000 ${maskInner}vmax, transparent ${maskOuter}vmax)`;
  const crest = useMotionTemplate`radial-gradient(${ELLIPSE}, transparent ${shadowAt}vmax, rgba(138,84,62,0.18) ${shadowPeak}vmax, rgba(255,247,226,0.9) ${crestAt}vmax, rgba(255,247,226,0) ${crestEnd}vmax)`;
  const depth = useMotionTemplate`radial-gradient(${ELLIPSE}, rgba(226,128,100,0.34) 0vmax, rgba(226,128,100,0.2) ${glowMid}vmax, rgba(226,128,100,0) ${glowEnd}vmax)`;
  const crestOpacity = useTransform(wave, [WAVE_START, 0, 60, WAVE_END], [0, 1, 0.65, 0]);
  const depthOpacity = useTransform(wave, [WAVE_START, 0, 70, WAVE_END], [0, 1, 0.75, 0]);

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

  // The wave: one slow travel from the point of impact to past the screen
  // edges, nearly constant speed with a gentle slowing at the far end.
  useEffect(() => {
    if (phase !== "playing") return;
    wave.set(WAVE_START);
    const controls = animate(wave, WAVE_END, {
      delay: IMPACT_AT,
      duration: WAVE_S,
      ease: [0.3, 0.45, 0.55, 1],
    });
    return () => controls.stop();
  }, [phase, wave]);

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

  // Drop travel keyframes: hang, fall on a gravity curve, squash into the skin.
  const fallSpan = IMPACT_AT + 0.2;

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
          {/* Skin, before: a little uneven in tone and texture, like skin
              under a macro lens. Fades up out of the ivory. */}
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: SKIN_IN, ease: "easeOut" }}
            className="absolute inset-0"
            style={{ backgroundImage: SKIN_DULL }}
          />

          {/* Warmth beneath the surface: a soft rose-amber glow that follows
              the wave at about half its radius, so the skin seems to hold
              light below as well as on top. Glow only, never a cross-section. */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: depth, opacity: depthOpacity, mixBlendMode: "multiply" }}
          />

          {/* Skin, after: smoother, warmer, lit. Revealed from the point of
              impact outward by the same wave radius. */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ backgroundImage: SKIN_RADIANT, maskImage: revealMask, WebkitMaskImage: revealMask }}
          />

          {/* The wave front: a shallow shadow on the inside edge and a
              crest of light on the outside, which is what makes a flat image
              read as a surface moving. */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: crest, opacity: crestOpacity }}
          />

          {/* Contact shadow: the drop's shadow gathers on the skin just before
              it lands. */}
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: [0, 0, 0.5, 0], scale: [0.3, 0.3, 1, 1.5] }}
            transition={{
              duration: fallSpan + 0.4,
              times: [0, FALL_AT / (fallSpan + 0.4), IMPACT_AT / (fallSpan + 0.4), 1],
              ease: "easeOut",
            }}
            className="pointer-events-none absolute h-[2.2vmax] w-[7vmax] rounded-full"
            style={{ background: "radial-gradient(ellipse, rgba(120,70,48,0.5) 0%, rgba(120,70,48,0) 70%)" }}
          />

          {/* The serum meets the skin: the skin dips (a soft shadow), the
              gold bead spreads a little and is taken in. */}
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.2 }}
            animate={{ opacity: [0, 0.55, 0], scale: [0.2, 1, 1.25] }}
            transition={{ duration: 1.8, delay: IMPACT_AT, times: [0, 0.18, 1], ease: "easeOut" }}
            className="pointer-events-none absolute h-[6vmax] w-[9vmax] rounded-full"
            style={{ background: "radial-gradient(ellipse, rgba(150,96,66,0.5) 0%, rgba(150,96,66,0) 70%)" }}
          />
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.15 }}
            animate={{ opacity: [0, 0.95, 0.7, 0], scale: [0.15, 1, 1.1, 1.2] }}
            transition={{ duration: 2.2, delay: IMPACT_AT, times: [0, 0.14, 0.5, 1], ease: "easeOut" }}
            className="pointer-events-none absolute h-[4vmax] w-[6vmax] rounded-full"
            style={{
              background: "radial-gradient(ellipse, rgba(255,236,170,0.95) 0%, rgba(236,176,70,0.75) 38%, rgba(214,160,60,0) 72%)",
            }}
          />

          {/* The drop. Outer element does the travel: it hangs, then falls
              on a gravity curve (slow start, fast arrival), stretching as it
              speeds up, and is taken into the skin on arrival.
              transform-origin sits at the base so the squash reads as the
              drop sinking in. */}
          <motion.div
            aria-hidden="true"
            initial={{ y: "-38vh", scaleY: 1, opacity: 1 }}
            animate={{
              y: ["-38vh", "-38vh", "0vh", "0vh"],
              scaleY: [1, 1, 1.22, 0.1],
              opacity: [1, 1, 1, 0],
            }}
            transition={{
              duration: fallSpan,
              times: [0, FALL_AT / fallSpan, IMPACT_AT / fallSpan, 1],
              ease: ["linear", [0.5, 0, 0.9, 0.55], "easeOut"],
            }}
            className="absolute"
            style={{ transformOrigin: "50% 100%" }}
          >
            {/* Inner element does the swell: the drop gathers at its tip
                (origin top) before it lets go. */}
            <motion.svg
              viewBox="0 0 60 84"
              className="block h-[76px] w-[54px] overflow-visible md:h-[100px] md:w-[71px]"
              initial={{ scale: 0.25, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.1, delay: SWELL_AT, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: "50% 0%", filter: "drop-shadow(0 8px 18px rgba(154,98,8,0.4))" }}
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
              <path d="M30 2 C30 2 4 38 4 57 a26 26 0 0 0 52 0 C56 38 30 2 30 2 Z" fill="url(#hi-drop)" />
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
              wave passes, over skin that is already calm. */}
          <div aria-hidden="true" className="relative flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: WORDMARK_AT, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center leading-none"
            >
              <span className="font-serif text-3xl tracking-[0.35em] text-ink md:text-4xl">CHIAREL</span>
              <span className="mt-2 text-[10px] uppercase tracking-[0.28em] text-ochre">The House of Clarity™</span>
            </motion.div>

            <motion.p
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: WORDMARK_AT + 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 font-serif text-xl tracking-[-0.01em] text-ink/80 md:text-2xl"
            >
              Advancing Cellular Clarity™
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: WORDMARK_AT + 0.55 }}
              className="mt-4 max-w-xs text-[12px] leading-relaxed text-ink/70"
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
