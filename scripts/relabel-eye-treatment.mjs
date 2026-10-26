#!/usr/bin/env node
// Re-letter the Eye packshot: "Eye Contour Concentrate" -> "Eye Treatment",
// "Nightly Eye Contour Treatment" -> "Nightly Eye Treatment" (wordmark, ITALIA, rule
// and 15 ml stay). The product name is "CHIAREL Eye Treatment"; the CHIAREL wordmark
// is already printed above, as on the other packs.
//
//   node scripts/relabel-eye-treatment.mjs                 edits the packshot in place
//   node scripts/relabel-eye-treatment.mjs --out x.png     writes a copy instead
//   node scripts/relabel-eye-treatment.mjs --src a.png     use another 1400x1400 packshot
//
// Then publish it with: npm run publish:images
// Needs sharp (in the repo) and python with fonttools + brotli (pip install fonttools brotli).
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
const sharp = createRequire(join(ROOT, "package.json"))("sharp");

const arg = (n, d) => (process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : d);
const SRC = resolve(ROOT, arg("--src", "public/assets/products/clarity-eye-contour-concentrate-bottle.png"));
const OUT = resolve(ROOT, arg("--out", SRC));
const FONTS = join(ROOT, "public/fonts");
const PY = process.env.PYTHON || "python";

// Layout of the 1400x1400 Eye packshot (measured on the current artwork).
const CX = 704; // label centre line
const NAME = { box: [592, 868, 816, 946], cap: 22, centerY: 906 }; // two-line serif name -> one line
const RULE_Y = 953; // thin gold rule, kept as is
const DESC = { box: [572, 960, 836, 994], cap: 12, centerY: 977 }; // sans descriptor

function glyphs(font, text, opts = []) {
  return JSON.parse(execFileSync(PY, [join(here, "tools", "text-to-svg-path.py"), join(FONTS, font), text, ...opts], { encoding: "utf8" }));
}

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
if (info.width !== 1400 || info.height !== 1400) throw new Error(`expected a 1400x1400 packshot, got ${info.width}x${info.height}`);
const W = info.width;
const px = (x, y, c) => data[(y * W + x) * 4 + c];

// sample the label's cream from the old name text (brightest pixels in its box)
const [nx0, ny0, nx1, ny1] = NAME.box;
const lum = (x, y) => px(x, y, 0) + px(x, y, 1) + px(x, y, 2);
const bright = [];
for (let y = ny0; y <= ny1; y++) for (let x = nx0; x <= nx1; x++) bright.push([lum(x, y), x, y]);
bright.sort((a, b) => b[0] - a[0]);
const top = bright.slice(0, Math.max(10, Math.floor(bright.length * 0.1)));
const col = [0, 1, 2].map((c) => Math.round(top.reduce((s, [, x, y]) => s + px(x, y, c), 0) / top.length));
const hex = "#" + col.map((v) => v.toString(16).padStart(2, "0")).join("");

// erase the old lines: per-column vertical interpolation between rows just outside the box
function erase([x0, y0, x1, y1]) {
  for (let x = x0; x <= x1; x++) {
    const a = [0, 1, 2, 3].map((c) => px(x, y0 - 3, c));
    const b = [0, 1, 2, 3].map((c) => px(x, y1 + 3, c));
    for (let y = y0; y <= y1; y++) {
      const t = (y - (y0 - 3)) / (y1 + 3 - (y0 - 3));
      for (let c = 0; c < 4; c++) data[(y * W + x) * 4 + c] = Math.round(a[c] + (b[c] - a[c]) * t);
    }
  }
}
erase(NAME.box);
erase(DESC.box);

function textSvg(g, cap, color, bold, mark) {
  const scale = cap / g.cap;
  // optional trademark sign: half size, raised, set after the text
  const ms = mark ? scale * 0.5 : 0;
  const gap = mark ? cap * 0.12 : 0;
  const tw = g.w * scale + (mark ? gap + mark.w * ms : 0);
  const pad = 8;
  const w = Math.ceil(tw + pad * 2), h = Math.ceil(cap * 2 + pad * 2);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">` +
    `<g transform="translate(${pad},${pad + cap * 1.3}) scale(${scale})">` +
    `<path d="${g.d}" fill="${color}" stroke="${color}" stroke-width="${bold}" stroke-linejoin="round"/></g>` +
    (mark
      ? `<g transform="translate(${pad + g.w * scale + gap},${pad + cap * 1.3 - cap * 0.55}) scale(${ms})">` +
        `<path d="${mark.d}" fill="${color}" stroke="${color}" stroke-width="${bold}" stroke-linejoin="round"/></g>`
      : "") +
    `</svg>`;
  return { svg, w, h, scale, base: pad + cap * 1.3, cap };
}

const name = glyphs("libre-bodoni-latin.woff2", "Eye Treatment", ["--wght", "500", "--track", "10"]);
const tm = glyphs("libre-bodoni-latin.woff2", "™", ["--wght", "500"]);
const desc = glyphs("jost-latin.woff2", "Nightly Eye Treatment", ["--wght", "500", "--track", "20"]);
const n = textSvg(name, NAME.cap, hex, 6, tm);
const d = textSvg(desc, DESC.cap, hex, 4);

const base = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
const layer = async (t, centerY) =>
  ({ input: await sharp(Buffer.from(t.svg)).blur(0.4).png().toBuffer(), left: Math.round(CX - t.w / 2), top: Math.round(centerY - (t.base - t.cap / 2)) });
const composited = await sharp(base).composite([await layer(n, NAME.centerY), await layer(d, DESC.centerY)]).png().toBuffer();
// keep file size close to the other packshots (palette PNG, alpha kept)
await sharp(composited).png({ palette: true, quality: 92, effort: 10, colours: 256 }).toFile(OUT);
console.log(`wrote ${OUT}\n  colour ${hex}; name "Eye Treatment™", descriptor "Nightly Eye Treatment"`);
