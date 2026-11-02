"use client";

import { useEffect, useState } from "react";

// Visible 12 / 8 / 4 column guides, hidden by default. Press G (not while
// typing in a field) to show or hide them: a designer's wink, the Swiss
// grid made visible. Decorative, aria-hidden, never captures pointer events.
/** True for a bare G key press that is not aimed at a form field or editable text. */
export function isGridToggle(e: {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  target?: { tagName?: string; isContentEditable?: boolean } | null;
}): boolean {
  if (e.key !== "g" && e.key !== "G") return false;
  if (e.metaKey || e.ctrlKey || e.altKey) return false;
  const t = e.target;
  if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return false;
  return true;
}

export default function GridGuides() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isGridToggle({ key: e.key, metaKey: e.metaKey, ctrlKey: e.ctrlKey, altKey: e.altKey, target: e.target as HTMLElement | null })) setOn((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  if (!on) return null;
  return (
    <div className="grid-guides" aria-hidden="true" data-grid-guides>
      <div className="mx-auto h-full w-full max-w-container px-margin">
        <div className="grid-12 h-full">
          {Array.from({ length: 12 }, (_, i) => (
            <i key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
