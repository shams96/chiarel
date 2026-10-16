// Arrow-key behaviour for a role="radiogroup" (WAI-ARIA radio pattern): the
// arrows move the selection and wrap, Home/End jump to the ends. Returns the
// index to select, or null when the key is not one the group handles.
export function radioTargetIndex(count: number, current: number, key: string): number | null {
  if (count <= 0) return null;
  switch (key) {
    case "ArrowDown":
    case "ArrowRight":
      return (current + 1) % count;
    case "ArrowUp":
    case "ArrowLeft":
      return (current - 1 + count) % count;
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return null;
  }
}
