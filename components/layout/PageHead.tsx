import type { ReactNode } from "react";
import Container from "./Container";

/** Page head in the Focus Ladder style: a tracked eyebrow, then a poster-scale
 *  h1 whose lines step right across the 12-column grid (pass one string per
 *  line; the lines read as one sentence because a space is kept between them),
 *  then an optional intro. The grid for the page body continues below. */
export default function PageHead({
  eyebrow,
  lines,
  children,
  className = "",
}: {
  eyebrow?: string;
  lines: string[];
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header className={`pb-10 pt-14 md:pt-20 ${className}`}>
      <Container>
        <div className="grid-12 gap-y-6">
          {eyebrow && <p className="col-span-full text-eyebrow uppercase text-ochre">{eyebrow}</p>}
          <h1 className="stagger font-serif text-mega">
            {lines.map((l, i) => (
              <span key={l}>
                {l}
                {i < lines.length - 1 ? " " : ""}
              </span>
            ))}
          </h1>
          {children && (
            <div className="col-span-full mt-4 max-w-measure text-lead text-ink/80 lg:col-span-5 lg:col-start-1">
              {children}
            </div>
          )}
        </div>
      </Container>
    </header>
  );
}
