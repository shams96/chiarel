// Pure helper for the focus trap: where Tab / Shift+Tab should land inside a
// dialog with `count` focusable elements. Wraps at both ends.
export function nextFocusIndex(count: number, current: number, backwards: boolean): number {
  if (count <= 0) return -1;
  if (current < 0) return backwards ? count - 1 : 0;
  return backwards ? (current - 1 + count) % count : (current + 1) % count;
}
