import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cloud: "#F0F2EB",
        ochre: "#9B4722",
        garden: "#1F5129",
        peach: "#FAD6C9",
        ocean: "#0C2D38",
        champagne: "#D6C5A0",
        ivory: "#F8F6F1",
        ink: "#1C1A17",
        // Home hero, Face/Beyond panels and closing band palette. garden,
        // champagne, ivory and ink above already match it exactly; ochre and
        // peach differ, so these two are separate tokens (do not repoint the
        // sitewide ones).
        redochre: "#913832",
        peachdust: "#F0D8CC",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.3em",
      },
    },
  },
  plugins: [],
};
export default config;
