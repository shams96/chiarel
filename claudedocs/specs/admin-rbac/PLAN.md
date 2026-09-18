# Admin RBAC — Plan

Grounded in [SPEC.md](./SPEC.md). Follows this project's existing conventions:
Prisma models, the `withApiErrorHandling` wrapper pattern in `lib/api-error.ts`, and
`prisma/seed.ts` for one-time data bootstrapping.

## 1. Data model — new `User` and `Session` models

```prisma
enum Role {
  ADMIN
  MEMBER
  VIEWER
}

model User {
  id           String    @id @default(cuid())
  createdAt    DateTime  @default(now())
  email        String    @unique
  passwordHash String
  role         Role
  sessions     Session[]
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  expiresAt DateTime
}
```

**Why a DB-backed session, not a stateless JWT**: revocability. If a role changes or
an account needs to be cut off, a JWT stays valid until it expires no matter what;
a DB session can be deleted immediately (`prisma.session.delete`), which matters more
here than JWT's marginal performance edge — this is a low-traffic internal admin
surface, not a public API needing to avoid a DB round-trip per request.

**Password hashing**: `bcrypt` (new dependency — flagging per this project's own
predeploy-security-audit standard, which requires bcrypt/argon2/scrypt and treats
anything weaker as a critical finding; this isn't optional). Not adding NextAuth or
another full auth framework — a 3-role, single-app, no-OAuth-needed system doesn't
need that surface area, and a custom ~100-line implementation is easier to audit end
to end than configuring a large library's defaults correctly.

## 2. Auth endpoints — new, minimal, under `/api/admin/auth/`

- `POST /api/admin/auth/login`: email + password → `bcrypt.compare` → create
  `Session` row → set an `httpOnly`, `secure`, `sameSite: lax` cookie holding only the
  session id (never the role or user id in a readable cookie value — the cookie is a
  lookup key, not a claim).
- `POST /api/admin/auth/logout`: delete the `Session` row, clear the cookie.
- No self-service signup route — accounts are created by an Admin (via the
  user-management route in item 4) or the bootstrap step (item 5). An open signup
  endpoint on an internal admin system is exactly the kind of thing
  predeploy-security-audit would flag as unnecessary attack surface.

## 3. The enforcement mechanism — `withRole`, matching `withApiErrorHandling`

New `lib/auth.ts`:

```ts
export async function getSessionUser(req: NextRequest): Promise<User | null> {
  // reads the session cookie, looks up Session -> User, returns null if
  // missing/expired (and deletes expired rows opportunistically)
}

export function withRole<Args extends [NextRequest, ...unknown[]]>(
  allowed: Role[],
  handler: (req: NextRequest, user: User, ...rest: unknown[]) => Promise<NextResponse>
) {
  return async (...args: Args) => {
    const [req, ...rest] = args;
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!allowed.includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return handler(req, user, ...rest);
  };
}
```

Every internal route is written as:

```ts
export const GET = withApiErrorHandling(withRole(["ADMIN", "MEMBER", "VIEWER"], async (req, user) => {
  // ...
}));
```

**This is the "enforce or they don't exist" mechanism concretely**: `withRole`'s first
argument is a required, explicit array — there's no variant of the function that skips
it. A route handler that isn't wrapped in `withRole` at all is caught by code review
(the wrapper is visibly absent), not by trusting anyone to remember a separate
security checklist per route.

## 4. Route × role matrix (grows as internal routes ship)

The only internal routes concretely planned right now are from `dispute-risk-mitigation`:

| Route | Admin | Member | Viewer |
|---|---|---|---|
| `GET /api/admin/disputes` (list + rate-monitor status) | ✅ | ✅ | ✅ |
| `POST /api/admin/disputes/:id/note` (internal note, if built) | ✅ | ✅ | ❌ |
| `GET /api/admin/users` (list users + roles) | ✅ | ❌ | ❌ |
| `POST /api/admin/users` (create user) | ✅ | ❌ | ❌ |
| `PATCH /api/admin/users/:id` (change role) | ✅ | ❌ | ❌ |
| `DELETE /api/admin/users/:id` | ✅ | ❌ | ❌ |

The user-management routes (last four) are part of *this* spec, since Admin needs a
way to create Member/Viewer accounts — without them, RBAC would exist with no way to
actually assign roles beyond the bootstrap Admin.

## 5. Bootstrapping the first Admin

Extend `prisma/seed.ts` (already the project's convention for one-time data setup,
already wired to `npm run db:seed`) with an idempotent upsert:

```ts
if (process.env.BOOTSTRAP_ADMIN_EMAIL && process.env.BOOTSTRAP_ADMIN_PASSWORD) {
  await prisma.user.upsert({
    where: { email: process.env.BOOTSTRAP_ADMIN_EMAIL },
    update: {},
    create: {
      email: process.env.BOOTSTRAP_ADMIN_EMAIL,
      passwordHash: await bcrypt.hash(process.env.BOOTSTRAP_ADMIN_PASSWORD, 12),
      role: "ADMIN",
    },
  });
}
```

Env vars documented in `.env.example` with placeholders (never a real password
committed). This means no route ever needs to special-case "there are zero users, so
allow open signup" — the well-known predeploy-security-audit anti-pattern of a
seeded/default admin account is avoided by requiring these env vars to be set
explicitly (no baked-in default email/password).

## 6. UI note (per the spec's own boundary)

A minimal `/admin/login` page and the pages that consume these routes are UI, and per
SPEC.md's own framing, UI is never the security control — but a login *form* still has
to exist for a human to authenticate at all. This plan builds the login page and
whatever page consumes `/api/admin/users` and the dispute dashboard, styled plainly
(no brand/marketing design work needed — this is internal tooling, not customer-facing,
so it doesn't need the luxury-site design language applied elsewhere in this repo).

## Sequencing

1 (schema) → 5 (bootstrap, so there's an Admin to test with) → 3 (the wrapper) → 2
(login/logout) → 4 (user-management + dispute routes, the first real consumers) → 6
(minimal UI). This order means every layer has something to test against before the
next one is built, rather than building the wrapper with nothing yet calling it.
