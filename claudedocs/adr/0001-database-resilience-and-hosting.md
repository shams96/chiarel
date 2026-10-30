# ADR-0001: Database resilience in the app, and where the shop should run

Status: resilience decisions implemented; hosting decision PROPOSED, needs the owner (cost and account).
Date: 2026-10-29

## Context
chiarel.com is a Next.js app on Hostinger's Business shared plan, with Supabase Postgres in another region. That plan hosts 11 sites under one hard limit of **120 processes/threads** (hPanel, Resources usage, "Max Processes", limit 120; observed at the limit continuously, with Faults, on 2026-10-28).

Two outages in two days took every database route down (admin sign-in, `/api/products`, bag, checkout) while static pages kept working:
1. 2026-10-28: `/api/health?db=1` returned `PrismaClientRustPanicError` in 6 ms. The Prisma query engine had crashed and rejected every query until the process restarted. Supabase was healthy (13/60 connections) and the same URL worked from a laptop.
2. 2026-10-29: same app, 20 h uptime, `db.code: TIMEOUT`; each DB request hung ~20 s before failing. Supabase healthy again.

Measured (local, 12 cores): the Prisma engine adds one worker thread per CPU core, 32 threads per Node process by default and 22 with `TOKIO_WORKER_THREADS=2`. On a many-core shared host under a 120 limit that is the largest controllable consumer. That the engine crash is caused by failed thread creation at the cap is **inferred** (it fits the evidence; it was not observed directly because Hostinger exposes no runtime log).

## Decisions (implemented)
1. **Cap the engine's threads in code** (`lib/db-engine-limits.ts`, also in `instrumentation.ts`), default 2, operator override respected. Not left to a Hostinger env var that someone has to remember.
2. **Circuit breaker on the database path** (`lib/db-breaker.ts`, `withDbBreaker`). While the database is unreachable, DB routes fail in milliseconds with `Retry-After`; routes that do not touch the database (static pages, empty cart) are unaffected. Rationale: hung requests hold the scarce processes, so an outage fed itself.
3. **Replace the client, never exit the process.** This reverses the exit-on-repeat-panic fallback shipped in #115: the app's own startup code documents that the host does not necessarily restart a dead process, and an exit would take the static storefront down with the database path. Replacement is rate limited (10 s) and the breaker covers the gap.
4. **The health probe is the repair path** (`/api/health?db=1`): bypasses the breaker, replaces the client on failure, closes the breaker on success, reports `breaker` and `engineThreads`. An external monitor on it gives alerting and recovery without a human.
5. **Runbook** (`claudedocs/runbooks/database-outage.md`) with three tiers: automatic, diagnose, restore.

## Decision (proposed, owner)
**Move the shop's runtime off the shared 11-site plan before Stripe goes live.** The app tier is stateless (database, auth data and images are external or in the repo), so this is a deploy-target change, not a rewrite.

| Option | Pros | Cons |
|---|---|---|
| Hostinger Cloud or VPS for chiarel.com alone | same vendor, no new account, own process limit | VPS means we operate the server (updates, restarts) |
| Vercel Pro (or Render/Railway/Fly) | managed Node, no process cap, previews per PR, instant rollbacks | new account and monthly cost; Hobby tier forbids commercial use |
| Stay, upgrade the shared plan | no migration | other sites still compete for the same cap |

Recommendation: a managed Node host (Vercel Pro) for chiarel.com, keeping Supabase; revisit in 90 days. Until then Decisions 1-5 keep the failure mode to "database routes briefly 503 and recover", not "shop down until someone redeploys".

## Consequences
- Database routes now fail fast during an outage (good for resources, visible as 503 + Retry-After to clients).
- Checkout and bag still need the database; a real outage still blocks purchases. The monitor makes that visible within minutes.
- A first failing request after a quiet period can still take up to the connect timeout; the breaker opens after three.

## Not decided here
Moving the other 10 sites; Supabase region/plan; replacing Prisma's Rust engine with a driver adapter (Rust-free) as a later option if the thread cost stays a problem.
