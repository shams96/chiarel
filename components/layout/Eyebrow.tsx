import type { ReactNode } from "react";

/** Small tracked uppercase label. One size (12px floor), one tracking value
 *  and weight: replaces the ad hoc text-[11px] tracking-[..] variants. */
export default function Eyebrow({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <p className={`text-eyebrow uppercase ${className}`}>{children}</p>;
}
