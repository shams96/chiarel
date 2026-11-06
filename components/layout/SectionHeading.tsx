import type { ReactNode } from "react";
import Heading from "./Heading";

/** The one section heading: a thin ochre rule, the h2 type-scale token in ochre,
 *  an optional italic subhead and an optional lead line. Same look on the homepage
 *  and inner pages (owner standard, 2026-11-06). Libre Bodoni throughout; sizes
 *  come from the tokens in tailwind.config.ts, never from ad hoc clamp() values. */
export default function SectionHeading({
  id,
  as = "h2",
  subhead,
  lead,
  rule = true,
  className = "",
  children,
}: {
  id?: string;
  as?: "h1" | "h2" | "h3";
  subhead?: ReactNode;
  lead?: ReactNode;
  rule?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`${rule ? "border-t border-ochre pt-7" : ""} ${className}`}>
      <Heading level="h2" as={as} id={id} className="text-ochre">
        {children}
      </Heading>
      {subhead && <p className="mt-3 font-serif text-lead italic">{subhead}</p>}
      {lead && <p className="mt-4 text-body">{lead}</p>}
    </div>
  );
}
