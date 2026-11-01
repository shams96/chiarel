"use client";

import { useEffect, useRef, useState } from "react";
import ResponsiveImage from "@/components/ResponsiveImage";
import { motion, useReducedMotion } from "framer-motion";
import { getHeroEntrance } from "@/lib/motion";
import { NEUTRAL_FRAME_BG } from "@/lib/color";
import type { ProductGalleryImage } from "@/lib/products";

// See claudedocs/specs/product-image-gallery/ for the spec/plan this
// implements. Single-image products render as one hero image; the thumbnail
// rail and swipe track only mount once a product actually has more than one
// gallery image.
// Studio shots are 4:5 with the product in the middle band. On phones the
// frame is 5:4, so anchor the crop high enough to keep the whole product.
const studioFit = (img: ProductGalleryImage) =>
  img.role === "studio" ? "object-[50%_95%] md:object-center" : "";

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
              const keys: Record<string, number> = {
                ArrowRight: active + 1,
                ArrowLeft: active - 1,
                Home: 0,
                End: images.length - 1,
              };
              if (e.key in keys) {
                // Stop the focused scroll track also scrolling natively.
                e.preventDefault();
                goTo(keys[e.key]);
              }
            }
          : undefined
      }
    >
      {/* Fixed aspect ratio reserves the space before any image loads, so the
          gallery never shifts the buy box (no CLS). tabIndex makes the
          swipe track reachable by keyboard: arrows, Home and End change image. */}
      <div
        className="relative aspect-[5/4] w-full overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ochre md:aspect-[4/5]"
        style={{ backgroundColor: NEUTRAL_FRAME_BG }}
        tabIndex={isMultiple ? 0 : undefined}
      >
        {isMultiple ? (
          <div
            ref={trackRef}
            className="flex h-full w-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {images.map((img, i) => (
              <div
                key={img.src}
                className="relative h-full w-full flex-none snap-start snap-always"
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${images.length}`}
                aria-hidden={i !== active}
              >
                <ResponsiveImage
                  src={img.src}
                  alt={img.alt}
                  priority={i === 0}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={`object-cover ${studioFit(img)}`}
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
            <ResponsiveImage
              src={current.src}
              alt={current.alt}
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className={`object-cover ${studioFit(current)}`}
              onLoad={() => setLoaded(true)}
            />
          </motion.div>
        )}

        {badge && (
          <span className="absolute left-4 top-4 bg-ivory/90 px-3 py-1 text-[12px] uppercase tracking-[0.18em] text-ochre">
            {badge}
          </span>
        )}

        {/* Phones: swipe, with tappable position dots (44px-tall hit areas)
            instead of a thumbnail rail, which would push the buy box below
            the first screen. md+ uses the thumbnail rail below. */}
        {isMultiple && (
          <div className="absolute inset-x-0 bottom-1 flex justify-center md:hidden">
           <div className="flex rounded-full bg-ivory/85 px-1">
            {images.map((img, i) => (
              <button
                key={img.src}
                type="button"
                onClick={() => goTo(i)}
                aria-current={i === active}
                aria-label={`Show image ${i + 1} of ${images.length}`}
                className="flex h-11 w-11 items-center justify-center"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all ${
                    i === active ? "w-5 bg-ochre" : "w-1.5 bg-ink/35"
                  }`}
                />
              </button>
            ))}
           </div>
          </div>
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
        <div className="mt-3 hidden gap-2 overflow-x-auto p-1 [scrollbar-width:none] md:flex [&::-webkit-scrollbar]:hidden">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => goTo(i)}
              aria-current={i === active}
              aria-label={`View image ${i + 1} of ${images.length}: ${img.alt}`}
              className={`relative h-16 w-16 flex-none overflow-hidden border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ochre ${
                i === active ? "border-ochre" : "border-ink/15 hover:border-champagne"
              }`}
              style={{ backgroundColor: NEUTRAL_FRAME_BG }}
            >
              <ResponsiveImage src={img.src} alt="" sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
