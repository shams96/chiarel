/** @type {import('next').NextConfig} */
const nextConfig = {
  // Do not advertise the framework in every response.
  poweredByHeader: false,
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
  // CI (the required `check` job) already runs tsc and lint on every PR, and
  // main only moves through it. Repeating both inside the production build
  // burns CPU and memory on the shared host for no added safety, on every
  // deploy. The build itself (compile and bundle) still runs and still fails
  // on a real compile error.
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  // instrumentation.ts (dispute-rate monitor, see lib/dispute-alert-scheduler.ts)
  // is picked up by default on Next 15; the old experimental.instrumentationHook
  // flag is rejected as an unknown key and only prints a warning.
};

export default nextConfig;
