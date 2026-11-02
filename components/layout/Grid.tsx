import type { ElementType, ReactNode } from "react";

/** 12 / 8 / 4 column grid (lg / md / base) with the shared gutter. Place
 *  children with Tailwind col-span-* and col-start-* at the matching
 *  breakpoints. Row gap is left to the caller. */
export default function Grid({
  as: Tag = "div",
  className = "",
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return <Tag className={`grid-12 ${className}`}>{children}</Tag>;
}
