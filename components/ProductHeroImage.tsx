"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { getHeroEntrance } from "@/lib/motion";

export default function ProductHeroImage({
  src,
  alt,
  step,
  badge,
}: {
  src: string;
  alt: string;
  step?: string | null;
  badge?: string;
}) {
  const reduceMotion = useReducedMotion();
  const variants = getHeroEntrance(step);

  return (
    <motion.div
      className="relative h-full w-full"
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      variants={reduceMotion ? undefined : variants}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
      />
      {badge && (
        <span className="absolute left-4 top-4 bg-ivory/90 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-ochre">
          {badge}
        </span>
      )}
    </motion.div>
  );
}
