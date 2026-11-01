#!/usr/bin/env node
// Publish replaced images to the live site.
//
// The site is built from GitHub `main`, so a file changed in public/ only goes
// live once it is committed, merged and rebuilt. This does that for you, without
// touching your working tree or branch:
//
//   npm run publish:images                  replaced files only (same name, changed content)
//   npm run publish:images -- --include-new also add brand-new files
//   npm run publish:images -- --dry-run     show what would be published, change nothing
//   npm run publish:images -- <path> ...    publish exactly these files
//
// Images listed in lib/image-variants.json also get their 640w/960w copies remade and published.
//
// Deleted files are never published (a deletion could break a live page); the
// script lists them so you can ask for them explicitly. Needs git and gh (logged in).
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, posix } from "node:path";
import { makeVariants, manifest as variantManifest } from "./make-image-variants.mjs";

const SITE = process.env.SITE_URL || "https://chiarel.com";
const ROOT = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
const run = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...opts }).trim();
const git = (args, cwd = ROOT) => run("git", args, { cwd });

const argv = process.argv.slice(2);
const flag = (f) => argv.includes(f);
const explicit = argv.filter((a) => !a.startsWith("--")).map((a) => a.replaceAll("\\", "/"));
const dry = flag("--dry-run");

const IMAGE = /\.(jpe?g|png|webp|svg|gif|avif|mp4|webm)$/i;
const sha = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");

// 1. what changed under public/
// not run(): its trim() would eat the leading space of the first status code
const porcelain = execFileSync("git", ["status", "--porcelain=v1", "-z", "--untracked-files=all", "--", "public"], { cwd: ROOT, encoding: "utf8" });
const entries = porcelain
  .split("\0")
  .filter(Boolean)
  .map((l) => ({ code: l.slice(0, 2), path: l.slice(3) }));
const modified = entries.filter((e) => e.code.includes("M") && IMAGE.test(e.path)).map((e) => e.path);
const added = entries.filter((e) => e.code === "??" && IMAGE.test(e.path)).map((e) => e.path);
const deleted = entries.filter((e) => e.code.includes("D") && IMAGE.test(e.path)).map((e) => e.path);

let files = explicit.length ? explicit : [...modified, ...(flag("--include-new") ? added : [])];

console.log(`Replaced (same name, new content): ${modified.length}`);
modified.forEach((f) => console.log("  M", f));
console.log(`New files${flag("--include-new") ? "" : " (not published; add --include-new)"}: ${added.length}`);
added.slice(0, 30).forEach((f) => console.log("  +", f));
if (deleted.length) {
  console.log(`Deleted locally (never published automatically): ${deleted.length}`);
  deleted.forEach((f) => console.log("  -", f));
}

files = files.filter((f) => {
  if (!f.startsWith("public/")) return console.log(`skip (outside public/): ${f}`), false;
  if (!existsSync(join(ROOT, f))) return console.log(`skip (missing on disk): ${f}`), false;
  return true;
});
// responsive copies (640w/960w, see lib/image-variants.json) must never be older
// than their source: remake them for every published source and publish them too
{
  const listed = variantManifest();
  const extra = [];
  for (const f of files) {
    const src = f.slice("public".length);
    if (!listed[src]) continue;
    if (dry) {
      console.log(`would regenerate responsive copies of ${f}`);
      continue;
    }
    for (const v of await makeVariants(src, { force: true })) extra.push(v);
  }
  for (const v of extra) if (!files.includes(v)) files.push(v);
}
if (!files.length) {
  console.log("\nNothing to publish.");
  process.exit(0);
}
for (const f of files) {
  const mb = statSync(join(ROOT, f)).size / 1048576;
  if (mb > 1.5) console.log(`warning: ${f} is ${mb.toFixed(1)} MB; the site serves files as-is, so large files load slowly`);
}
console.log(`\nWill publish ${files.length} file(s):`);
files.forEach((f) => console.log("  ", f));
if (dry) process.exit(0);

// 2. commit them on a fresh branch off origin/main in a throwaway worktree
git(["fetch", "-q", "origin", "main"]);
// what is on main now, so the live check can tell "new" from "still the old file"
const before = new Map(
  files.map((f) => {
    try {
      return [f, execFileSync("git", ["show", `origin/main:${f}`], { cwd: ROOT, maxBuffer: 256 * 1048576 })];
    } catch {
      return [f, null];
    }
  }),
);
const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 12);
const branch = `images/${stamp}`;
const wt = join(tmpdir(), `chiarel-images-${stamp}`);
git(["worktree", "add", "-q", "-B", branch, wt, "origin/main"]);
let merged = false;
try {
  for (const f of files) {
    mkdirSync(dirname(join(wt, f)), { recursive: true });
    copyFileSync(join(ROOT, f), join(wt, f));
  }
  git(["add", "--", ...files], wt);
  if (!git(["status", "--porcelain"], wt)) {
    console.log("These files are already identical to main. Nothing to publish.");
    process.exit(0);
  }
  const list = files.map((f) => `- ${f}`).join("\n");
  git(["commit", "-q", "-m", `Images: update ${files.length} file(s)\n\n${list}`], wt);
  git(["push", "-q", "-u", "origin", branch], wt);
  const url = run(
    "gh",
    ["pr", "create", "--title", `Images: update ${files.length} file(s)`, "--body", list, "--head", branch, "--base", "main"],
    { cwd: wt },
  )
    .split("\n")
    .pop();
  console.log("PR:", url);

  // 3. wait for the required check, then merge
  const deadline = Date.now() + 15 * 60_000;
  for (;;) {
    let out = "";
    try {
      out = run("gh", ["pr", "checks", url], { cwd: wt });
    } catch (e) {
      out = String(e.stdout || "");
    }
    if (/\bfail/i.test(out)) throw new Error("CI failed:\n" + out);
    if (out && !/pending|queued|in_progress/i.test(out)) break;
    if (Date.now() > deadline) throw new Error("Timed out waiting for CI");
    await new Promise((r) => setTimeout(r, 15_000));
  }
  run("gh", ["pr", "merge", url, "--squash", "--delete-branch"], { cwd: wt });
  merged = true;
  console.log("Merged. Waiting for the host to rebuild (usually 5-10 minutes)...");
} finally {
  try {
    git(["worktree", "remove", "--force", wt]);
  } catch {
    rmSync(wt, { recursive: true, force: true });
  }
  try {
    git(["branch", "-D", branch]);
  } catch {}
}

// 4. wait until the live file is the new one. The host's CDN re-encodes images,
// so bytes never match; compare decoded pixels instead and ask "is the live file
// closer to the new version than to the one that was on main before?".
const RASTER = /\.(jpe?g|png|webp|avif|gif)$/i;
async function thumb(buf) {
  // resolve sharp from the repo being published, not from wherever this script sits
  const sharp = createRequire(join(ROOT, "package.json"))("sharp");
  return sharp(buf).resize(128, 128, { fit: "fill" }).ensureAlpha().raw().toBuffer();
}
const meanDiff = (a, b) => a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0) / a.length;
async function isNew(f, liveBuf, newBuf, oldBuf) {
  if (sha256(liveBuf) === sha256(newBuf)) return true;
  if (!RASTER.test(f)) return liveBuf.length === newBuf.length && !oldBuf; // video/svg: exact size match, new files only
  const [l, n] = [await thumb(liveBuf), await thumb(newBuf)];
  if (!oldBuf) return meanDiff(l, n) < 2;
  const dNew = meanDiff(l, n);
  const dOld = meanDiff(l, await thumb(oldBuf));
  return dNew < dOld || dNew < 0.05;
}
function sha256(b) {
  return createHash("sha256").update(b).digest("hex");
}
if (merged) {
  const pending = new Map(files.map((f) => [f, { now: readFileSync(join(ROOT, f)), before: before.get(f) }]));
  const stop = Date.now() + 25 * 60_000;
  while (pending.size && Date.now() < stop) {
    for (const [f, { now, before: old }] of [...pending]) {
      const live = `${SITE}/${posix.relative("public", f).split("/").map(encodeURIComponent).join("/")}?cb=${Date.now()}`;
      try {
        const res = await fetch(live, { cache: "no-store", headers: { "Cache-Control": "no-cache" } });
        if (res.ok && (await isNew(f, Buffer.from(await res.arrayBuffer()), now, old))) {
          console.log("LIVE:", f);
          pending.delete(f);
        }
      } catch {}
    }
    if (pending.size) await new Promise((r) => setTimeout(r, 20_000));
  }
  if (pending.size) {
    console.log("Not live yet (the build may still be running):");
    pending.forEach((_, f) => console.log("  ", f));
    process.exit(2);
  }
  console.log("All published files are live.");
}
