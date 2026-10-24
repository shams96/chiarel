---
title: Production DB hangs from the host while the Supabase pooler is healthy; fail-fast socket settings added
author: Shams
date: 2026-10-24
branch: fix/db-socket-timeouts
id: l-e06535a0
scope: repo
status: active
src: agent
touches:
  - lib/db-resilience.ts
  - app/api/health/route.ts
---

## Decided
Treat a hanging /api/health?db=1 as a stalled pooled connection from the host, not a down database: from a dev machine the same pooler answers select 1 in about 1 s and holds all rows. lib/db-resilience.ts now adds socket_timeout=15 and max_idle_connection_lifetime=20 (operator-supplied URL params still win) and the health probe is time-boxed to 8 s and reports code TIMEOUT.
Product pages keep the old internal slug as the DB key and gain a public path (productHref) because the production DB cannot be reseeded from here; ensureCatalogRow creates a missing product row on first add to cart (the Eye Contour row was missing in production).

## Tried and ruled out
Renaming DB slugs (needs a prod reseed we cannot run, order FKs). Reading connect_timeout as sufficient: it only covers the initial connect, not a connection that dies afterwards.

## Watch out
Prisma connect_timeout does not cover a socket that goes silent later, so a hang can persist for minutes. Whether Hostinger egress to the pooler is dropped or rate-limited is unverified from here: if the hang survives this change, restart the Node app in Hostinger and check Supabase connection limits and network bans. Merging a PR deploys; main needs a green check job.
