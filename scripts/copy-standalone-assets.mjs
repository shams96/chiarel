// Next's `output: "standalone"` build traces only the node_modules a page
// actually imports into .next/standalone/ — it deliberately does NOT copy
// .next/static (JS/CSS chunks) or public/ (favicon, /assets images, etc.)
// into that folder, since it can't know whether you want to serve those
// from a CDN instead. On a plain Node host like Hostinger there is no CDN
// in front of it, so both directories have to be copied in alongside
// server.js or every asset request 404s. Runs as `postbuild` so it can
// never be skipped by forgetting a manual step, and uses fs.cpSync (Node
// 16.7+) instead of a shell `cp -r` so this works identically on the
// Windows dev machine and Hostinger's Linux build environment.
import { cpSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const standalone = join(root, ".next", "standalone");

if (!existsSync(standalone)) {
  console.error(
    "[copy-standalone-assets] .next/standalone not found — did the build run with output: 'standalone' in next.config.mjs?"
  );
  process.exit(1);
}

cpSync(join(root, ".next", "static"), join(standalone, ".next", "static"), {
  recursive: true,
});
cpSync(join(root, "public"), join(standalone, "public"), { recursive: true });

console.log("[copy-standalone-assets] copied .next/static and public/ into .next/standalone/");
