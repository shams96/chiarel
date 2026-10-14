// Single switch for the staging deployment (claudedocs/foundation/STAGING.md).
// APP_ENV unset or "production" => the live store; "staging" => a non-public
// copy that must never be indexed, advertised, or send real email. Anything
// else is treated as production so a typo can never silently hide the live site.
//
// Read at call time (not module load) so tests can flip it. Note that Next
// evaluates robots/sitemap/metadata at BUILD time, so APP_ENV must be set in
// the host's environment before the staging build runs.
export function isStaging(): boolean {
  return process.env.APP_ENV === "staging";
}

// Root-layout robots metadata. Production value is unchanged from before.
export function rootRobotsMetadata(): { index: boolean; follow: boolean } {
  return isStaging() ? { index: false, follow: false } : { index: true, follow: true };
}
