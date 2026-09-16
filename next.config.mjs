/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output: Hostinger's Node.js Web App runner (and most
  // container-based Node hosts) expects one self-contained entry file it
  // runs directly, not `next start` against the full build + node_modules.
  // `output: 'standalone'` produces exactly that at
  // .next/standalone/server.js, tracing only the dependencies actually used
  // rather than shipping all of node_modules. It does NOT copy `.next/static`
  // or `public/` into the standalone folder on its own (a well-documented
  // Next.js gap, not an oversight here) — scripts/copy-standalone-assets.mjs,
  // wired up as the `postbuild` script, does that copy every build.
  output: "standalone",
  images: {
    // Next's runtime image optimizer requires the `sharp` native module in
    // production (next start and output: standalone alike) — see
    // https://nextjs.org/docs/messages/sharp-missing-in-production
    // On this host sharp has repeatedly failed to be present at runtime,
    // and every /_next/image request then throws and takes the app down.
    // Disabling the runtime optimizer removes that entire failure class:
    // next/image still handles layout, priority and lazy loading, but serves
    // the source file directly, so no native dependency is involved.
    // Trade-off: source images are served as-authored, so they must be
    // compressed at rest rather than resized on demand.
    unoptimized: true,
  },
};

export default nextConfig;
