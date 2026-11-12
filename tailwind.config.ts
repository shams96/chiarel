import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // Colours are CSS variables (RGB triplets, values in globals.css) so Day and
      // Evening share every class; `<alpha-value>` keeps opacity utilities (ink/15) working.
      // Day values are the brand hexes: ink #1D1D1F, cloud #F5F5F7, ochre #9B4722, garden #1F5129.
      colors: {
        cloud: "rgb(var(--c-cloud) / <alpha-value>)",
        ochre: "rgb(var(--c-ochre) / <alpha-value>)",
        garden: "rgb(var(--c-garden) / <alpha-value>)",
        peach: "rgb(var(--c-peach) / <alpha-value>)",
        ocean: "rgb(var(--c-ocean) / <alpha-value>)",
        champagne: "rgb(var(--c-champagne) / <alpha-value>)",
        ivory: "rgb(var(--c-ivory) / <alpha-value>)",
        white: "rgb(var(--c-white) / <alpha-value>)",
        ink: "rgb(var(--c-ink) / <alpha-value>)",
        peachdust: "rgb(var(--c-peachdust) / <alpha-value>)",
        // Overlay veils behind drawers and menus: stay dark in both themes.
        scrim: "rgb(var(--c-scrim) / <alpha-value>)",
      },
      // One family, site-wide. `sans` is an alias of `serif` so classes that
      // name either resolve to Libre Bodoni.
      fontFamily: {
        serif: ["var(--font-serif)", "serif"],
        sans: ["var(--font-serif)", "serif"],
      },
      letterSpacing: {
        widest2: "0.3em",
        eyebrow: "0.16em",
      },
      // Type scale (brief section 3). Floor for any text is 12px; tracked
      // uppercase labels use `eyebrow`. Sizes are Libre Bodoni, differentiated
      // by size, weight, line height and tracking only.
      fontSize: {
        eyebrow: ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.16em", fontWeight: "500" }],
        caption: ["0.8125rem", { lineHeight: "1.5" }],
        body: ["1.0625rem", { lineHeight: "1.65" }],
        lead: ["1.25rem", { lineHeight: "1.55" }],
        h4: ["1.25rem", { lineHeight: "1.3" }],
        h3: ["1.75rem", { lineHeight: "1.2", letterSpacing: "-0.005em" }],
        h2: ["clamp(2rem, 1.4rem + 2vw, 2.75rem)", { lineHeight: "1.12", letterSpacing: "-0.01em" }],
        h1: ["clamp(2.5rem, 1.6rem + 3.4vw, 4rem)", { lineHeight: "1.06", letterSpacing: "-0.015em" }],
        display: ["clamp(3rem, 1.8rem + 5vw, 5.5rem)", { lineHeight: "1.02", letterSpacing: "-0.02em" }],
        // Focus Ladder direction (Phase 7): poster-scale display and numerals.
        mega: ["clamp(2.5rem, 1.1rem + 6.2vw, 6.5rem)", { lineHeight: "1.02", letterSpacing: "-0.02em" }],
        "numeral-sm": ["clamp(3.5rem, 2rem + 4vw, 6rem)", { lineHeight: "0.85", letterSpacing: "-0.03em" }],
      },
      // One container and one gutter system (values live in globals.css :root).
      maxWidth: {
        container: "var(--container)",
        measure: "36rem",
      },
      spacing: {
        margin: "var(--margin)",
        gutter: "var(--gutter)",
        section: "var(--section-y)",
      },
      borderColor: {
        hairline: "rgb(var(--c-ink) / 0.15)",
      },
    },
  },
  plugins: [],
};
export default config;
