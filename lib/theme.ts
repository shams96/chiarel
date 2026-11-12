// Day / Evening theme (docs: claudedocs/specs/day-evening-theme/SPEC-AND-PLAN.md).
// Day is the default for every visitor. Evening applies only when the visitor chose it with
// the header toggle; the choice is stored in localStorage (a per-visitor convenience, never
// required: with storage blocked the site simply stays on Day).
export const THEME_KEY = "chiarel-theme";
export type Theme = "light" | "dark";

// Runs inline in <head> before first paint so Evening never flashes Day. The admin console
// is always Day. Written as a string because it must execute before React hydrates.
export const THEME_INIT_SCRIPT = `(function(){var d=document.documentElement,t="light";try{if(localStorage.getItem("${THEME_KEY}")==="dark"&&location.pathname.indexOf("/admin")!==0)t="dark"}catch(e){}d.setAttribute("data-theme",t)})();`;

export function readTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

// Switch theme. With View Transitions the new theme opens as a circle from `origin` (the toggle)
// over 900ms on cubic-bezier(0.22,1,0.36,1); otherwise (or with reduced motion) the 650ms
// colour crossfade runs (CSS class on <html>, see globals.css). Remembers the choice.
// Returns the new theme.
export function applyTheme(next: Theme, origin?: { x: number; y: number }): Theme {
  const d = document.documentElement;
  const commit = () => {
    d.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* storage blocked: the choice lasts for this page view only */
    }
  };
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const start = (document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } })
    .startViewTransition;
  if (start && origin && !reduce) {
    const { x, y } = origin;
    const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const vt = start.call(document, commit);
    vt.ready
      .then(() =>
        d.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
          { duration: 900, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" },
        ),
      )
      .catch(() => {});
    return next;
  }
  d.classList.add("theme-fade");
  commit();
  window.setTimeout(() => d.classList.remove("theme-fade"), 700);
  return next;
}
