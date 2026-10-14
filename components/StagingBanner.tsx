import { isStaging } from "@/lib/app-env";

// Thin fixed strip, bottom of the viewport. Fixed + pointer-events-none so it
// takes no layout space and never blocks clicks. Renders nothing in production.
export default function StagingBanner() {
  if (!isStaging()) return null;
  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-9999 bg-black/85 py-1 text-center text-[11px] font-medium uppercase tracking-widest text-white"
    >
      STAGING — not the live store
    </div>
  );
}
