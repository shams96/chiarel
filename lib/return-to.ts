// return_to is attacker-controlled (a query string and, via the Google flow, a
// signed cookie value that began as one). It is only ever honoured when it is a
// same-site path under one of these prefixes; anything else becomes /account.
const ALLOWED = ["/account", "/shop", "/cart", "/checkout", "/ritual", "/order", "/build-your-ritual", "/assessment"];
export const DEFAULT_RETURN_TO = "/account";

export function safeReturnTo(raw: unknown): string {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > 200) return DEFAULT_RETURN_TO;
  // Must start with a single slash; no backslash, no control characters.
  if (!raw.startsWith("/") || raw.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(raw)) return DEFAULT_RETURN_TO;
  let url: URL;
  try {
    url = new URL(raw, "http://internal.invalid");
  } catch {
    return DEFAULT_RETURN_TO;
  }
  if (url.origin !== "http://internal.invalid") return DEFAULT_RETURN_TO;
  const path = url.pathname;
  const ok = ALLOWED.some((p) => path === p || path.startsWith(`${p}/`));
  if (!ok) return DEFAULT_RETURN_TO;
  return `${path}${url.search}`;
}
