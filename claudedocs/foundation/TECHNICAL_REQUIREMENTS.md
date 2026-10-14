# Technical Requirements

## 1. Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js 15 (App Router), React 18, TypeScript | `output: standalone`, served with `node .next/standalone/server.js` |
| Styling | Tailwind CSS 4 plus `app/globals.css` | Tokens and v3-compatible line-heights in the `@theme` block of `app/globals.css`; there is no `tailwind.config.ts`. Fonts use `@theme inline` against the `--font-bodoni` and `--font-jost` variables set by `next/font` (see `chiarel-tailwind4-migration` memory). Needs Node 20 or newer |
| Motion | CSS plus framer-motion | Shared in `lib/motion.ts` and `components/Reveal.tsx` |
| Fonts | Libre Bodoni (headlines) and Jost (body), self-hosted via `next/font/local` | Files in `public/fonts/`. Do not use `next/font/google`: it fetches at build time and breaks the Hostinger build |
| Database | PostgreSQL through Prisma 6.12 | Production: Supabase. Local dev: Docker container `chiarel-postgres` on port 5434 |
| Payments | Stripe Checkout, Stripe Tax, webhooks | Test mode today |
| Email | Nodemailer over Hostinger SMTP | Used only for the dispute-rate alert |
| Auth (admin only) | Custom, bcryptjs password hashes, DB-backed sessions, HMAC-signed cookie | `lib/auth.ts` |
| Tests | Vitest 5 | `lib/*.test.ts` (pricing, countries, password) and `tests/` (Stripe webhook, cart, checkout, admin auth and permissions) |

## 2. Environments

| Environment | Database | Stripe | How to run |
| --- | --- | --- | --- |
| Local dev | Docker Postgres (`.env.local` overrides `.env`) | Test keys | `npm run db:dev:start`, then `npm run dev` |
| Production | Supabase Postgres (pooled `DATABASE_URL`, unpooled `DIRECT_URL`) | Currently test keys, set in Hostinger's panel | Hostinger auto-deploys from `main` on push |

There is no staging environment. Production secrets live only in Hostinger's environment panel, not in the repo. `.env.example` lists every variable.

## 3. Hosting and deploy

- Hostinger Node hosting, git auto-sync from `main`. Pushing `main` triggers a build.
- The build must not need network access to third-party hosts (the Google Fonts failure showed Hostinger's build container cannot reach `fonts.googleapis.com`).
- Static pages are revalidated hourly (`revalidate = 3600` in `app/layout.tsx`) because Hostinger's CDN does not purge on deploy.
- A deploy can fail silently on a push. Check the deployment status in hPanel after every push.

## 4. Security requirements

- **Headers** (`middleware.ts`): CSP, `X-Frame-Options: DENY`, `nosniff`, referrer policy, HSTS in production.
- **Admin routes:** every `/api/admin/*` handler is wrapped in `withRole([...])`, which checks the session on the server. Deny by default. The interface is not a security boundary.
- **Sessions:** stored in the database so a role change or removal takes effect immediately.
- **Money:** prices and totals are recomputed on the server in `lib/cart-server.ts` and the checkout route. Webhook signatures are verified. Webhook order updates are idempotent.
- **Abuse limits:** checkout is rate-limited per IP (`lib/rate-limit.ts`, in memory, so it resets on restart and is per instance).
- **Secrets:** none in source. `ADMIN_SESSION_SECRET` must be a real random value.
- **Cart cookie:** `chiarel_cart_id`, httpOnly, 90 days.

## 5. Performance and SEO requirements

- Images through `next/image`; packshots follow `DESIGN_BRIEF.md`.
- Structured data on key pages (Organization, Product/Offer for priced products, BreadcrumbList, HowTo for the rituals, Article).
- `sitemap.xml`, `robots.txt`, `llms.txt`. Every new page follows `chiarel-discoverability-standard` (memory) and the checklist in the SEO audit notes.

## 6. Data and migrations

- Prisma Migrate with files in `prisma/migrations/`. Production schema has drifted before (objects created by an early `db push`), so check with `npm run db:prod:status` before and after any migration.
- Never run a migration against production without the owner confirming.

## 7. Known technical gaps

- CI (`.github/workflows/ci.yml`: typecheck, lint, tests, build) runs on every push and pull request. `main` is protected (2026-10-09): changes go through a pull request and the `check` job must pass; the repo admin can still override. Hostinger deploys `main` on merge, so test a Stripe test-mode checkout before merging anything that touches checkout, cart or webhooks.
- Tests: 110 across 8 files. Unit tests cover pricing, countries and password hashing. Route tests with an in-memory database stand-in cover the Stripe webhook, cart, checkout and admin auth (a scan fails the build if any admin route lacks `withRole`). Not covered: real database queries, the real Stripe API, page rendering, the order confirmation page, the Founding 100 signup route.
- No error or uptime monitoring, no alerting except the dispute-rate email.
- No staging environment.
- `npm audit` reports 7 vulnerabilities (2 in production dependencies, none critical) as of 2026-10-14, down from 20 with 1 critical. Next.js 15.5.27, Vitest 5 and Tailwind 4 are done. What remains is the `eslint-config-next` tooling chain and the PostCSS 8.4.31 copy bundled inside Next.js (build-time only, so it never runs against user input in production). Hostinger's scanner reports a higher count. See `claudedocs/audit-2026-10-09.md`.
- Rate limiting is in memory and per instance.
