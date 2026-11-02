import type { ReactNode } from "react";

type Level = "display" | "h1" | "h2" | "h3" | "h4";

const SIZE: Record<Level, string> = {
  display: "text-display",
  h1: "text-h1",
  h2: "text-h2",
  h3: "text-h3",
  h4: "text-h4",
};

/** Heading with the type-scale token for its visual level. `as` sets the
 *  semantic element independently of the look (keep one h1 per page). */
export default function Heading({
  level = "h2",
  as,
  id,
  className = "",
  children,
}: {
  level?: Level;
  as?: "h1" | "h2" | "h3" | "h4";
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  const Tag = as ?? (level === "display" ? "h1" : level);
  return (
    <Tag id={id} className={`font-serif ${SIZE[level]} ${className}`}>
      {children}
    </Tag>
  );
}
