import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
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
