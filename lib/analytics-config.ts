import { isStaging } from "@/lib/app-env";

const GA_ID_PATTERN = /^G-[A-Z0-9]{4,}$/;

// Server-side switch for analytics. Returns the GA4 measurement id only when
// it is set, well-formed, and this isn't the staging deployment — otherwise
// null, and every analytics component renders nothing (safe no-op). Read at
// call time so tests can flip env.
export function getMeasurementId(): string | null {
  if (isStaging()) return null;
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  return id && GA_ID_PATTERN.test(id) ? id : null;
}
