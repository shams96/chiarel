#!/usr/bin/env node
// Regenerate the smaller copies (640w, 960w) of the images listed in
// lib/image-variants.json. The site serves files as-is (images.unoptimized), so
// responsive sizes are made here, at rest, and <ResponsiveImage> lists them in
// srcSet. publish-images.mjs calls this for any replaced image, so a variant can
// never be older than its source.
//
//   npm run make:variants            refresh variants older than their source
//   npm run make:variants -- --force rebuild all of them
import { createRequire } from "node:module";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, parse } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = join(ROOT, "lib", "image-variants.json");

export const variantPath = (src, w) => {
  const { dir, name, ext } = parse(src);
  return `${dir}/${name}-${w}${ext}`;
};

export const manifest = () => JSON.parse(readFileSync(MANIFEST, "utf8"));

/** Make the variants of one source ("/assets/..." as listed in the manifest). Returns the public-relative files written. */
export async function makeVariants(src, { force = false } = {}) {
  const entry = manifest()[src];
  if (!entry) return [];
  const widths = entry.widths;
  const sharp = createRequire(join(ROOT, "package.json"))("sharp");
  const abs = join(ROOT, "public", src);
  if (!existsSync(abs)) throw new Error(`missing source: public${src}`);
  const meta = await sharp(abs).metadata();
  if (entry.width !== meta.width) {
    // the source was replaced by a different size: keep the srcSet descriptor honest
    const all = manifest();
    all[src].width = meta.width;
    writeFileSync(MANIFEST, JSON.stringify(all, null, 2) + "\n");
    console.log(`updated lib/image-variants.json width for ${src}: ${entry.width} -> ${meta.width} (commit this file)`);
  }
  const written = [];
  for (const w of widths) {
    if (meta.width <= w) continue;
    const rel = variantPath(src, w);
    const out = join(ROOT, "public", rel);
    if (!force && existsSync(out) && statSync(out).mtimeMs >= statSync(abs).mtimeMs) continue;
    await sharp(abs).resize({ width: w }).jpeg({ quality: 78, mozjpeg: true, progressive: true }).toFile(out);
    written.push(`public${rel}`);
  }
  return written;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const force = process.argv.includes("--force");
  let n = 0;
  for (const src of Object.keys(manifest())) {
    const w = await makeVariants(src, { force });
    w.forEach((f) => console.log("wrote", f));
    n += w.length;
  }
  console.log(n ? `${n} variant(s) written.` : "All variants are up to date.");
}
