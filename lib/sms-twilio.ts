import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Twilio request signature: base64 HMAC-SHA1 over the full public URL followed
 * by each POST parameter name and value, sorted by name, keyed with the auth
 * token. https://www.twilio.com/docs/usage/security#validating-requests
 */
export function twilioSignature(authToken: string, url: string, params: Record<string, string>): string {
  const data = Object.keys(params)
    .sort()
    .reduce((acc, k) => acc + k + params[k], url);
  return createHmac("sha1", authToken).update(data, "utf8").digest("base64");
}

export function validTwilioSignature(
  authToken: string,
  url: string,
  params: Record<string, string>,
  header: string | null
): boolean {
  if (!header) return false;
  const expected = Buffer.from(twilioSignature(authToken, url, params));
  const given = Buffer.from(header);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
