"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { getHeroEntrance } from "@/lib/motion";
import { NEUTRAL_FRAME_BG } from "@/lib/color";
import type { ProductGalleryImage } from "@/lib/products";

// See claudedocs/specs/product-image-gallery/ for the spec/plan this
// implements. Single-image products render identically to the previous
// ProductHeroImage-only column; the thumbnail rail and swipe track only
// mount once a product actually has more than one gallery image.
export default function ProductGallery({
  images,
  step,
  badge,
}: {
  images: ProductGalleryImage[];
  step?: string | null;
  badge?: string;
}) {
  const reduceMotion = useReducedMotion();
  const variants = getHeroEntrance(step);
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const isMultiple = images.length > 1;
  const current = images[active] ?? images[0];

  // Keep `active` in sync when the visitor scroll-snaps/swipes the track
  // directly, rather than only updating it from thumbnail clicks.
  useEffect(() => {
    if (!isMultiple) return;
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const index = Math.round(track.scrollLeft / track.clientWidth);
        setActive((prev) => (prev === index ? prev : index));
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [isMultiple]);

  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(images.length - 1, index));
    setActive(clamped);
    const track = trackRef.current;
    if (track) {
      track.scrollTo({
        left: clamped * track.clientWidth,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }
  };

  return (
    <div
      role={isMultiple ? "group" : undefined}
      aria-roledescription={isMultiple ? "image gallery" : undefined}
      aria-label={isMultiple ? current.alt : undefined}
      onKeyDown={
        isMultiple
          ? (e) => {
              if (e.key === "ArrowRight") goTo(active + 1);
              if (e.key === "ArrowLeft") goTo(active - 1);
            }
          : undefined
      }
    >
      <div
        className="relative aspect-[5/4] w-full overflow-hidden md:aspect-[4/5]"
        style={{ backgroundColor: NEUTRAL_FRAME_BG }}
      >
        {isMultiple ? (
          <div
            ref={trackRef}
            className="flex h-full w-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {images.map((img, i) => (
              <div
                key={img.src}
                className="relative h-full w-full flex-none snap-start"
                aria-hidden={i !== active}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  onLoad={i === 0 ? () => setLoaded(true) : undefined}
                />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            className="relative h-full w-full"
            initial={reduceMotion ? false : "hidden"}
            animate={loaded ? "visible" : "hidden"}
            variants={reduceMotion ? undefined : variants}
          >
            <Image
              src={current.src}
              alt={current.alt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              onLoad={() => setLoaded(true)}
            />
          </motion.div>
        )}

        {badge && (
          <span className="absolute left-4 top-4 bg-ivory/90 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-ochre">
            {badge}
          </span>
        )}

        {/* Screen-reader-only status so a non-visual visitor knows which
            image is active without relying on the thumbnail's visual state. */}
        {isMultiple && (
          <span aria-live="polite" className="sr-only">
            Image {active + 1} of {images.length}: {current.alt}
          </span>
        )}
      </div>

      {isMultiple && (
        <div className="mt-3 flex gap-2">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => goTo(i)}
              aria-current={i === active}
              aria-label={`View image ${i + 1} of ${images.length}: ${img.alt}`}
              className={`relative h-16 w-16 flex-none overflow-hidden border transition-colors ${
                i === active ? "border-ochre" : "border-ink/15 hover:border-champagne"
              }`}
              style={{ backgroundColor: NEUTRAL_FRAME_BG }}
            >
              <Image src={img.src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
