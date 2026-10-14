# Staging environment: owner runbook

Why this exists: there is no staging today, so every merge to `main` deploys straight to chiarel.com. On Hostinger, a Next 15 upgrade once caused 504s on every database-backed route. It was reverted, then retried successfully (see the git history around PRs #4 and #6). That class of failure only shows up on Hostinger's real runtime (Node version, process limits, pooled-connection behaviour, startup timeout), not in CI. Staging runs the same code on the same host type against a throwaway database, so the next failure like that lands on `staging.chiarel.com` instead of the live store.

The code side is already in the repo (`APP_ENV=staging`). Everything below needs you in hPanel, Supabase and Stripe; none of it can be done from the repo.

Hostinger's hPanel layout changes. Where a step names a menu, treat the name as a hint and verify against what you actually see. Steps marked **Verify** are the ones most likely to differ.

## What `APP_ENV=staging` does (already in the code)

| Surface | Staging behaviour | Production (APP_ENV unset) |
| --- | --- | --- |
| `/robots.txt` | `User-agent: *` / `Disallow: /`, no sitemap line | Unchanged |
| Every page `<meta name="robots">` | `noindex, nofollow` (root layout) | `index, follow` |
| `/sitemap.xml` | Empty | Full list |
| `/llms.txt` | Short "non-public staging copy" note | Full catalog |
| Banner | Thin fixed strip at the bottom: "STAGING — not the live store" (no layout shift, ignores clicks) | Not rendered |
| Dispute-rate alert scheduler | Does not start: no check, no timer, no email | Runs daily |

Important: robots, sitemap, metadata and `llms.txt` are generated **at build time**. Set `APP_ENV=staging` in hPanel **before** the first build, and rebuild after any change to it. If you add it afterwards without rebuilding, the staging site stays indexable.

Only the exact value `staging` activates this. Anything else (including a typo) behaves as production.

## Part A. One-time setup

### A1. Git branch

```
git checkout main && git pull
git checkout -b staging
git push -u origin staging
```

In GitHub, optionally protect `staging` (require PR + green CI `check`, same as `main`). CI already runs on every pull request regardless of target branch.

### A2. Separate Supabase project (free tier)

1. supabase.com, New project, name `chiarel-staging`. Pick a region close to the Hostinger datacenter. Save the database password.
2. Project Settings > Database > Connection string. You need two:
   - `DATABASE_URL`: the **pooled** string (transaction mode, port 6543). Append `?pgbouncer=true` if the string does not already carry it.
   - `DIRECT_URL`: the **direct** string (port 5432).
   The Supabase UI wording changes (they have moved these between "Connection pooling" and a "Connect" dialog). **Verify** that port 6543 is the pooler and 5432 is direct.
3. Run migrations and seed from your own machine, pointing at the staging database only. In PowerShell, in the repo, with the two values pasted into the current shell (do not put them in `.env.local`, which would aim your local dev at staging):

```
$env:DATABASE_URL = "<staging pooled URL>"
$env:DIRECT_URL   = "<staging direct URL>"
$env:BOOTSTRAP_ADMIN_EMAIL    = "<your email>"
$env:BOOTSTRAP_ADMIN_PASSWORD = "<a throwaway staging password>"
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

   Note: `npm run db:seed` loads `.env.local` and `.env` through dotenv, which would override or mix with these. Use `npx tsx prisma/seed.ts` directly as shown. Close the shell afterwards so the variables do not leak into later commands.
4. The seed creates the products and, because the two BOOTSTRAP variables are set, the first Admin account. That is the staging admin login for `/admin`. Use a password that is **not** reused from production.
5. Known risk: production's schema has drifted from the migrations twice (see the migration-drift memory note). A clean `migrate deploy` on an empty staging database proves the migrations alone build a working schema. If it fails, that is a real finding about the migration history, not a staging problem.

### A3. Stripe test-mode webhook

Stripe is in test mode today, so staging uses the same test keys' account but its own webhook endpoint.

1. Stripe dashboard, toggle **Test mode** on. Developers > Webhooks > Add endpoint.
2. Endpoint URL: `https://staging.chiarel.com/api/webhooks/stripe`.
3. Select the same events the production endpoint uses. **Verify** by opening the existing production test endpoint and copying its event list (the handler in `app/api/webhooks/stripe/route.ts` is the authority on which events it reads).
4. Save, then reveal the **signing secret** (`whsec_...`). This is staging's own `STRIPE_WEBHOOK_SECRET`. Do not reuse the production one: each endpoint has its own secret, and a mismatch makes every webhook fail signature checks.
5. Keys: use the same `sk_test_...` and `pk_test_...` as the test-mode production site. They are test keys and move no real money. If you ever switch production to live keys, staging must stay on test keys, so do not copy the production env block wholesale after that point.

### A4. Hostinger: second Node app on `staging.chiarel.com`

1. **DNS.** hPanel > Domains > chiarel.com > DNS / Nameservers. Add a subdomain `staging` (hPanel usually has a Subdomains section that creates the DNS record and the web root together). **Verify** it resolves: `nslookup staging.chiarel.com`. A stale or conflicting record blocks the bind (see the deploy-readiness-checklist skill).
2. **Create the Node.js app** for that subdomain (hPanel > Websites > Add website / Node.js Web App, or the Node.js section for the subdomain; the name has changed over time). **Verify** the exact menu.
3. **Source:** connect the same GitHub repository, branch **`staging`** (not `main`). This is the whole point: staging auto-syncs from `staging`, production from `main`. **Verify** the branch field really says `staging` before the first deploy.
4. **Build and start settings.** Copy whatever the production app uses, character for character: same Node version (the Node version must match production, because a Node mismatch is the most likely thing staging is meant to expose), same install/build commands, same start command (`npm run start`, which runs `node .next/standalone/server.js`), same entry/root directory. **Verify** against the production app's settings page side by side.
5. **Environment variables** (set in the Node app's environment settings, all before the first build):

| Variable | Value |
| --- | --- |
| `APP_ENV` | `staging` |
| `DATABASE_URL` | staging Supabase pooled URL (A2) |
| `DIRECT_URL` | staging Supabase direct URL (A2) |
| `STRIPE_SECRET_KEY` | `sk_test_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` (this one is baked in at build time, so it must exist before the build) |
| `STRIPE_WEBHOOK_SECRET` | staging endpoint's `whsec_...` (A3), not production's |
| `ADMIN_SESSION_SECRET` | freshly generated, see below; never the production value |
| `HOSTINGER_SMTP_HOST` / `_PORT` / `_USER` / `_PASS` | **leave unset** |
| `DISPUTE_ALERT_EMAIL` | **leave unset** |
| `FOUNDING_LIST_WEBHOOK_URL` | **leave unset** (otherwise staging sign-ups would post into the real CRM/Slack/Zapier) |
| `BOOTSTRAP_ADMIN_*` | not needed on the host (the seed ran from your machine) |

   Generate the session secret locally: `openssl rand -base64 32` (or in PowerShell: `[Convert]::ToBase64String((1..32 | % { Get-Random -Max 256 }))`). A separate secret means a staging session cookie can never be valid on production.
6. Enable HTTPS / SSL for `staging.chiarel.com` (Hostinger's free SSL, usually automatic after DNS propagates). Stripe will not deliver webhooks to a non-HTTPS endpoint.
7. Deploy. Watch the build log for the font and Prisma steps (see the Hostinger build-fix note: fonts are self-hosted so the build container needs no outbound font fetch).

### A5. First-boot checks (do these before trusting staging)

Run through the full verification checklist in Part C once. Pay particular attention to items 1, 2 and 6: they prove staging cannot be indexed, cannot email, and really talks to the staging database.

## Part B. Promotion flow (every change from now on)

1. Branch from `main`, make the change, open a PR **into `staging`** (not `main`). CI runs (`tsc`, `lint`, `vitest`, `build`).
2. Merge to `staging`. Hostinger auto-deploys `staging.chiarel.com`.
3. Verify on staging using Part C. For anything touching dependencies, Next/Prisma/Node versions, DB access, or checkout, this step is mandatory, not optional.
4. Run a Stripe **test card** checkout end to end: card `4242 4242 4242 4242`, any future expiry, any CVC, any postcode. Confirm the order appears in the staging database/admin and the webhook shows a 200 in Stripe's webhook log for the staging endpoint.
5. Only when staging is healthy: open a PR from `staging` into `main`. CI runs again. Merge. Production auto-deploys.
6. Spot-check chiarel.com after the deploy (home page, one product page, `/robots.txt` must still show the production rules).

Rules:
- Never merge to `main` a change that has not sat on staging.
- Hotfixes: fix on `main` as normal if the live store is down, then merge `main` back into `staging` so the branches do not drift.
- After each `main` merge, keep `staging` up to date (`git checkout staging && git merge main && git push`), or the next PR will carry unrelated diffs.

## Part C. Verification checklist (run on staging.chiarel.com)

1. `https://staging.chiarel.com/robots.txt` shows only `User-agent: *` and `Disallow: /`.
2. View source of the home page and one product page: `<meta name="robots" content="noindex, nofollow">` is present. `/sitemap.xml` is empty (no `<url>` entries). `/llms.txt` shows the staging note.
3. The bottom banner "STAGING — not the live store" is visible, and clicking through the page is unaffected.
4. The same page on chiarel.com has **no** banner and still shows `index, follow` and the full sitemap.
5. Home, shop, a product page, the founding-100 page and a journal article all return 200 with no console errors.
6. **Database-backed routes** (the Hostinger lesson): load `/shop/<any product>`, add to cart, open the cart drawer, load `/checkout`. These all hit the database. Any 504, 500 or long hang here is exactly the failure staging exists to catch. Do not promote.
7. Test checkout with `4242 4242 4242 4242`: order is created, success page loads, Stripe's webhook log shows 200 for the staging endpoint, order is visible in staging admin.
8. Declined card `4000 0000 0000 0002` shows a clean failure, no stuck order.
9. `/admin` login works with the staging admin, and does **not** work with a production admin login (proves separate database and session secret).
10. Server log shows no `[dispute-monitor] scheduler started` line (it must not start on staging).
11. Check the Node app's resource use and restart behaviour after a few minutes idle: the 504 class of failure often appears on first request after the process sleeps.

## What staging does NOT cover

- **Real card behaviour.** Stripe test mode only. Live-mode keys, 3-D Secure variations, real disputes and payouts are untested. Stripe live is a separate go-live step.
- **Production data volume and shape.** Staging has seed data only. Slow queries, data-dependent bugs and the production schema's known drift are not reproduced. (Staging's clean migrations can pass while production's drifted schema fails; diff before relying on this, see `chiarel-migration-history-drift`.)
- **Real email.** SMTP is deliberately unset, so email sending is untested here. The dispute alert path is disabled on staging by design.
- **CDN and cache behaviour on the apex domain.** Hostinger's CDN caching differs per domain; a cache problem on chiarel.com can still be invisible on the subdomain.
- **Third-party webhooks other than Stripe's** (Founding list webhook is intentionally off).
- **Shared-host noise.** Two Node apps on one Hostinger plan share resources. A staging build running at the same time as a production request can cause its own slowness; do not read a one-off staging slowdown as proof about production.
- **Anything configured only in dashboards** (DNS, SSL, Stripe settings, Supabase settings) is not versioned, so drift between staging and production there is on you to check.

## Rollback

Staging is disposable, so rollback has two levels.

- **A bad change on staging:** `git revert` the merge commit on `staging` (or reset the branch to the last good commit with a force push, since nothing live depends on it), push, and let Hostinger redeploy. Nothing reached production.
- **A bad change that already reached `main`:** revert the merge on `main` through a PR (as was done for the Next 15 upgrade), merge, let production redeploy, then also sync the revert into `staging`. Check the live store using the Part C items that apply (6 and 7 above in particular).
- **Staging database in a bad state:** it holds no real data. Reset it from Supabase (Project Settings > Database, reset, or drop and recreate the project), then repeat A2 steps 3 and 4. Never run a destructive reset against production's connection string: always confirm which URL is in your shell first.
- **Retire staging:** delete the Hostinger Node app and the DNS record, delete the Supabase project, delete the Stripe test webhook endpoint. The `APP_ENV` code is inert when the variable is unset.
