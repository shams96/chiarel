# Development Strategy: what we follow and where we fall short

Assessed 2026-10-07 against the repository, not from memory.

## Followed

| Practice | Evidence |
| --- | --- |
| Spec-driven development for features | Five feature folders in `claudedocs/specs/` (admin-rbac, dispute-risk-mitigation, international-launch, product-image-gallery, n1-campaign-photo-relabel), each with SPEC, PLAN, TASKS, and CONVERGE where finished; `CONSTITUTION.md` |
| Converge against the original spec | `CONVERGE.md` in admin-rbac and dispute-risk-mitigation |
| Server-side authorization, deny by default | `withRole()` on every admin route; sessions in the database |
| Server-side price calculation, single shared pricing rule | `lib/pricing.ts` used by client and server; unit tested |
| Webhook signature verification and idempotent updates | `app/api/webhooks/stripe/route.ts` |
| Security headers, rate limits on public write endpoints | `middleware.ts`, `lib/rate-limit.ts` |
| Dev and production database separation | Docker Postgres for dev, Supabase for production (since 2026-09-30) |
| Versioned schema migrations | `prisma/migrations/`, with a drift-diagnosis routine |
| Pre-deploy security audit and QA sweep | 2026-09-30 four-agent sweep; fixes shipped |
| Honest placeholders instead of invented content | Constitution rule; N1 formula and evidence placeholders |
| Runbook written alongside the feature | `DISPUTE_RESPONSE_RUNBOOK.md` |
| Verify against the running artifact | Live-site checks, build output inspected, computed styles read in the browser |
| Small commits with explanatory messages, typecheck before commit | 135 commits |
| Shared, global fixes | `lib/motion.ts`, shared CSS classes, one asset file (owner rule, 2026-10-03) |
| Documentation of standards | `image-and-motion-standards.md`, memory notes, this folder |

## Not followed or incomplete

| Gap | Risk | Suggested fix |
| --- | --- | --- |
| **CI is new and advisory** (`.github/workflows/ci.yml`, added 2026-10-09) | It runs typecheck, lint, tests and build after each push, but Hostinger still deploys `main` without waiting for it | Branch protection plus pull requests so nothing reaches `main` unless CI is green |
| **Thin automated tests**: 21 tests, two files | Checkout, webhook, cart, auth and RBAC have none. Regressions are found by hand | Tests for `withRole`, cart totals on the server, webhook idempotency, checkout validation |
| **Work committed straight to `main`** | The global rules ask for feature branches. Every change here deploys immediately to production | Feature branches and pull requests, with CI as the gate |
| **No staging environment** | The first real test of a build is production | Hostinger staging or a preview deploy |
| **No error or uptime monitoring** | Failures such as the failed deploy were found by the owner, not by an alert | Uptime check on `/` and the webhook; error reporting |
| **Dependency vulnerabilities** (npm audit 20, 10 in production; Hostinger reports 46) | Known issues in Next.js 14 and Vitest 2 | Planned upgrade to Next.js 15 and Vitest 3 with a full regression pass |
| **Deploy not verified after push** | Pushes have deployed unseen failures | Check hPanel deployment status after every push |
| **Specs written after the fact for the whole site** | The foundation documents here were written after the build | Keep them current; update when behaviour changes |
| **Rate limiting is in memory** | Resets on restart, not shared between instances | Move to a shared store if traffic grows |
| **Backups and restore not documented or tested** | Recovery time unknown | Confirm Supabase backup retention and test a restore |
| **No documented data deletion path** | Privacy requests are manual | Short SOP |
| **Mistakes that needed the owner to find them** | N1 image needed three attempts; the per-product hover animation never worked until it was checked in the browser | Before changing an asset or shared style, inspect how the existing ones are built, and verify the actual rendered result |

## Working rules

1. Non-trivial features go through spec-driven development. Small fixes use assess, fix, test.
2. Fix in the shared source, never page by page.
3. Verify against the running site, not only the code.
4. Check an existing asset's real properties before matching them.
5. Ask before any action on production data, secrets, or domain settings.
6. Name the fonts: Libre Bodoni and Jost.
7. After every push, confirm the deploy actually succeeded.
