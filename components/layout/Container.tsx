import type { ElementType, ReactNode } from "react";

/** The one page container: shared max width and side margin (see :root in
 *  globals.css), so header, sections and footer align at every width. */
export default function Container({
  as: Tag = "div",
  className = "",
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return <Tag className={`mx-auto w-full max-w-container px-margin ${className}`}>{children}</Tag>;
}
