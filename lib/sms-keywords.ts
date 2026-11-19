// Inbound reply classification. The FCC treats stop, quit, end, revoke,
// opt out, cancel and unsubscribe as valid revocations, and any reasonable
// wording counts, so we match these as whole words anywhere in the reply.
// Over-revoking is the safe direction: a person who wrote "please stop" or
// "cancel" must not get another text.
const STOP_PATTERN = /(?:^|[^a-z])(stop ?all|stop|quit|end|revoke|opt[ -]?out|cancel|unsubscribe)(?:[^a-z]|$)/i;

export type InboundKind = "stop" | "help" | "other";

export function classifyInbound(body: unknown): InboundKind {
  const text = typeof body === "string" ? body.trim() : "";
  if (STOP_PATTERN.test(text)) return "stop";
  if (/^(help|info)[.! ]*$/i.test(text)) return "help";
  return "other";
}

export const HELP_REPLY =
  "CHIAREL: for help email hello@chiarel.com. Message and data rates may apply. Reply STOP to cancel.";
