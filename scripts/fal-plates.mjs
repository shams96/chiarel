// Generate CHIAREL scene plates with fal (Nano Banana 2). Dev tooling only; not part of the site build.
// Usage: node scripts/fal-plates.mjs <slug> <prompt-key> [count]
//   FAL_KEY is read from the environment, FAL_ENV_FILE, or chiarel/.env.local (never printed).
// Plates are saved to claudedocs/higgsfield/plates/<slug>-<n>.png
import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "claudedocs/higgsfield/plates");

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

const COMMON =
  " Photoreal luxury beauty campaign plate, shot on 85mm, shallow depth of field, soft key light from upper left. " +
  "Leave the centre-lower third calm and empty: a flat plinth or surface about 30% of the frame width where a product will be placed, surface horizon about 70% down the frame. " +
  "No product, no bottles, no jars, no text, no logos, no watermark, no hands, no people.";

const WORLDS = {
  essence:
    "Crystal-clear shallow spring water over pale limestone, a wet stone plinth just breaking the surface at the centre-lower third. Caustic light ripples dancing on the stone, tiny water droplets suspended in the air, a few flecks of champagne gold leaf floating on the surface. Soft out-of-focus mossy karst rocks and warm terracotta stone behind, golden-hour sun glints. Palette: clear aqua, warm terracotta, champagne gold.",
  essence2:
    "Holiday-campaign still life in the style of a luxury perfume advertisement. Soft dusk sky gradient from Peach Dust #F0D8CC at the horizon up to a pale Cloud Dancer #F0EEE9 and a hint of Champagne Gold #D6C5A0 at the top, tiny sparkles in the air. A huge sculptural frosted flower with thick ruffled petals in Peach Dust and Champagne Gold, crusted with glitter and ice crystals, rising behind the empty centre. A wide Formal Garden green #1F5129 velvet ribbon dusted with gold glitter loops in big curves around the empty centre, the ribbon printed repeatedly with the word CHIAREL in gold capital letters. A pale powdery ground surface in the foreground with the horizon about 70% down the frame. The empty centre of the frame is kept clear for a tall slim bottle about 45% of the frame height.",
  neck2:
    "Holiday-campaign still life in the style of a luxury perfume advertisement. Soft dusk sky gradient from Peach Dust #F0D8CC at the horizon up to pale Cloud Dancer #F0EEE9 and a hint of Champagne Gold #D6C5A0 at the top, tiny sparkles in the air. A huge sculptural frosted flower with thick ruffled petals in Peach Dust and ivory, crusted with glitter and ice crystals, rising behind the empty centre. A wide Red Ochre #913832 velvet ribbon dusted with gold glitter loops in big curves around the empty centre, the ribbon printed repeatedly with the word CHIAREL in gold capital letters. A pale powdery ground surface in the foreground with the horizon about 70% down the frame. The empty centre of the frame is kept clear for a tall slim bottle about 45% of the frame height.",
  day:
    "Sun-baked terracotta clay wall and rough warm plaster in deep Red Ochre, a thick travertine slab at the centre-lower third, long soft shadows of olive and lemon leaves falling across the wall, thin veins of gold leaf pressed into cracks in the clay, warm Mediterranean afternoon light. Palette: Red Ochre #913832, Peach Dust #F0D8CC, champagne gold.",
  day2:
    "Luxury perfume-advertisement still life. A sun-baked terracotta clay wall in deep Red Ochre #913832 with fine gold-leaf veins in the cracks, soft olive-leaf shadows across it, warm Mediterranean afternoon light. A thick pale travertine slab at the centre-lower third. A wide Formal Garden green #1F5129 velvet ribbon dusted with gold glitter loops in big graceful curves around the empty centre, passing in front of and behind the slab, the ribbon printed repeatedly with the word CHIAREL in gold capital letters. The empty centre of the frame is kept clear for a squat jar about 25% of the frame height. Palette: Red Ochre, Formal Garden green, champagne gold.",
  night2:
    "Luxury perfume-advertisement still life. Deep Formal Garden green: dark wet slate and velvety moss, drifting mist, fern fronds in soft focus, a rim of cool champagne-gold light from behind, a dark wet stone slab at the centre-lower third. A wide Red Ochre #913832 velvet ribbon dusted with gold glitter loops in big graceful curves around the empty centre, passing in front of and behind the slab, the ribbon printed repeatedly with the word CHIAREL in gold capital letters. The empty centre of the frame is kept clear for a squat jar about 25% of the frame height. Palette: Formal Garden green, Red Ochre, champagne gold.",
  eye2:
    "Luxury perfume-advertisement still life. Soft blush-to-ivory gradient sky, frosted peach petals and a few pearlescent glitter flecks floating in the air, delicate high-key light, a pearl-pink satin plinth at the centre-lower third. A wide Formal Garden green #1F5129 velvet ribbon dusted with gold glitter loops in big graceful curves around the empty centre, passing in front of and behind the plinth, the ribbon printed repeatedly with the word CHIAREL in gold capital letters. The empty centre of the frame is kept clear for a tall slim bottle about 35% of the frame height. Palette: Peach Dust #F0D8CC, ivory, Formal Garden green, champagne gold.",
  night:
    "Deep Formal Garden green: dark wet slate and velvety moss, a thin trickle of water running over stone, drifting mist, fern fronds in soft focus, a rim of cool champagne-gold light from behind, a dark wet stone slab at the centre-lower third. Moody, low-key, glossy droplets on the moss. Palette: Formal Garden #1F5129, near-black green, champagne gold highlights.",
  neck:
    "A pale Carrara marble plinth at the centre-lower third, a misty waterfall and old stone tower softly out of focus behind, dried burgundy roses and a bare silver branch at the edges, a champagne satin ribbon trailing across the marble, cool grey-green light with warm gold highlights. Palette: cool grey-green, burgundy, champagne.",
  eye:
    "Soft blush-to-ivory gradient sky, frosted peach petals and a few pearlescent glitter flecks floating in the air, tiny ice crystals, delicate high-key light, a pearl-pink satin plinth at the centre-lower third. Palette: Peach Dust #F0D8CC, ivory, champagne. Dreamy bokeh.",
};

const [slug = "essence", worldKey = slug, countArg = "1"] = process.argv.slice(2);
const world = WORLDS[worldKey];
if (!world) throw new Error(`unknown world "${worldKey}" (${Object.keys(WORLDS).join(", ")})`);
const count = Math.min(4, Math.max(1, Number(countArg) || 1));

const key = loadKey();
const headers = { Authorization: `Key ${key}`, "Content-Type": "application/json" };
const body = {
  prompt: `Luxury skincare campaign plate, no product. ${world}${COMMON}${process.env.FAL_EXTRA ? " " + process.env.FAL_EXTRA : ""}`,
  aspect_ratio: "4:5",
  resolution: process.env.FAL_RES || "1K",
  output_format: "png",
  num_images: count,
};

async function call(url, init) {
  const res = await fetch(url, { ...init, headers });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text.slice(0, 300) }; }
  if (!res.ok) throw new Error(`fal ${res.status}: ${JSON.stringify(json.detail ?? json).slice(0, 400)}`);
  return json;
}

const sub = await call("https://queue.fal.run/fal-ai/nano-banana-2", { method: "POST", body: JSON.stringify(body) });
console.log("queued", sub.request_id);
let status;
for (let i = 0; i < 90; i++) {
  await new Promise((r) => setTimeout(r, 4000));
  status = await call(sub.status_url, { method: "GET" });
  if (status.status === "COMPLETED") break;
  if (i % 5 === 0) console.log(" ...", status.status);
}
if (status?.status !== "COMPLETED") throw new Error("timed out waiting for fal");
const result = await call(sub.response_url, { method: "GET" });
mkdirSync(OUT, { recursive: true });
let n = 1;
for (const img of result.images ?? []) {
  const buf = Buffer.from(await (await fetch(img.url)).arrayBuffer());
  let file;
  do { file = resolve(OUT, `${slug}-${n++}.png`); } while (existsSync(file));
  writeFileSync(file, buf);
  console.log("saved", file, buf.length, "bytes", img.width + "x" + img.height);
}
