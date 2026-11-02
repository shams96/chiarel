// Generate extra CHIAREL product views with fal (Nano Banana 2 edit), conditioned on the REAL packshot.
// Dev tooling only; not part of the site build. Output goes to claudedocs/higgsfield/views/, never to public/.
//
// Usage: [FAL_MODEL=nb2|gpt2|gpt15] node scripts/fal-views.mjs <product> <view> [count 1-4] [--dry]
//   nb2 = fal-ai/nano-banana-2/edit (default), gpt2 = openai/gpt-image-2/edit, gpt15 = fal-ai/gpt-image-1.5/edit
//   products: eye | neck | essence      views: see VIEWS below
//   FAL_KEY is read from the environment or chiarel/.env.local (never printed). Cost is billed by fal per image.
//
// Why this shape (see claudedocs/specs/swiss-luxury-redesign/direction/IMAGE_PROMPTING.md):
//  - the real transparent packshot is always passed as a reference, and the prompt names what to preserve;
//  - the label text is transcribed verbatim, line by line, because small text is where generators drift;
//  - 2K output and thinking_level "high" for legibility and instruction following;
//  - every output is reviewed against the packshot before it can be used (label match is a human check).
import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = process.env.FAL_OUT ? resolve(process.env.FAL_OUT) : resolve(ROOT, "claudedocs/higgsfield/views");
const PUB = (p) => resolve(ROOT, "public", p.replace(/^\//, ""));

function loadKey() {
  if (process.env.FAL_KEY) return process.env.FAL_KEY.trim();
  for (const file of [process.env.FAL_ENV_FILE, resolve(ROOT, ".env.local")]) {
    if (file && existsSync(file)) {
      const m = readFileSync(file, "utf8").match(/^FAL_KEY=(.*)$/m);
      if (m && m[1].trim()) return m[1].replace(/["\r]/g, "").trim();
    }
  }
  throw new Error("FAL_KEY not found (set FAL_KEY, FAL_ENV_FILE, or FAL_KEY in .env.local)");
}

// ---- the real packaging, transcribed from the packshots (check against public/assets/products/*.png) ----
const PRODUCTS = {
  eye: {
    pack: "/assets/products/clarity-eye-contour-concentrate-bottle.png",
    look:
      "a slim, tall, square-shouldered glass bottle with softly rounded corners; the glass shades from pale champagne-rose at the shoulder to blush pink at the base; a clear faceted acrylic over-cap with a rose-gold inner cap",
    label:
      'Printed on the front of the glass in gold serif capitals, centred, exactly these lines and nothing else: "CHIAREL" (largest), "ITALIA" (small, directly beneath), then a gap, then "CLARITY" / "EYE CONTOUR" / "CONCENTRATE" (three lines, widely tracked capitals), then a gap, then "For puffiness," / "dark circles" / "and fine lines" (three lines, lowercase serif), and "40ml" small near the base.',
  },
  neck: {
    pack: "/assets/products/clarity-neck-decollete-creme-bottle.png",
    look:
      "a tall square-shouldered bottle of deep emerald-green glass with a clear faceted acrylic over-cap and a polished gold inner cap",
    label:
      'Printed on the front of the glass in cream-gold serif, centred, exactly these lines and nothing else: "CHIAREL" (largest), then "— ITALIA —" with a short rule each side, then a gap, then "CLARITY" / "NECK &" / "DÉCOLLETÉ" / "CRÈME" (four lines, tracked capitals), then a gap, then "For crepey-looking" / "skin on the neck" / "and chest" (three lines, lowercase serif).',
  },
  essence: {
    pack: "/assets/products/clarity-essence-bottle.png",
    look:
      "a slim, tall, square-shouldered glass bottle; the glass shades from deep red-ochre at the shoulder to amber and then blush at the base; a clear faceted acrylic over-cap with a rose-gold inner cap",
    label:
      'Printed on the front of the glass in gold serif capitals, centred, exactly these lines and nothing else: "CHIAREL" (largest), "ITALIA" (small, directly beneath), then a gap, then "CLARITY" / "ESSENCE" (two lines, tracked capitals), then a gap, then "For fine lines" / "and firmness" (two lines, lowercase serif), and "40ml" small near the base.',
  },
};

const PRESERVE = (p) =>
  `Use the second reference image as the exact product. Preserve it exactly: ${p.look}. ${p.label} ` +
  "Reproduce every letter of the label exactly as written, in the same typeface style, colour, size and position as the reference; do not add, remove, translate or rearrange any text, and add no other writing, logos or marks anywhere on the product. " +
  "Keep the bottle's proportions, glass colours, cap and gold finish identical to the reference.";

const NO =
  " No extra products, no extra bottles, no watermark, no captions, no text anywhere in the scene except the product's own label.";

// ---- views: refs[0] is composition/style, refs[1] is the real packshot unless noted ----
const VIEWS = {
  "eye.studio": {
    aspect: "4:5",
    refs: ["/assets/products/clarity-essence-studio.jpg", "/assets/products/clarity-eye-contour-concentrate-bottle.png"],
    prompt: (p) =>
      "Edit image 1 into a new campaign photograph. Keep the composition, camera angle, framing, the woman (same face, hair, pose and expression), her crossed forearms, the soft diffused studio light and the pale seamless background exactly as in image 1. Replace only the small bottle in front of her with the product from image 2, standing upright on the same pale surface at the same scale. " +
      PRESERVE(p) +
      " The label must face the camera and be fully legible." + NO,
  },
  "eye.detail": {
    aspect: "4:5",
    refs: ["/assets/products/clarity-eye-contour-concentrate-ribbon-scene-v2.jpg", "/assets/products/clarity-eye-contour-concentrate-bottle.png"],
    prompt: (p) =>
      "Create a close, front-on luxury beauty still life. The product from image 2 stands upright, centred, filling about 60% of the frame height, on a pearl-pink satin plinth. Soft high-key light from the upper left, a few frosted peach petals and tiny pearlescent droplets resting on the satin and floating softly out of focus, a blush-to-ivory background. Match the palette and mood of image 1 (delicate, high-key, peach and champagne), but do NOT copy its ribbon or its small distant bottle. Shot on a 100mm macro lens, shallow depth of field, the label sharp and fully legible. " +
      PRESERVE(p) + NO,
  },
  "neck.studio": {
    aspect: "4:5",
    refs: ["/assets/products/clarity-essence-studio.jpg", "/assets/products/clarity-neck-decollete-creme-bottle.png"],
    prompt: (p) =>
      "Edit image 1 into a new campaign photograph. Keep the composition, camera angle, framing, the woman (same face, hair, pose and expression), her crossed forearms, the soft diffused studio light and the pale seamless background exactly as in image 1. Replace only the small bottle in front of her with the product from image 2, standing upright on the same pale surface at the same scale. " +
      PRESERVE(p) +
      " The label must face the camera and be fully legible." + NO,
  },
  "essence.detail": {
    aspect: "4:5",
    refs: ["/assets/editorial/isola-spring-essence-square-1400.jpg", "/assets/products/clarity-essence-bottle.png"],
    prompt: (p) =>
      "Create a close, front-on luxury beauty still life of the product from image 2, upright and centred, filling about 60% of the frame height, resting on a wet pale limestone stone in shallow, crystal-clear spring water. Caustic light ripples on the stone, tiny droplets in the air, soft golden-hour light from the upper left, out-of-focus mossy karst rocks behind. Match the water, light and palette of image 1, but do NOT copy its composition. Shot on a 100mm macro lens, shallow depth of field, the label sharp and fully legible. " +
      PRESERVE(p) + NO,
  },
};

const [productArg, viewArg, countArg = "1"] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const dry = process.argv.includes("--dry");
const viewKey = `${productArg}.${viewArg}`;
const view = VIEWS[viewKey];
if (!view) throw new Error(`unknown view "${viewKey}" (${Object.keys(VIEWS).join(", ")})`);
const product = PRODUCTS[productArg];
const count = Math.min(4, Math.max(1, Number(countArg) || 1));
const prompt = view.prompt(product);

if (dry) {
  console.log(`${viewKey} x${count}\nrefs:\n  ${view.refs.join("\n  ")}\n\nPROMPT:\n${prompt}`);
  process.exit(0);
}

// references as JPEG/PNG data URIs, resized so the request stays small (sharp from this repo)
const sharp = createRequire(resolve(ROOT, "package.json"))("sharp");
async function dataUri(p) {
  const file = PUB(p);
  const isPng = file.toLowerCase().endsWith(".png");
  let img = sharp(file).resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true });
  if (isPng) {
    // flatten the transparent packshot onto the site's neutral frame colour so the model sees a clean product on plain ground
    img = img.flatten({ background: "#F0F2EB" }).jpeg({ quality: 92 });
  } else {
    img = img.jpeg({ quality: 90 });
  }
  const buf = await img.toBuffer();
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

const key = loadKey();
const headers = { Authorization: `Key ${key}`, "Content-Type": "application/json" };
async function call(url, init) {
  const res = await fetch(url, { ...init, headers });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text.slice(0, 300) }; }
  if (!res.ok) throw new Error(`fal ${res.status}: ${JSON.stringify(json.detail ?? json).slice(0, 500)}`);
  return json;
}

const MODEL = process.env.FAL_MODEL || "nb2";
const imageUrls = await Promise.all(view.refs.map(dataUri));
const MODELS = {
  nb2: {
    endpoint: "fal-ai/nano-banana-2/edit",
    body: { prompt, image_urls: imageUrls, aspect_ratio: view.aspect, resolution: process.env.FAL_RES || "2K", output_format: "png", num_images: count, thinking_level: "high", limit_generations: false },
  },
  gpt2: {
    endpoint: "openai/gpt-image-2/edit",
    body: { prompt, image_urls: imageUrls, image_size: { width: 1024, height: 1280 }, quality: "high", output_format: "png", num_images: count },
  },
  gpt15: {
    endpoint: "fal-ai/gpt-image-1.5/edit",
    body: { prompt, image_urls: imageUrls, image_size: "1024x1536", quality: "high", input_fidelity: "high", output_format: "png", num_images: count },
  },
};
const chosen = MODELS[MODEL];
if (!chosen) throw new Error(`unknown FAL_MODEL "${MODEL}" (${Object.keys(MODELS).join(", ")})`);
const body = chosen.body;

const sub = await call(`https://queue.fal.run/${chosen.endpoint}`, { method: "POST", body: JSON.stringify(body) });
console.log("queued", sub.request_id);
let status;
for (let i = 0; i < 120; i++) {
  await new Promise((r) => setTimeout(r, 4000));
  status = await call(sub.status_url, { method: "GET" });
  if (status.status === "COMPLETED") break;
  if (status.status === "FAILED" || status.error) throw new Error("fal job failed: " + JSON.stringify(status).slice(0, 300));
}
if (status?.status !== "COMPLETED") throw new Error("timed out waiting for fal");
const result = await call(sub.response_url, { method: "GET" });
mkdirSync(OUT, { recursive: true });
const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(4, 12);
let n = 0;
for (const im of result.images ?? []) {
  n++;
  const buf = Buffer.from(await (await fetch(im.url)).arrayBuffer());
  const file = resolve(OUT, `${viewKey.replace(".", "-")}-${MODEL}-${stamp}-${n}.png`);
  writeFileSync(file, buf);
  console.log("saved", file.replace(ROOT, "").replace(/\\/g, "/"), `${im.width ?? "?"}x${im.height ?? "?"}`);
}
if (result.description) console.log("model note:", String(result.description).slice(0, 300));
