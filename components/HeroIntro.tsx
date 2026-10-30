"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, motion, useMotionTemplate, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import Image from "next/image";

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

const HOLD_MS = 6800; // mount to the start of the exit fade
const EXIT_MS = 500; // overlay fade-out duration

// Timeline (seconds from mount)
const SKIN_IN = 1.1; // skin fades up out of the ivory
const SWELL_AT = 0.25; // drop forms at the top
const FALL_AT = 0.45; // drop lets go while it is still forming: no hang
const IMPACT_AT = 2.3; // drop meets the skin
const WAVE_S = 4.2; // wave travel time, centre to past the screen edges
const WORDMARK_AT = 4.1; // wordmark rises as the wave passes the centre
const ECHO_DELAY = 0.5; // the second, fainter wave trails the first by this much
const PUSH_IN_S = 6; // slow camera push-in over the whole sequence

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
const SKIN_RADIANT = `${GRAIN}, radial-gradient(ellipse at 50% 50%, rgba(246,208,140,0.44) 0%, rgba(246,208,140,0) 62%), radial-gradient(ellipse at 50% 50%, #FDF2E8 0%, #F9E4D4 55%, #F4D9C7 100%)`;

// Lighting over the whole skin stack: a soft key light from the upper left, a
// gentle vignette, and a slow sheen that drifts across, so the skin reads as a
// lit surface under a camera, not a flat fill.
const KEY_LIGHT = "radial-gradient(ellipse 85% 75% at 26% 14%, rgba(255,250,242,0.55) 0%, rgba(255,250,242,0) 62%)";
const VIGNETTE = "radial-gradient(ellipse 75% 70% at 50% 50%, rgba(120,76,58,0) 55%, rgba(120,76,58,0.2) 100%)";
const SHEEN = "linear-gradient(112deg, rgba(255,248,236,0) 36%, rgba(255,248,236,0.3) 50%, rgba(255,248,236,0) 64%)";

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
  const crestIn = useTransform(wave, (v) => v - 1.4);
  const crestOut = useTransform(wave, (v) => v + 1.4);
  const glowMid = useTransform(wave, (v) => Math.max(v * 0.6, 0));
  const glowEnd = useTransform(wave, (v) => Math.max(v * 0.95, 0));
  const revealMask = useMotionTemplate`radial-gradient(${ELLIPSE}, #000 ${maskInner}vmax, transparent ${maskOuter}vmax)`;
  const crest = useMotionTemplate`radial-gradient(${ELLIPSE}, transparent ${shadowAt}vmax, rgba(138,84,62,0.18) ${shadowPeak}vmax, rgba(255,247,226,0.9) ${crestIn}vmax, rgba(255,255,255,0.95) ${crestAt}vmax, rgba(255,247,226,0.8) ${crestOut}vmax, rgba(255,247,226,0) ${crestEnd}vmax)`;
  const depth = useMotionTemplate`radial-gradient(${ELLIPSE}, rgba(226,128,100,0.34) 0vmax, rgba(226,128,100,0.2) ${glowMid}vmax, rgba(226,128,100,0) ${glowEnd}vmax)`;
  // The echo: a second, fainter wave that trails the first.
  const echo = useMotionValue(WAVE_START);
  const echoShadow = useTransform(echo, (v) => v - 10);
  const echoPeak = useTransform(echo, (v) => v - 5);
  const echoCrest = useTransform(echo, (v) => v);
  const echoEnd = useTransform(echo, (v) => v + 6);
  const echoBand = useMotionTemplate`radial-gradient(${ELLIPSE}, transparent ${echoShadow}vmax, rgba(138,84,62,0.08) ${echoPeak}vmax, rgba(255,247,226,0.55) ${echoCrest}vmax, rgba(255,247,226,0) ${echoEnd}vmax)`;
  const echoOpacity = useTransform(echo, [WAVE_START, 0, 60, WAVE_END], [0, 0.85, 0.45, 0]);
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
    echo.set(WAVE_START);
    const controls = animate(wave, WAVE_END, {
      delay: IMPACT_AT,
      duration: WAVE_S,
      ease: [0.3, 0.45, 0.55, 1],
    });
    const echoControls = animate(echo, WAVE_END, {
      delay: IMPACT_AT + ECHO_DELAY,
      duration: WAVE_S,
      ease: [0.3, 0.45, 0.55, 1],
    });
    return () => {
      controls.stop();
      echoControls.stop();
    };
  }, [phase, wave, echo]);

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

  // Gravity: distance grows with the square of time, so the drop is moving the
  // moment it lets go and arrives fast. One curve for the whole fall.
  const GRAVITY = [0.55, 0.085, 0.68, 0.53] as const;
  const squashSpan = IMPACT_AT + 0.2;

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
          {/* The skin and everything that moves across it sit in one layer
              that pushes in slowly (a camera settling), about the centre so the
              point of impact never moves. */}
          <motion.div
            aria-hidden="true"
            initial={{ scale: 1.07 }}
            animate={{ scale: 1 }}
            transition={{ duration: PUSH_IN_S, ease: [0.22, 0.6, 0.3, 1] }}
            className="absolute inset-0 will-change-transform"
          >
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

            {/* The echo: a second, fainter wave trailing the first. */}
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ backgroundImage: echoBand, opacity: echoOpacity }}
            />

            {/* Lighting: key light from the upper left, a vignette, and a
                slow sheen drifting across the skin. */}
            <motion.div
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: SKIN_IN + 0.4, ease: "easeOut" }}
              className="pointer-events-none absolute inset-0"
              style={{ backgroundImage: `${KEY_LIGHT}, ${VIGNETTE}` }}
            />
            <motion.div
              aria-hidden="true"
              initial={{ x: "-14%", opacity: 0 }}
              animate={{ x: "14%", opacity: 1 }}
              transition={{ duration: PUSH_IN_S + 1, ease: "linear", opacity: { duration: 1.6 } }}
              className="pointer-events-none absolute -inset-x-[20%] inset-y-0"
              style={{ backgroundImage: SHEEN }}
            />
          </motion.div>

          {/* Contact shadow: the drop's shadow gathers on the skin just before
              it lands. */}
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: [0, 0, 0.5, 0], scale: [0.3, 0.3, 1, 1.5] }}
            transition={{
              duration: squashSpan + 0.4,
              times: [0, FALL_AT / (squashSpan + 0.4), IMPACT_AT / (squashSpan + 0.4), 1],
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

          {/* Light cast by the drop: as it nears, a warm gold light gathers on
              the skin beneath it (a reflection), and releases at impact. */}
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: [0, 0, 0.55, 0], scale: [0.4, 0.4, 1, 1.4] }}
            transition={{
              duration: squashSpan + 0.8,
              times: [0, FALL_AT / (squashSpan + 0.8), IMPACT_AT / (squashSpan + 0.8), 1],
              ease: "easeOut",
            }}
            className="pointer-events-none absolute h-[16vmax] w-[26vmax] rounded-full"
            style={{ background: "radial-gradient(ellipse, rgba(255,226,150,0.55) 0%, rgba(240,190,90,0.22) 40%, rgba(240,190,90,0) 70%)" }}
          />

          {/* Impact rings: two thin gold rings leave the point of contact before
              the large wave, so the touch has weight. */}
          {[0, 0.14].map((d, i) => (
            <motion.div
              key={i}
              aria-hidden="true"
              initial={{ opacity: 0, scale: 0.15 }}
              animate={{ opacity: [0, 0.9 - i * 0.3, 0], scale: [0.15, 1, 1.5] }}
              transition={{ duration: 1.3, delay: IMPACT_AT + d, times: [0, 0.2, 1], ease: "easeOut" }}
              className="pointer-events-none absolute h-[7vmax] w-[11vmax] rounded-full"
              style={{ border: "1.5px solid rgba(232,184,84,0.9)", boxShadow: "0 0 14px rgba(240,196,100,0.5)" }}
            />
          ))}

          {/* The drop. The outer element only travels: one continuous fall
              on a gravity curve from the moment it lets go (no hold, no
              change of curve mid-fall), so the motion reads as smooth.
              The middle element does the stretch and the squash into the
              skin, with its base as the pivot so the squash reads as the drop
              sinking in. */}
          <motion.div
            aria-hidden="true"
            initial={{ y: "-34vh" }}
            animate={{ y: "0vh" }}
            transition={{ delay: FALL_AT, duration: IMPACT_AT - FALL_AT, ease: GRAVITY }}
            className="absolute will-change-transform"
          >
            <motion.div
              initial={{ scaleY: 1, opacity: 1 }}
              animate={{ scaleY: [1, 1, 1.18, 0.12], opacity: [1, 1, 1, 0] }}
              transition={{
                duration: squashSpan,
                times: [0, FALL_AT / squashSpan, IMPACT_AT / squashSpan, 1],
                ease: ["linear", GRAVITY, "easeOut"],
              }}
              style={{ transformOrigin: "50% 100%" }}
            >
            {/* Inner element does the swell: the drop gathers at its tip
                (origin top) before it lets go. */}
            <motion.svg
              viewBox="0 0 60 84"
              className="block h-[98px] w-[70px] overflow-visible md:h-[130px] md:w-[92px]"
              initial={{ scale: 0.25, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.9, delay: SWELL_AT, ease: [0.16, 1, 0.3, 1] }}
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
              <Image
                src="/assets/brand/logo/chiarel-intro-house-ink.png"
                alt=""
                width={760}
                height={179}
                priority
                className="h-auto w-[250px] md:w-[320px]"
              />
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
