# Runbook: shop or admin returns 503 ("Something went wrong on our end")

Applies to chiarel.com on the Hostinger shared plan. Written after the 2026-10-28 and 2026-10-29 outages.

## Symptoms
- Admin sign-in returns 503 even with a wrong password; `/api/products` 503; checkout and bag fail.
- Home, Shop and product pages still load (they are static). That pattern means the Node app is up and its **database path** is down.

## Tier 1: the app heals itself (no action)
The app defends itself (ADR-0001):
- **Circuit breaker** (`lib/db-breaker.ts`): after 3 connectivity failures in 30 s, database routes answer 503 + `Retry-After` in milliseconds instead of hanging. After 15 s one probe request tries the database; success closes the breaker.
- **Client replacement** (`lib/db-client.ts`): every connectivity failure replaces the Prisma client (new engine, new pool), at most once per 10 s. It never exits the process; the host does not reliably restart it.
- **Thread cap** (`lib/db-engine-limits.ts`): the Prisma engine starts 2 worker threads, not one per host core.
- **Repair by polling**: `/api/health?db=1` bypasses the breaker, replaces the client on failure and closes the breaker on success. An external monitor on that URL both alerts and nudges recovery.

## Tier 2: diagnose (assisted triage, 2 minutes, read-only)
```
curl -s "https://chiarel.com/api/health?db=1"
```
| Response | Meaning | Next |
|---|---|---|
| `{"ok":true,"db":{"ok":true}...}` | Healthy | Nothing |
| `db.code` `PrismaClientRustPanicError` | Engine crashed (likely Hostinger process/thread cap) | Tier 3 |
| `db.code` `TIMEOUT` / `PrismaClientInitializationError` / `P1001` | App cannot reach the database | Check Supabase status, then Tier 3 |
| `breaker: "open"` | Breaker is refusing requests; the cause is above | Wait 15 s and re-run; if it stays open, Tier 3 |
| `env.DATABASE_URL: false` | Env var missing in Hostinger | Add it in Hostinger, redeploy |
| request itself hangs or fails | Node process or host is down | Tier 3 |

Also check the database from a laptop (pooled URL, `select 1`) and Supabase connection count. If those are fine, the fault is on the Hostinger side.
Hostinger: **Websites, 1hubsolutions.com, Hosting Plan, Resources usage**. "Max Processes" pinned at 120 with Faults means the plan's process cap is the cause.

## Tier 3: restore (human action)
1. Hostinger hPanel, chiarel.com, **Redeploy**. (Or merge any PR to `main`; auto-deploy restarts the app.)
2. Wait about 3 minutes, re-run the health check, then sign in to `/admin`.
3. If it fails again within a day, do not keep restarting: follow ADR-0001 (move the shop off the shared plan).

## Monitoring (owner action, 5 minutes)
Add a free external monitor (UptimeRobot or Better Stack) on `https://chiarel.com/api/health?db=1`, every 5 minutes, alert on non-200 to the owner's phone/email. Keep it at 5 minutes or more: the db probe is rate limited to 10 per minute per IP.

## What this does not fix
The shared plan's 120-process cap shared with 10 other sites. See `claudedocs/adr/0001-database-resilience-and-hosting.md`.
