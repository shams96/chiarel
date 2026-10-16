import { SITE_URL } from "@/lib/seo";

// Where Stripe sends the customer after paying or cancelling. The request's
// Origin header is attacker-controlled, so it is only honoured when it is this
// site (apex or www), or localhost outside production. Anything else falls
// back to the canonical site URL.
export function trustedOrigin(origin: string | null, requestUrl: string): string {
  const site = new URL(SITE_URL);
  const allowed = new Set([site.origin, `${site.protocol}//www.${site.host}`]);
  if (origin && allowed.has(origin)) return origin;
  if (process.env.NODE_ENV !== "production") {
    try {
      const u = new URL(origin ?? requestUrl);
      if (u.hostname === "localhost" || u.hostname === "127.0.0.1") return u.origin;
    } catch {
      /* fall through */
    }
  }
  return site.origin;
}
