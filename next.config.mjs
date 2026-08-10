/** @type {import('next').NextConfig} */
const nextConfig = {
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
