import type { ReactNode } from "react";
import Container from "./Container";

/** A page section: token vertical rhythm, optional hairline divider above,
 *  content held in the shared container. Pass `bleed` to render children
 *  full width and manage the container yourself. */
export default function Section({
  id,
  rule = false,
  bleed = false,
  className = "",
  labelledBy,
  children,
}: {
  id?: string;
  rule?: boolean;
  bleed?: boolean;
  className?: string;
  labelledBy?: string;
  children: ReactNode;
}) {
  const base = `section-token ${rule ? "section-rule" : ""} ${className}`;
  return (
    <section id={id} aria-labelledby={labelledBy} className={base}>
      {bleed ? children : <Container>{children}</Container>}
    </section>
  );
}
