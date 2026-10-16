"use client";

import { useEffect, useRef, type RefObject } from "react";
import { nextFocusIndex } from "@/lib/dialog-focus";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Behaviour a slide-in panel needs to be a real dialog:
 * - closed: the panel is `inert`, so Tab and screen readers skip it (it is
 *   only translated off-screen, not removed);
 * - open: focus moves in, Tab is trapped, Escape closes, the page behind does
 *   not scroll;
 * - on close: focus returns to the control that opened it.
 */
export function useDialog(open: boolean, panelRef: RefObject<HTMLElement>, onClose: () => void) {
  const opener = useRef<HTMLElement | null>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    (panel as HTMLElement & { inert: boolean }).inert = !open;
    if (!open) return;

    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const items = () => Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
    // Let the slide-in start before moving focus, so the browser does not scroll the panel into view.
    const t = window.setTimeout(() => items()[0]?.focus({ preventScroll: true }), 50);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const list = items();
      if (list.length === 0) return;
      const idx = list.indexOf(document.activeElement as HTMLElement);
      const atEdge = e.shiftKey ? idx <= 0 : idx === list.length - 1;
      if (atEdge || idx === -1) {
        e.preventDefault();
        list[nextFocusIndex(list.length, idx, e.shiftKey)]?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      const back = opener.current;
      opener.current = null;
      if (back && document.contains(back)) back.focus({ preventScroll: true });
    };
  }, [open, panelRef]);
}
