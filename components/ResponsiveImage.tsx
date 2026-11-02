"use client";

import { useCallback } from "react";
import manifest from "@/lib/image-variants.json";

// A fill-style image with a real srcSet. next/image cannot do this here: the
// site runs with images.unoptimized (no runtime resizer, so no sharp in
// production), which makes Next emit only `src`. Instead the smaller copies are
// made at rest (scripts/make-image-variants.mjs, listed in lib/image-variants.json)
// and listed here. Fill the nearest `relative` parent, like next/image `fill`.
type Entry = { width: number; widths: number[] };
const VARIANTS = manifest as Record<string, Entry>;

const variantOf = (src: string, w: number) => src.replace(/(\.[a-z0-9]+)$/i, `-${w}$1`);

export function srcSetFor(src: string): string | undefined {
  const e = VARIANTS[src];
  if (!e) return undefined;
  const set = e.widths.filter((w) => w < e.width).map((w) => `${variantOf(src, w)} ${w}w`);
  set.push(`${src} ${e.width}w`);
  return set.join(", ");
}

export default function ResponsiveImage({
  src,
  alt,
  sizes,
  className = "",
  priority = false,
  onLoad,
}: {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
  onLoad?: () => void;
}) {
  // A cached image can finish loading before React attaches onLoad; check on mount (as next/image does).
  const ref = useCallback(
    (img: HTMLImageElement | null) => {
      if (img && onLoad && img.complete && img.naturalWidth > 0) onLoad();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      srcSet={srcSetFor(src)}
      sizes={srcSetFor(src) ? sizes : undefined}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      onLoad={onLoad}
      className={`absolute inset-0 h-full w-full ${className}`}
    />
  );
}
