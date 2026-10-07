# Technical Requirements

## 1. Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js 14 (App Router), React 18, TypeScript | `output: standalone`, served with `node .next/standalone/server.js` |
| Styling | Tailwind CSS 3 plus `app/globals.css` | Tokens in `tailwind.config.ts` |
| Motion | CSS plus framer-motion | Shared in `lib/motion.ts` and `components/Reveal.tsx` |
| Fonts | Libre Bodoni (headlines) and Jost (body), self-hosted via `next/font/local` | Files in `public/fonts/`. Do not use `next/font/google`: it fetches at build time and breaks the Hostinger build |
| Database | PostgreSQL through Prisma 6.12 | Production: Supabase. Local dev: Docker container `chiarel-postgres` on port 5434 |
| Payments | Stripe Checkout, Stripe Tax, webhooks | Test mode today |
| Email | Nodemailer over Hostinger SMTP | Used only for the dispute-rate alert |
| Auth (admin only) | Custom, bcrypt password hashes, DB-backed sessions, HMAC-signed cookie | `lib/auth.ts` |
| Tests | Vitest | `lib/pricing.test.ts`, `lib/countries.test.ts` |

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

- No CI. Nothing runs tests, type-checking or the build automatically before a push to `main`.
- Test coverage is thin: 25 tests covering pricing and countries only. Checkout, webhook, auth and cart have no automated tests.
- No error or uptime monitoring, no alerting except the dispute-rate email.
- No staging environment.
- `npm audit` reports 46 vulnerabilities (3 critical, 19 high), mostly from Next.js 14 and Vitest 2 needing major-version upgrades. Not yet addressed.
- Rate limiting is in memory and per instance.
