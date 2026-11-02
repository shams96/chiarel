# Runbook: admin "Continue with Google"

Tier 2, assisted triage: an agent diagnoses and proposes; a human changes production settings. Spec: `claudedocs/specs/social-signin/`. Phase A only: admin console, Google only, password sign-in stays.

## How it behaves
- Off unless `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and `OAUTH_STATE_SECRET` are all set. Off means no button and `/api/auth/google/*` return 404. `SOCIAL_LOGIN_ENABLED=0` switches it off without removing the keys.
- Only people an Admin already created at `/admin/users` can ever sign in. Role comes from the `User` row, never from Google. There is no signup.
- A Google account is never linked automatically, even if its verified email matches a user. First use: sign in with Google, we email a link to the user's address, they open it and press **Confirm and link** (15 minutes, safe to click twice). After that, Google sign-in works for that user.
- Whoever sees the login page learns nothing about which addresses are team members: an unknown address and a known one show the same message.
- Sessions are the normal admin session (`chiarel_admin_session`, 12 h). No Google tokens are stored.

## Setup (owner)
See the Google Cloud Console steps in the PR that introduced this, or `plan.md` section 6. Redirect URIs: `https://chiarel.com/api/auth/google/callback` (prod), `https://staging.chiarel.com/api/auth/google/callback` (staging), `http://localhost:3000/api/auth/google/callback` (local, with `OAUTH_REDIRECT_ORIGIN=http://localhost:3000`). Set the env vars in hPanel only, then redeploy. Never paste the secret in chat or git.

## Symptoms and fixes
| Symptom | Likely cause | Fix |
| --- | --- | --- |
| No Google button | One of the three env vars unset, or `SOCIAL_LOGIN_ENABLED=0` | Set it, redeploy |
| Google shows `redirect_uri_mismatch` | URI in the Cloud Console differs from `OAUTH_REDIRECT_ORIGIN` + `/api/auth/google/callback` | Make them identical (scheme, host, no trailing slash) |
| Google shows `access_denied` / app not verified | Consent screen still in Testing, or user not a test user | Publish the consent screen to Production |
| "Google sign-in could not be completed" every time | See the audit log: `Google sign-in failed (<reason>)`. `no_state_cookie`: cookie lost (check host, `secure`, proxy); `invalid_grant`-style / `id_token_*`: wrong client secret or clock skew; `email_not_verified` | Fix the cause named; retry |
| "we have emailed a confirmation link" but nothing arrives | Address is not a user (by design silent), or SMTP failing (`[social-login] confirmation email failed` in logs) | Check `/admin/users`; check SMTP env vars |
| 503 "Sign-in is temporarily unavailable" | Database outage or breaker open | `database-outage.md` |
| Google itself is down | Provider outage | Use password sign-in; nothing to fix |

## Actions
- **Provider outage:** password sign-in still works. Nothing to do.
- **Rotate the client secret:** create a new secret in the Cloud Console, update `GOOGLE_CLIENT_SECRET` in hPanel, redeploy, delete the old secret. Rotating `OAUTH_STATE_SECRET` only invalidates sign-ins in progress and unconfirmed link emails.
- **Disable fast:** set `SOCIAL_LOGIN_ENABLED=0`, redeploy. Existing sessions stay valid; linked identities are inert.
- **Unlink a user (until the Phase B profile page exists):** a human runs `delete from "Identity" where "userId" = '<id>'` against production after confirming the user, then uses **Sign out everywhere** at `/admin/users`. Audit the change by hand.
- **A user left or a Google account is compromised:** delete the user at `/admin/users` (their identities cascade) or **Set temp password** and **Sign out everywhere**.
- **Investigate:** `/admin/audit`, filter "Sign-ins": `auth.social_login`, `auth.social_login_failed`, `auth.social_link_pending`, `auth.social_link`.

## Before first production use
Run `prisma migrate diff` against production first (it has had untracked objects twice), apply the `Identity` migration to staging, verify the whole flow there on the real Hostinger runtime, then production.
