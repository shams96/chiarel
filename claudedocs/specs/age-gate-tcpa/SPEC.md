# Age gate and TCPA text consent

Status: implemented 2026-11-14 on `feat/age-gate-tcpa-spec`, owner said "implement the same" as competing brands, so Specify, Plan and Implement were compressed into this one record. Not legal advice; attorney review still needed.

## Problem
1. Phone numbers were saved on the Founding list with no consent wording and no consent record.
2. No signup asked for age, so under-13 data could be collected (COPPA).

## What competing brands do (verified 2026-11-14)
- e.l.f. Cosmetics SMS terms: opt-in by website checkbox or JOIN keyword; "consent is not required to purchase"; message and data rates; frequency "varies"; STOP, QUIT, END, CANCEL, UNSUBSCRIBE; HELP; minimum age 13 US/UK, 14 Canada, stated in terms only. No consent-record or quiet-hours wording.
- Sephora, Medik8, Counter, Beauty Care Choices: same "not a condition of purchase" pattern (search snippets; Sephora page returned 403 to fetch).
- Sunday Riley privacy policy: no minimum age, texts "with your consent, where required by law", unsubscribe instructions cover email only.
- Gap versus law: a terms-only "13+" line is not a neutral age screen (FTC FAQ and CARU decision, per practitioner commentary). We go further than the competitors here.

## Decided
- Age: neutral date-of-birth field (`<input type="date">`, no hint, no default, no tick box) on the email signup and the Founding list. Under 13: 403 with a neutral message, nothing stored, 30-day cookie blocks a retry with another date. The date of birth is never stored. (`lib/age-gate.ts`)
- SMS: separate unticked checkbox with the full disclosure (`lib/sms-consent.ts`, version `2026-11-v1`). Phone is kept only with the tick; without it the number is discarded and not sent to the CRM. Signup and a `SmsConsent` evidence row (text, version, time, IP, browser) are saved in one transaction. US/Canada numbers only, stored +1XXXXXXXXXX.
- `/sms-terms` page; privacy policy updated. Footer untouched (off-limits).
- Sending gate: `hasLiveSmsConsent(phone)` and `revokeSmsConsent(phone, via)` exist for any future sender.

## Out of scope, required before the first text is ever sent
- No SMS provider, no sending code, no inbound STOP/HELP webhook (the terms page says we do not send yet).
- Quiet hours 8am-9pm recipient local time and the 10-business-day STOP deadline must be enforced by the sender.
- Existing `FoundingSignup.phone` rows saved before this change have no consent record: do not text them.
- Re-consent flow, Canadian CASL wording, and attorney review of the wording.

## Done means
883 tests pass, tsc clean; `tests/age-gate.test.ts`, `tests/sms-consent.test.ts`, `tests/founding-list-consent.test.ts`, and age cases in `tests/subscribe.test.ts`. Migration `20261114000000_sms_consent` must be applied in production before merge deploys (`prisma migrate deploy`).
