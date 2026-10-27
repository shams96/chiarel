# Runbook: admin access (`/admin/login`)

Tier 2, assisted triage: an agent can diagnose and propose, a human approves anything that touches production data.

## Normal use

- Sign in at `https://chiarel.com/admin/login` (local: `http://localhost:3000/admin/login`).
- Change your own password at `/admin/account` (linked from `/admin/users`). Needs the current password, new one at least 12 characters. Other sessions are signed out.
- Admins add or remove accounts at `/admin/users`. There is no self-signup and no emailed reset.
- On `/admin/users` an Admin can **Set temp password** for another person (they are signed out everywhere and change it at `/admin/account`) or **Sign out everywhere** (a lost device, someone leaving). Neither works on your own account.
- **Audit log** at `/admin/audit` (Admin only): who signed in, failed to sign in, created, changed or deleted users, reset passwords, issued Founding 100 credits, with time and IP. Filter by type or person. It is append-only: there is no way to edit or delete entries from the console. Passwords and hashes are never recorded.

## Investigating "who did that?"

1. `/admin/audit`, filter by type (Users, Founding 100) or search the person's email.
2. Repeated "Failed sign-in attempt" entries for one email, or many for different emails, mean someone is guessing. The login limiter (5 per 15 min per IP, 30 total) already slows it; if it looks real, reset that account's password and **Sign out everywhere**.
3. An unexpected "Changed ... role" or "Created ... account" entry: the row shows who did it and from which IP. If it was not them, treat the account as compromised: reset its password, sign it out everywhere, and rotate `ADMIN_SESSION_SECRET` (signs out everyone).
4. If the audit table itself errors, sign-in still works (auth events are best-effort). Data changes in the console will fail until the table is back, by design: a change without a record is not allowed.

## Symptoms and fixes

| Symptom | Likely cause | Check | Fix |
| --- | --- | --- | --- |
| "Invalid email or password", never worked | No user in that database (local and production are separate) | `select email, role from "User"` against the right database | Create the account, below |
| Worked, now "Invalid email or password" | Forgotten password | Same | Reset with the script, below |
| "Too many login attempts" (429) | 5 failures per IP per 15 min (30 total) | Wait | Wait 15 minutes, or restart the app (limiter is in memory) |
| Login returns 500 | `ADMIN_SESSION_SECRET` missing on the host | Hostinger env vars | Set it to a long random value, redeploy. Never reuse another environment's value |
| Signed in but pages say 403 | Role is not ADMIN | `/admin/users` or the query above | Another Admin changes the role |
| Locked out, no other Admin | Last Admin lost the password | n/a | Reset with the script |

## Create or reset an Admin (human approves: this writes to the database)

Run from the repo root on your machine. `.env` holds the production `DATABASE_URL`; `.env.local` holds the local one. The script prints the target host so you can confirm which database it will write to before relying on it.

```powershell
$env:BOOTSTRAP_ADMIN_EMAIL = "you@example.com"
$env:BOOTSTRAP_ADMIN_PASSWORD = "<temporary password, 12+ chars>"
npx dotenv -e .env -- node scripts/create-admin.mjs     # production
# local: npx dotenv -e .env.local -- node scripts/create-admin.mjs
Remove-Item Env:BOOTSTRAP_ADMIN_PASSWORD
```

Then sign in and change the password at `/admin/account` immediately. Do not commit the password anywhere; keep it in a password manager.

## Escalation

Incident response (suspected account compromise): human deletes the account's sessions (the script does this on reset), rotates `ADMIN_SESSION_SECRET` (signs out everyone), and resets the password. The agent may gather evidence (user and session rows, recent deploys) and draft the report; it does not act on production alone.
