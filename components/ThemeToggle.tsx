"use client";

import { useEffect, useState } from "react";
import { applyTheme, readTheme, type Theme } from "@/lib/theme";

// Day / Evening toggle for the header. Two hairline glyphs (a sun and a crescent) crossfade
// with a quarter turn over 300ms on cubic-bezier(0.16,1,0.3,1), the same motion the menu
// button uses (the MotionSites "Stillmind" icon swap: rotate out 90deg and scale to 75%,
// the next rotates in). Press feedback comes from .btn-press. Reduced motion: no turn.
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => setTheme(readTheme()), []);
  const evening = theme === "dark";
  const glyph =
    "absolute inset-0 m-auto h-[22px] w-[22px] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none";
  return (
    <button
      type="button"
      onClick={(e) => {
        const b = e.currentTarget.getBoundingClientRect();
        setTheme(applyTheme(evening ? "light" : "dark", { x: b.left + b.width / 2, y: b.top + b.height / 2 }));
      }}
      aria-label={evening ? "Switch to Day" : "Switch to Evening"}
      aria-pressed={evening}
      title={evening ? "Day" : "Evening"}
      className="btn-press relative inline-flex h-11 w-11 items-center justify-center text-ink transition hover:text-ochre"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        aria-hidden="true"
        className={`${glyph} ${evening ? "rotate-90 scale-75 opacity-0" : "opacity-100"}`}
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M18 6l-1.4 1.4M7.4 16.6 6 18" />
      </svg>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={`${glyph} ${evening ? "opacity-100" : "-rotate-90 scale-75 opacity-0"}`}
      >
        <path d="M19.5 14.2A8 8 0 0 1 9.8 4.5a8 8 0 1 0 9.7 9.7Z" />
      </svg>
    </button>
  );
}
