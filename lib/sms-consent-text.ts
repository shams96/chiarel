// Client-safe: no database import, so the signup form can use it. Shared by
// the form and the API route so the text a person ticks is exactly the text
// version we store. Bump the version whenever the wording changes.
export const SMS_CONSENT_VERSION = "2026-11-v1";
export const SMS_CONSENT_TEXT =
  "I agree to receive recurring automated marketing text messages from CHIAREL at the mobile number I entered. Consent is not a condition of any purchase. Message and data rates may apply. Message frequency varies. Reply STOP to cancel or HELP for help.";
