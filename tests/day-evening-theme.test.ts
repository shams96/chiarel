// Day / Evening theme (claudedocs/specs/day-evening-theme/SPEC-AND-PLAN.md).
// Pins: Day is the default and unchanged, Evening keeps WCAG AA, the toggle is accessible and
// remembered without a flash, overlays stay dark, and the crossfade honours reduced motion.
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { THEME_INIT_SCRIPT, THEME_KEY } from "@/lib/theme";

const css = readFileSync("app/globals.css", "utf8");
const tw = readFileSync("tailwind.config.ts", "utf8");

function block(selector: RegExp): Record<string, number[]> {
  const body = css.match(selector)?.[1] ?? "";
  const out: Record<string, number[]> = {};
  for (const m of body.matchAll(/--c-([a-z]+):\s*(\d+) (\d+) (\d+);/g)) out[m[1]] = [+m[2], +m[3], +m[4]];
  return out;
}
const day = block(/\n:root,\s*\[data-theme="light"\],[\s\S]*?\{([^}]*)\}/);
const evening = block(/\n\[data-theme="dark"\] \{([^}]*)\}/);

const lin = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = ([r, g, b]: number[]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a: number[], b: number[]) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe("tokens", () => {
  it("every Tailwind brand colour is a theme variable with alpha support", () => {
    for (const t of ["cloud", "ochre", "garden", "peach", "ocean", "champagne", "ivory", "white", "ink", "peachdust", "scrim"]) {
      expect(tw, t).toContain(`${t}: "rgb(var(--c-${t}) / <alpha-value>)"`);
    }
  });

  it("Day is the brand palette exactly", () => {
    expect(day.ink).toEqual([29, 29, 31]); // #1D1D1F
    expect(day.cloud).toEqual([245, 245, 247]); // #F5F5F7
    expect(day.ochre).toEqual([155, 71, 34]); // #9B4722
    expect(day.garden).toEqual([31, 81, 41]); // #1F5129
    expect(day.champagne).toEqual([214, 197, 160]); // #D6C5A0
  });

  it("Evening defines every token Day defines", () => {
    expect(Object.keys(evening).sort()).toEqual(Object.keys(day).sort());
  });

  it("Evening text and accents meet WCAG AA on the Evening page and raised surface", () => {
    for (const bg of [evening.cloud, evening.ivory]) {
      for (const fg of ["ink", "ochre", "garden", "champagne"] as const) {
        expect(ratio(evening[fg], bg), `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("Evening fills keep AA with the inverted text token (button pairs)", () => {
    expect(ratio(evening.ivory, evening.ochre)).toBeGreaterThanOrEqual(4.5); // text-ivory on bg-ochre
    expect(ratio(evening.cloud, evening.ochre)).toBeGreaterThanOrEqual(4.5); // text-cloud on bg-ochre
    expect(ratio(evening.cloud, evening.ink)).toBeGreaterThanOrEqual(4.5); // text-ivory/cloud on bg-ink
  });

  it("overlay veils use the scrim token, which stays dark in both themes", () => {
    expect(evening.scrim).toEqual([0, 0, 0]);
    for (const f of ["components/Header.tsx", "components/CartDrawer.tsx"]) {
      const s = readFileSync(f, "utf8");
      expect(s, f).toContain("bg-scrim/40");
      expect(s, f).not.toContain("bg-ink/40");
    }
  });
});

describe("no flash, no surprise dark", () => {
  const run = (stored: string | null, path = "/shop") => {
    const attrs: Record<string, string> = {};
    const doc = { documentElement: { setAttribute: (k: string, v: string) => (attrs[k] = v) } };
    const ls = { getItem: (k: string) => (k === THEME_KEY ? stored : null) };
    new Function("document", "localStorage", "location", THEME_INIT_SCRIPT)(doc, ls, { pathname: path });
    return attrs["data-theme"];
  };
  it("Day unless the visitor chose Evening", () => {
    expect(run(null)).toBe("light");
    expect(run("light")).toBe("light");
    expect(run("dark")).toBe("dark");
    expect(run("garbage")).toBe("light");
  });
  it("never follows the operating system (no matchMedia)", () => {
    expect(THEME_INIT_SCRIPT).not.toContain("matchMedia");
  });
  it("the admin console is always Day", () => {
    expect(run("dark", "/admin")).toBe("light");
    expect(run("dark", "/admin/orders")).toBe("light");
    expect(run("dark", "/account")).toBe("dark");
  });
  it("blocked storage falls back to Day", () => {
    const attrs: Record<string, string> = {};
    const throwing = {
      getItem: () => {
        throw new Error("blocked");
      },
    };
    new Function("document", "localStorage", "location", THEME_INIT_SCRIPT)(
      { documentElement: { setAttribute: (k: string, v: string) => (attrs[k] = v) } },
      throwing,
      { pathname: "/" },
    );
    expect(attrs["data-theme"]).toBe("light");
  });
  it("the script runs in <head> before the body", () => {
    const layout = readFileSync("app/layout.tsx", "utf8");
    expect(layout.indexOf("THEME_INIT_SCRIPT }}")).toBeLessThan(layout.indexOf("<body"));
    expect(layout).toContain("suppressHydrationWarning");
  });
});

describe("toggle and motion", () => {
  const toggle = readFileSync("components/ThemeToggle.tsx", "utf8");
  it("is an accessible, 44px, pressed-state button in the header", () => {
    expect(toggle).toContain("aria-pressed={evening}");
    expect(toggle).toContain('"Switch to Evening"');
    expect(toggle).toContain('"Switch to Day"');
    expect(toggle).toContain("h-11 w-11");
    expect(readFileSync("components/Header.tsx", "utf8")).toContain("<ThemeToggle />");
  });
  it("glyph swap is 300ms on the house easing and respects reduced motion", () => {
    expect(toggle).toContain("duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none");
  });
  it("the theme crossfade is 650ms cubic-bezier(0.4,0,0.2,1) and off for reduced motion", () => {
    expect(css).toMatch(/html\.theme-fade[\s\S]*?background-color 650ms cubic-bezier\(0\.4, 0, 0\.2, 1\)/);
    expect(css).toMatch(/prefers-reduced-motion: reduce\) \{\s*html\.theme-fade[\s\S]*?transition: none !important/);
    expect(readFileSync("lib/theme.ts", "utf8")).toContain("700)");
  });
});

describe("logos", () => {
  it("each header logo has a cloud-coloured Evening twin", () => {
    for (const f of ["chiarel-header-wordmark", "chiarel-header-house"]) {
      expect(existsSync(`public/assets/brand/logo/${f}-ink-v2.png`)).toBe(true);
      expect(existsSync(`public/assets/brand/logo/${f}-cloud-v2.png`)).toBe(true);
    }
    expect(css).toContain('[data-theme="dark"] .logo-day { display: none; }');
  });
});

describe("opulence in Evening", () => {
  it("solid terracotta and green fills keep their Day jewel palette (no pastel blocks)", () => {
    expect(css).toMatch(/\[data-theme="dark"\] \.bg-ochre,\s*\[data-theme="dark"\] \.bg-garden \{\s*--c-ink: 29 29 31;/);
  });
  it("Evening hairlines are champagne gold", () => {
    expect(evening.soft).toEqual(evening.champagne);
    expect(css).toMatch(/\[data-theme="dark"\] \.border-ink\\\/10,[\s\S]*?border-color: rgb\(var\(--c-champagne\) \/ 0\.28\)/);
  });
  it("the page is a warm espresso, not neutral grey", () => {
    const [r, , b] = evening.cloud;
    expect(r).toBeGreaterThan(b); // warm: red above blue
    expect(lum(evening.cloud)).toBeLessThan(0.01);
  });
  it("the toggle opens the new theme as a circle (View Transitions) over 900ms, with a fallback", () => {
    const t = readFileSync("lib/theme.ts", "utf8");
    expect(t).toContain("startViewTransition");
    expect(t).toContain("duration: 900");
    expect(t).toContain('easing: "cubic-bezier(0.22, 1, 0.36, 1)"');
    expect(t).toContain("prefers-reduced-motion: reduce");
    expect(t).toContain('d.classList.add("theme-fade")'); // fallback path
    expect(css).toContain("::view-transition-new(root)");
  });
});
