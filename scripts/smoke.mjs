// Post-build smoke test: run against a started `node .next/standalone/server.js`
// with a migrated + seeded Postgres. Proves the production bundle boots and the
// DB-backed routes (Prisma engine, bcryptjs, Stripe import) actually work.
// Plain Node 18+, no dependencies. Usage: BASE_URL=http://localhost:3000 node scripts/smoke.mjs
const BASE = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const TIMEOUT_MS = 10_000;

async function call(method, path, { json } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: json ? { "content-type": "application/json" } : {},
    body: json ? JSON.stringify(json) : undefined,
    redirect: "manual",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const text = await res.text();
  return { res, text };
}

function expectStatus(res, want) {
  if (res.status !== want) throw new Error(`expected HTTP ${want}, got ${res.status}`);
}

const checks = [
  [
    "GET /api/products -> 200, non-empty array",
    async () => {
      const { res, text } = await call("GET", "/api/products");
      expectStatus(res, 200);
      const body = JSON.parse(text);
      if (!Array.isArray(body) || body.length === 0) {
        throw new Error("expected non-empty JSON array (was the DB seeded?)");
      }
    },
  ],
  ["GET /api/cart -> 200", async () => expectStatus((await call("GET", "/api/cart")).res, 200)],
  ["GET / -> 200", async () => expectStatus((await call("GET", "/")).res, 200)],
  ["GET /shop -> 200", async () => expectStatus((await call("GET", "/shop")).res, 200)],
  [
    "GET /shop/clarity-essence -> 200",
    async () => expectStatus((await call("GET", "/shop/clarity-essence")).res, 200),
  ],
  [
    "POST /api/admin/auth/login (bad creds) -> 401 JSON",
    async () => {
      const { res, text } = await call("POST", "/api/admin/auth/login", {
        json: { email: "nobody@example.com", password: "wrong-password-123" },
      });
      expectStatus(res, 401);
      JSON.parse(text);
    },
  ],
  [
    "POST /api/webhooks/stripe (no signature) -> 400",
    async () => expectStatus((await call("POST", "/api/webhooks/stripe", { json: {} })).res, 400),
  ],
  [
    "GET /api/admin/users (unauthenticated) -> 401",
    async () => expectStatus((await call("GET", "/api/admin/users")).res, 401),
  ],
];

let failed = 0;
for (const [name, fn] of checks) {
  const t = Date.now();
  try {
    await fn();
    console.log(`PASS  ${name} (${Date.now() - t}ms)`);
  } catch (e) {
    failed++;
    const msg =
      e?.name === "TimeoutError" ? `no response within ${TIMEOUT_MS}ms` : (e?.cause?.code ?? e?.message ?? e);
    console.error(`FAIL  ${name}: ${msg}`);
  }
}
if (failed) {
  console.error(`\nSmoke test failed: ${failed}/${checks.length} checks failed against ${BASE}`);
  process.exit(1);
}
console.log(`\nSmoke test passed: ${checks.length}/${checks.length} checks against ${BASE}`);
