# Hosting move: scope, options and plan

Status: SCOPING ONLY. Nothing is bought, changed or migrated by this document. Needs owner decisions H1 to H4.
Date: 2026-11-09. Follows ADR-0001 (`claudedocs/adr/0001-database-resilience-and-hosting.md`), which proposed this move on 2026-10-29 and was never decided.

Evidence tags: **verified** = seen this session, **inferred** = reasoned, **unknown** = not checked.

## 1. Specify: what and why

### Problem
chiarel.com runs on Hostinger's shared Business plan with 10 other sites under one limit of 120 processes and threads (ADR-0001, from hPanel). It has gone down repeatedly:

| Date | Symptom | Cause status |
|---|---|---|
| 2026-10-28 | DB routes dead, `PrismaClientRustPanicError` | inferred: thread cap |
| 2026-10-29 | DB requests hang ~20 s, `TIMEOUT` | unknown |
| 2026-11-09 | whole site 503, then no response at all (every route, including `/api/health`) | unknown; restart fixed it |

**Verified on 2026-11-09:** the last build (commit 3ce8ea7) completed and Hostinger reported a restart at about 02:32 UTC, yet the process did not answer. `hosting_nodejs_restart-application` brought it back in under 12 s (`uptimeSeconds` 71). Hostinger's runtime-logs endpoint returned HTTP 500 (correlation ids a32e4bcc…), so the process output is **unknown**.
**Verified:** the 503 body was Hostinger's own page (`Server: hcdn`), not the app's JSON 503 with `Retry-After`. The in-app defences (breaker, thread cap, client replacement) cannot help when the whole process is hung or killed.
**Inferred, not confirmed:** the shared 120-process cap, and two back-to-back builds (PRs 162 and 161, merged 4 minutes apart) as a trigger.

### Goal
A shop that stays up without a person restarting it, and when it does fail, tells us within minutes.

### Success criteria
1. No outage caused by other sites' load (the process limit is ours alone).
2. Any hang or crash is detected by an external check within 5 minutes and recovered by the host or by a runbook step that takes under 5 minutes.
3. Deploying a PR cannot take the live site down (build does not compete with serving, or a failed or slow build leaves the old version serving).
4. Cutover with no checkout, Stripe webhook or login disruption; rollback in under 10 minutes.
5. No change to the storefront's look, copy or prices.

### Out of scope
Moving the other 10 sites; changing Supabase region or plan; replacing Prisma's Rust engine (a later option); Stripe live-mode work; any redesign.

## 2. What the app needs from a host (verified from `main`)

- Next.js 15.5, `output: "standalone"`, built with `next build`, run as `node .next/standalone/server.js` (`package.json`, `next.config.mjs`).
- **Long-lived process required today.** `instrumentation.ts` starts three `setInterval` jobs in-process: dispute monitor (daily), cart prune (daily), order sweep (`lib/order-sweep.ts`, expires stale pending orders, so a missed run leaves orders stuck). On a serverless host they would not run reliably.
- `images.unoptimized: true`, so no `sharp` and no image optimizer. Fine on any host.
- Postgres on Supabase (`DATABASE_URL`, `DIRECT_URL`). The host only needs outbound access to it.
- Stripe webhook at `/api/webhooks/stripe`, signed with `STRIPE_WEBHOOK_SECRET`. A move that keeps the domain keeps the URL.
- 28 environment variables used in code: `ACCOUNTS_SMTP_*`, `ADMIN_SESSION_SECRET`, `APP_ENV`, `CUSTOMER_SESSION_SECRET`, `DATABASE_URL`, `DIRECT_URL`, `DISPUTE_ALERT_EMAIL`, `FOUNDING_LIST_WEBHOOK_URL`, `GOOGLE_CLIENT_ID/SECRET`, `HOSTINGER_SMTP_*`, `KLAVIYO_*`, `NEXT_PUBLIC_EMAIL_SIGNUP`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `OAUTH_REDIRECT_ORIGIN`, `OAUTH_STATE_SECRET`, `SOCIAL_LOGIN_ENABLED`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `TOKIO_WORKER_THREADS`, `UNSUBSCRIBE_SECRET`. Values live only on the current host and in `.env.local`; none are in git.
- **Node version:** the host builds on Node 18.20.8 and `npm install` prints EBADENGINE warnings for 8 dependencies that want Node 20 or 22 (`nodemailer`, `vite`, `vitest`, `rolldown` and others). The build still passes and the app runs. A new host should be Node 22.
- Build cost: `npm install` 1 m 48 s, `next build` 1 m 58 s, 4 m 3 s end to end (verified, build 01a1be22…). Auto-deploy fires on every merge to `main`.
- Email goes through Hostinger SMTP (`HOSTINGER_SMTP_*`), which does not depend on where the app runs.

## 3. Options

Prices are Hostinger's catalogue as read through its API on 2026-11-09 (USD; renewal price in brackets). Vercel's figure is from memory and **unverified**.

| | A. Hostinger Cloud plan | B. Hostinger VPS | C. Managed serverless (Vercel Pro) |
|---|---|---|---|
| What it is | Same Node.js Web App runner and git auto-deploy as today, on a Cloud plan (own resources, not 11 sites) | A Linux server we run: Node 22, process manager, reverse proxy, TLS, deploy script | Serverless functions, previews per PR, instant rollback |
| Price | Cloud Startup $27.99/mo, or $119.88 first year ($311.88 renewal). Professional $47.99/mo, or $431.76 for the first 2 years | KVM 2 (2 vCPU, 8 GB, 100 GB) $24.49/mo, or $119.88 first year ($203.88 renewal). KVM 1 (1 vCPU, 4 GB) $19.49/mo, first year $83.88 | about $20 per seat per month, unverified |
| Code change | none | none (add a start script and process manager config) | **yes**: the three in-process jobs must become cron routes; Prisma engine on serverless needs a connection pooler review |
| Fixes the shared cap | yes if the plan's limits are ours alone. **Process limit of a Cloud plan is unknown** and must be read from hPanel before buying | yes, no one else on the box | yes, no process cap |
| Fixes "deploy takes the site down" | partly: same runner, so a restart still happens; our build still runs on our box | no by default (we would build elsewhere or accept the restart) | yes, atomic deploys |
| Who restarts a hung process | Hostinger runner, plus our API access | we configure a supervisor (systemd or PM2) and a health check | the platform |
| Ops burden on us | low | medium to high (OS updates, TLS, backups, firewall) | low |
| Rollback | repoint domain or redeploy previous commit | repoint DNS | one click |
| Risk | Cloud plan may carry limits we cannot see until we use it | we become the on-call | schedulers and Prisma need rework before the move |

### What the evidence does and does not support
- It supports moving off the shared 11-site plan. It does **not** prove the shared cap caused today's hang, because the logs are unavailable. Option A or B only fixes it if that inference is right; the external monitor (below) is needed under every option.
- ADR-0001 recommended Vercel Pro. That recommendation did not account for the in-process schedulers (section 2), which the ADR does not mention. That raises C's cost from "deploy-target change" to "deploy-target change plus a code change and its tests".

## 4. Recommendation

1. **Now, regardless of option: an external uptime check** on `https://www.chiarel.com/api/health` (and `?db=1`) every 1 to 5 minutes, alerting you by email or SMS. Today the outage was found by a person. This is free on most monitors and needs an account on your side (H3).
2. **Gate before spending:** read hPanel > Resources usage for chiarel.com's plan (Max Processes, faults, memory) for the last 7 days. If it sits at the limit, the shared-cap inference holds and a move is justified. If not, we have been guessing and a bigger plan may not help. This takes you two minutes and is the cheapest evidence available (H1).
3. **Preferred move: Option A, a Hostinger Cloud plan**, starting with Cloud Startup, because it keeps the deploy path, the runner and every env var as they are, needs no code change, and can be driven through the API access we already have. Fall back to B (KVM 2) if hPanel shows Cloud Startup's process limit is not materially higher than the shared plan's. Choose C only if you want previews per PR and atomic deploys badly enough to fund the scheduler rework.
4. Run Node 22 on whichever host (H2).

This is a recommendation with an unverified premise (the cap). It is not a prediction that the move ends outages.

## 5. Plan (phases, each reviewed before the next)

**Phase 0, evidence (you, 10 minutes):** hPanel resource usage screenshot; pick H1 to H4 below. Nothing changes.

**Phase 1, monitor and runbook (me, no purchase):**
- Add a whole-app-down section to `claudedocs/runbooks/database-outage.md`. That runbook covers "app up, DB path down"; the 2026-11-09 pattern is "process not answering", with a different first step (restart via hPanel or `hosting_nodejs_restart-application`, then check `uptimeSeconds` on `/api/health`).
- Document the monitor setup and the exact health URLs.
- Optional, small code: none needed.

**Phase 2, new host ready, no traffic (me plus you):**
1. You buy the plan (a billing action; I do not place orders).
2. Create the site on the new plan under a temporary domain or subdomain; connect GitHub auto-deploy to a staging branch, not `main`.
3. Copy the 28 env variables across (values from your password manager or `.env.local`; I never print them). Set `APP_ENV` for staging so test mode is obvious; Stripe stays in test mode.
4. Set Node 22. Build. Run `scripts/smoke.mjs` against the new URL, including `/api/health?db=1`, checkout in Stripe test mode, admin login, customer login, one email.
5. Confirm the three schedulers started (log lines at startup) and that the order sweep ran once.

**Phase 3, cutover (you click, I verify):**
1. Lower DNS TTL a day ahead.
2. Point `chiarel.com` and `www` at the new host; keep the old site untouched.
3. Update `OAUTH_REDIRECT_ORIGIN` only if the domain changes (it should not).
4. Verify the Stripe webhook receives a test event at the unchanged URL.
5. Watch the monitor for 24 hours.

**Phase 4, rollback and retire:** rollback is repointing DNS to the old host (under 10 minutes once TTL is low). Keep the old site live for 7 days, then remove it from the shared plan. The other 10 sites are untouched throughout.

## 6. Owner decisions

- **H1** Provide the hPanel resource usage (Max Processes, faults) for the last 7 days, or approve buying without it.
- **H2** Option A, B or C (my recommendation: A, then B as fallback).
- **H3** An uptime monitor account and an alert address or number.
- **H4** Budget: roughly $120 for the first year on A or B, about $312 or $204 a year after (catalogue prices, subject to change at checkout).

### Decision log
- 2026-11-11, **H2 = Option A (Hostinger Cloud plan)**, chosen by the owner. Still open: H1 (hPanel resource usage; there is no API for it on the shared plan, only on Agency plans), H3 (monitor), H4 (purchase, a billing action only the owner places). Phase 1 (runbook) is done in this PR; Phase 2 starts when the plan exists.

## 7. Risks and unknowns

- Process, memory and CPU limits of Hostinger's Cloud plans are **unknown** (the catalogue returns no limits). Read them in hPanel before buying.
- The root cause of 2026-11-09 is **unknown**; runtime logs were unavailable (HTTP 500 from Hostinger's logs endpoint). If it recurs on the new host, read the logs first.
- Supabase connection limits and Hostinger egress to the pooler were never ruled out as a cause of the 2026-10-29 hang (ADR notes this as unverified).
- Moving hosts changes outbound IPs; if Supabase network restrictions are on, the new IP must be allowed first.
- A VPS (B) makes us responsible for patching and backups; do not choose it without accepting that.

## 8. Converge (to fill after execution)

Compare against the success criteria in section 1: monitored, recovered under 5 minutes, deploys cannot take the site down, cutover and rollback tested, storefront unchanged.
