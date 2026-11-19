# SMS sender with STOP handling

Status: built 2026-11-19 on `feat/sms-sender-stop`. Sending is OFF until the owner sets `SMS_SEND_ENABLED=on` and Twilio keys. Not legal advice; attorney review still needed. Follows `age-gate-tcpa/SPEC.md`.

## Decided
- Provider: Twilio (default pick, owner did not choose). Plain REST via `fetch`, no SDK.
- One gate: `sendMarketingText()` in `lib/sms-send.ts` is the only way a marketing text leaves. It refuses unless: sending is switched on and configured; the number is valid US/Canada; the newest `SmsConsent` row is not revoked; now is inside the safe window. It appends "Reply STOP to opt out." when the text has no STOP. Every attempt that reaches the provider is logged in `SmsMessage`.
- Quiet hours without a per-number time zone: send only 1pm-7pm Eastern, which is inside 8am-9pm in every US and Canadian zone (Pacific 10am-4pm, Alaska 9am-3pm, Hawaii 8am-2pm, Newfoundland 2:30pm-8:30pm). Trade-off: a narrow window.
- STOP: `POST /api/sms/inbound` (Twilio webhook), signature-verified (HMAC-SHA1 against `SITE_URL`). Any reply containing stop, quit, end, revoke, opt out, cancel or unsubscribe as a whole word revokes every consent row for the number at once (law allows 10 business days). Over-revoking is deliberate. HELP and INFO get a help reply. Twilio also blocks the number at carrier level.
- Campaigns: `scripts/sms-campaign.ts "text" [--send]`, dry run unless `--send`.

## Owner steps before the first real text
1. Twilio account, a number or Messaging Service, and US A2P 10DLC brand + campaign registration approved (carriers block unregistered marketing traffic; approval takes days to weeks). Canadian numbers need their own review.
2. Set the Twilio incoming-message webhook to `https://chiarel.com/api/sms/inbound` (POST).
3. Add `SMS_SEND_ENABLED=on`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_MESSAGING_SERVICE_SID` (or `TWILIO_FROM`) to the Hostinger env.
4. Apply migration `20261119000000_sms_message` to production.
5. Attorney review of the consent and terms wording.

## Not built
- Email opt-out (the terms page offers `hello@chiarel.com`): a person does it by hand today with `revokeSmsConsent(phone, "email")`; no admin button.
- Delivery-status callbacks (status stays `queued`), re-consent via START, per-number time zones, Canadian CASL review.
- Numbers saved before the 2026-11-14 consent box have no consent row and can never be texted by this code.
