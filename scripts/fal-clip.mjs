// Turn an approved CHIAREL still into a short clip with fal image-to-video (Kling 2.5 Turbo Pro). Dev tooling only.
// Usage: node scripts/fal-clip.mjs <clip> [--dry]      clips: see CLIPS below
//   FAL_KEY from the environment or chiarel/.env.local (never printed). FAL_OUT = output folder (default: claudedocs/higgsfield/clips).
//   Cost: about $0.35 per 5-second clip (fal pricing, 2026-11).
//
// Prompt rules for packaged products (see claudedocs/specs/swiss-luxury-redesign/direction/IMAGE_PROMPTING.md):
//  - the camera does one slow thing; the product and its label are declared perfectly still and sharp;
//  - motion is given to everything that is NOT the product (petals, droplets, satin, light);
//  - the negative prompt names the failure modes (morphing, text warping, flicker, shake);
//  - review the first, middle and last frames against the source still before use: label drift is the risk.
import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = process.env.FAL_OUT ? resolve(process.env.FAL_OUT) : resolve(ROOT, "claudedocs/higgsfield/clips");

const STILL_RULES =
  "The bottle stays perfectly still, rigid and in sharp focus for the whole clip: its shape, glass colours, cap and gold finish do not change, and every letter of its label stays crisp, legible and exactly as in the first frame, with no warping, shimmer or flicker. " +
  "One slow, smooth camera move only, no shake, no rotation, no cuts. Slow, calm, luxurious pacing.";
const NEGATIVE =
  "morphing bottle, changing label text, warped or garbled letters, flicker, jitter, camera shake, whip pan, extra bottles, people, hands, fast motion, cuts, text overlay, subtitles, watermark, blur, low quality";

const CLIPS = {
  "eye-petals": {
    still: "/assets/products/clarity-eye-contour-concentrate-detail.jpg",
    prompt:
      "Luxury skincare commercial, high-key peach and champagne light. The camera pushes in very slowly and smoothly, about four percent over five seconds. " +
      "Frosted peach petals drift gently downward and sideways with soft parallax, a few droplets catch the light and glint, the pearl-pink satin ripples very slightly, soft light rays shift across the background. " +
      STILL_RULES,
  },
  "essence-water": {
    still: "/assets/products/clarity-essence-detail.jpg",
    prompt:
      "Luxury skincare commercial, golden-hour light. The camera pushes in very slowly and smoothly, about four percent over five seconds. " +
      "Clear spring water flows gently around the stone, caustic light ripples dance on the surface, tiny droplets and sparkles drift in the warm backlight, the out-of-focus mossy rocks stay soft. " +
      STILL_RULES,
  },
};

const [clipKey] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const clip = CLIPS[clipKey];
if (!clip) throw new Error(`unknown clip "${clipKey}" (${Object.keys(CLIPS).join(", ")})`);
if (process.argv.includes("--dry")) {
  console.log(`${clipKey}\nstill: ${clip.still}\n\nPROMPT:\n${clip.prompt}\n\nNEGATIVE:\n${NEGATIVE}`);
  process.exit(0);
}

function loadKey() {
  if (process.env.FAL_KEY) return process.env.FAL_KEY.trim();
  for (const file of [process.env.FAL_ENV_FILE, resolve(ROOT, ".env.local")]) {
    if (file && existsSync(file)) {
      const m = readFileSync(file, "utf8").match(/^FAL_KEY=(.*)$/m);
      if (m && m[1].trim()) return m[1].replace(/["\r]/g, "").trim();
    }
  }
  throw new Error("FAL_KEY not found");
}

const sharp = createRequire(resolve(ROOT, "package.json"))("sharp");
const img = await sharp(resolve(ROOT, "public", clip.still.replace(/^\//, ""))).resize({ width: 1280, height: 1280, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 92 }).toBuffer();
const headers = { Authorization: `Key ${loadKey()}`, "Content-Type": "application/json" };
async function call(url, init) {
  const res = await fetch(url, { ...init, headers });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text.slice(0, 300) }; }
  if (!res.ok) throw new Error(`fal ${res.status}: ${JSON.stringify(json.detail ?? json).slice(0, 500)}`);
  return json;
}

const body = { prompt: clip.prompt, image_url: `data:image/jpeg;base64,${img.toString("base64")}`, duration: "5", negative_prompt: NEGATIVE, cfg_scale: 0.6 };
const sub = await call("https://queue.fal.run/fal-ai/kling-video/v2.5-turbo/pro/image-to-video", { method: "POST", body: JSON.stringify(body) });
console.log("queued", sub.request_id);
let status;
for (let i = 0; i < 150; i++) {
  await new Promise((r) => setTimeout(r, 5000));
  status = await call(sub.status_url, { method: "GET" });
  if (status.status === "COMPLETED") break;
  if (status.status === "FAILED" || status.error) throw new Error("fal job failed: " + JSON.stringify(status).slice(0, 300));
}
if (status?.status !== "COMPLETED") throw new Error("timed out waiting for fal");
const result = await call(sub.response_url, { method: "GET" });
const url = result.video?.url;
if (!url) throw new Error("no video in result: " + JSON.stringify(result).slice(0, 300));
mkdirSync(OUT, { recursive: true });
const file = resolve(OUT, `${clipKey}-${new Date().toISOString().replace(/[-:T]/g, "").slice(4, 12)}.mp4`);
writeFileSync(file, Buffer.from(await (await fetch(url)).arrayBuffer()));
console.log("saved", file.replace(ROOT, "").replace(/\\/g, "/"));
