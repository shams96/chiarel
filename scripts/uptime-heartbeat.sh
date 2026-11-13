#!/usr/bin/env bash
# Uptime heartbeat for chiarel.com, run every 5 minutes by
# .github/workflows/uptime-heartbeat.yml (see claudedocs/specs/hosting-move/SPEC-AND-PLAN.md, Option D).
#
# 1. Probe /api/health?db=1: the app answers AND `select 1` succeeds. The plain /api/health never
#    touches the database, so it stayed green through the 2026-11-12 engine panic. The ?db=1 probe is
#    also the app's repair path (a failure replaces the Prisma client), so polling it nudges recovery.
# 2. Healthy: close any open "site-down" issue and stop.
# 3. Down: open or reuse one "site-down" issue, and, at most once per 30 minutes, ask Hostinger to
#    restart the Node app (POST .../nodejs/server/restart; it does not rebuild or redeploy).
#    Then re-probe; comment the outcome; exit 1 if it is still down so the run shows red.
#
# The Hostinger token is read from HOSTINGER_API_TOKEN and is never printed. With no token the script
# still reports the outage but cannot restart anything.
# HEARTBEAT_DRY_RUN=1 prints what it would do and touches neither GitHub nor Hostinger.
set -u

SITE="${SITE:-https://www.chiarel.com}"
HOSTINGER_USERNAME="${HOSTINGER_USERNAME:-u727712424}"
HOSTINGER_DOMAIN="${HOSTINGER_DOMAIN:-chiarel.com}"
COOLDOWN_SECONDS="${COOLDOWN_SECONDS:-1800}"
PROBE_TRIES="${PROBE_TRIES:-3}"
PROBE_GAP_SECONDS="${PROBE_GAP_SECONDS:-20}"
RESTART_WAIT_SECONDS="${RESTART_WAIT_SECONDS:-60}"
LABEL="site-down"
DRY="${HEARTBEAT_DRY_RUN:-0}"
BODY_FILE="$(mktemp)"

say() { printf '%s\n' "$*"; }

probe_once() {
  local code
  code="$(curl -sS -m 20 -o "$BODY_FILE" -w '%{http_code}' "$SITE/api/health?db=1" 2>/dev/null || true)"
  # 429: the db probe is rate limited per IP. That says nothing about health, so fall back to the
  # database-free probe rather than raising a false alarm.
  if [ "$code" = "429" ]; then
    code="$(curl -sS -m 20 -o "$BODY_FILE" -w '%{http_code}' "$SITE/api/health" 2>/dev/null || true)"
  fi
  [ "$code" = "200" ] && grep -q '"ok":true' "$BODY_FILE"
}

probe() {
  local i
  for i in $(seq 1 "$PROBE_TRIES"); do
    if probe_once; then return 0; fi
    [ "$i" -lt "$PROBE_TRIES" ] && sleep "$PROBE_GAP_SECONDS"
  done
  return 1
}

open_issue_number() {
  gh issue list --label "$LABEL" --state open --json number --jq '.[0].number // empty' 2>/dev/null
}

comment() { # $1 issue number, $2 text
  gh issue comment "$1" --body "$2" >/dev/null 2>&1 || true
}

if probe; then
  say "healthy: $SITE/api/health?db=1 answered 200 ok"
  if [ "$DRY" != "1" ]; then
    n="$(open_issue_number)"
    if [ -n "$n" ]; then
      comment "$n" "Recovered: $SITE/api/health is answering again ($(date -u +%FT%TZ))."
      gh issue close "$n" >/dev/null 2>&1 || true
      say "closed issue #$n"
    fi
  fi
  exit 0
fi

say "DOWN: $SITE/api/health?db=1 did not answer 200 ok after $PROBE_TRIES tries"
if [ "$DRY" = "1" ]; then
  say "dry run: would open or reuse the '$LABEL' issue and, past the cooldown, POST the Hostinger restart"
  exit 1
fi

gh label create "$LABEL" --color B60205 --description "chiarel.com is not answering /api/health?db=1 (app or database down)" --force >/dev/null 2>&1 || true
n="$(open_issue_number)"
if [ -z "$n" ]; then
  url="$(gh issue create --label "$LABEL" \
    --title "Site down: chiarel.com failed its health check (app or database)" \
    --body "The heartbeat could not get a healthy answer from $SITE/api/health?db=1 at $(date -u +%FT%TZ). It will try one restart per 30 minutes and update this issue. Check the body at $SITE/api/health?db=1: db.ok false means the database path (runbook claudedocs/runbooks/database-outage.md, Tier 2); no answer at all means the whole app (same file, "Whole app not answering")." 2>/dev/null)"
  n="${url##*/}"
  say "opened issue #$n"
fi

# Cooldown: skip the restart if one was requested in the last COOLDOWN_SECONDS.
last="$(gh api "repos/${GITHUB_REPOSITORY:-}/issues/$n/comments" --paginate \
  --jq '[.[] | select(.body | contains("Restart requested")) | .created_at | fromdateiso8601] | max // 0' 2>/dev/null | tail -1)"
last="${last:-0}"
now="$(date -u +%s)"
if [ $((now - last)) -lt "$COOLDOWN_SECONDS" ]; then
  say "restart already requested within the last $((COOLDOWN_SECONDS / 60)) minutes; not repeating"
  exit 1
fi

if [ -z "${HOSTINGER_API_TOKEN:-}" ]; then
  comment "$n" "No restart attempted: the HOSTINGER_API_TOKEN secret is not set, so the heartbeat can only report. Restart the app in hPanel (Node.js app, Restart) and check /api/health."
  say "no HOSTINGER_API_TOKEN; cannot restart"
  exit 1
fi

status="$(curl -sS -m 30 -o /dev/null -w '%{http_code}' -X POST \
  -H "Authorization: Bearer ${HOSTINGER_API_TOKEN}" -H "Accept: application/json" \
  "https://developers.hostinger.com/api/hosting/v1/accounts/${HOSTINGER_USERNAME}/websites/${HOSTINGER_DOMAIN}/nodejs/server/restart" 2>/dev/null || true)"
say "restart request answered HTTP ${status:-none}"
comment "$n" "Restart requested ($(date -u +%FT%TZ)); Hostinger answered HTTP ${status:-none}. Re-checking in ${RESTART_WAIT_SECONDS}s."

sleep "$RESTART_WAIT_SECONDS"
if probe; then
  comment "$n" "Recovered after the restart ($(date -u +%FT%TZ))."
  gh issue close "$n" >/dev/null 2>&1 || true
  say "recovered after restart; closed issue #$n"
  exit 0
fi
comment "$n" "Still down after the restart ($(date -u +%FT%TZ)). Needs a person: hPanel Resources usage and runtime logs, then the runbook."
say "still down after restart"
exit 1
