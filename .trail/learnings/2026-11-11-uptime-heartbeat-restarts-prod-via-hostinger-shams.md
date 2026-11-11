---
title: "Uptime heartbeat restarts prod via Hostinger POST nodejs/server/restart, rate limited, token only from a GitHub secret"
author: Shams
date: 2026-11-11
branch: feat/uptime-heartbeat
cost: { minutes: 4, tokens: 31828 }
id: l-e745a038
scope: repo
status: active
src: agent
touches:
  - scripts/uptime-heartbeat.sh
  - ".github/workflows/uptime-heartbeat.yml"
  - tests/uptime-heartbeat.test.ts
---

## Decided
- .github/workflows/uptime-heartbeat.yml runs scripts/uptime-heartbeat.sh every 5 min: probe /api/health (3 tries), on failure open one "site-down" issue and POST Hostinger's restart at most once per 30 min, re-probe, close the issue on recovery. No token means report only.
- Endpoint verified in Hostinger's official repo (hostinger/api-mcp-server, src/core/tools/hosting.ts): POST /api/hosting/v1/accounts/{username}/websites/{domain}/nodejs/server/restart, Bearer auth. Restart does not rebuild or redeploy.

## Tried and ruled out
- Calling Redeploy/build as the recovery step: a build adds ~4 min of load on the shared plan, the thing we are trying to relieve.
- A third-party mirror was the first source for the path; only trust the official repo.

## Watch out
- GitHub schedules run late (minutes) and are disabled after 60 days without repo activity.
- Restart "returns success even when there is no process to restart", so HTTP 2xx is not proof of recovery; the script re-probes /api/health.
- tests/uptime-heartbeat.test.ts pins: cron, permissions, rate limit, endpoint, and that the token is never expanded into an output line. Mutation-checked.
- Git Bash on Windows: run scripts with bash, not by path-mangled args.
