// The uptime heartbeat (claudedocs/specs/hosting-move Option D) restarts production, so its safety
// properties are pinned: probes the right URL, restarts only through Hostinger's documented endpoint,
// rate limits restarts, never prints the token, and has the smallest workflow permissions.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const wf = readFileSync(".github/workflows/uptime-heartbeat.yml", "utf8");
const sh = readFileSync("scripts/uptime-heartbeat.sh", "utf8");

describe("uptime heartbeat workflow", () => {
  it("runs every 5 minutes and can be started by hand", () => {
    expect(wf).toMatch(/cron:\s*"\*\/5 \* \* \* \*"/);
    expect(wf).toContain("workflow_dispatch:");
  });

  it("has least-privilege permissions and never overlaps itself", () => {
    expect(wf).toMatch(/permissions:\s*\n\s*contents: read\s*\n\s*issues: write/);
    expect(wf).toMatch(/concurrency:\s*\n\s*group: uptime-heartbeat\s*\n\s*cancel-in-progress: false/);
  });

  it("takes the Hostinger token only from the repository secret", () => {
    expect(wf).toContain("HOSTINGER_API_TOKEN: ${{ secrets.HOSTINGER_API_TOKEN }}");
    expect(wf).not.toMatch(/HOSTINGER_API_TOKEN:\s*["']?[A-Za-z0-9]{12,}/);
  });
});

describe("uptime heartbeat script", () => {
  it("probes the app and the database on the live site", () => {
    expect(sh).toContain('SITE="${SITE:-https://www.chiarel.com}"');
    // plain /api/health never touches the database and stayed green through the 2026-11-12 outage
    expect(sh).toContain('"$SITE/api/health?db=1"');
    expect(sh).toContain(`'"ok":true'`);
  });

  it("does not raise a false alarm when the db probe is rate limited", () => {
    expect(sh).toMatch(/"\$code" = "429"[\s\S]*"\$SITE\/api\/health"/);
  });

  it("restarts only via Hostinger's documented endpoint, with a bearer token", () => {
    expect(sh).toContain("https://developers.hostinger.com/api/hosting/v1/accounts/${HOSTINGER_USERNAME}/websites/${HOSTINGER_DOMAIN}/nodejs/server/restart");
    expect(sh).toContain("-X POST");
    expect(sh).toContain('Authorization: Bearer ${HOSTINGER_API_TOKEN}');
    // the restart endpoint must never be a redeploy/build call
    expect(sh).not.toMatch(/start-build|hosting_deploy|nodejs\/builds/);
  });

  it("rate limits restarts and reports one issue instead of many", () => {
    expect(sh).toContain("COOLDOWN_SECONDS");
    expect(sh).toContain('contains("Restart requested")');
    expect(sh).toContain('--label "$LABEL"');
    expect(sh).toContain("open_issue_number");
  });

  it("never traces or echoes the token", () => {
    expect(sh).not.toMatch(/set -[a-z]*x/);
    // the secret's name may appear in a message; its value (an expansion) may not
    expect(sh).not.toMatch(/\b(echo|printf|say|comment)\b[^\n]*\$\{?HOSTINGER_API_TOKEN/);
    // the expansion is allowed only to test for emptiness and to build the auth header
    const expansions = sh.match(/\$\{HOSTINGER_API_TOKEN[^}]*\}/g) ?? [];
    expect(expansions).toEqual(["${HOSTINGER_API_TOKEN:-}", "${HOSTINGER_API_TOKEN}"]);
  });

  it("supports a dry run that touches neither GitHub nor Hostinger", () => {
    expect(sh).toContain('HEARTBEAT_DRY_RUN');
    expect(sh).toMatch(/if \[ "\$DRY" = "1" \]; then\s*\n\s*say "dry run/);
  });
});
