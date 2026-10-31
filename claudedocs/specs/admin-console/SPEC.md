# Admin console: requirements (draft for approval)

Phase 1 of spec-driven-development (specify: what and why, not how). Extends [admin-rbac](../admin-rbac/SPEC.md) and [admin-password](../admin-password/SPEC.md). No code is written until this is approved.

## 1. Purpose

The admin console is the back office for running CHIAREL: see what is happening (orders, signups, money owed), change what the storefront shows (catalogue, media, announcements), and talk to customers (email campaigns), without a developer and a deploy for every change. Every action is permissioned by role and recorded.

## 2. Where things stand (verified in the repo)

| Area | Today |
| --- | --- |
| Admin pages | Users (create, change role, delete), Founding 100 credits, change own password |
| Admin APIs | users, subscribers CSV export, founding100-credits |
| Orders | In the database (Stripe checkout, dispute fields). **No admin screen to view or fulfil them** |
| Catalogue | Source of truth is `data/products.json` in git. The `Product` table is a mirror for foreign keys. **Any price, copy or image change needs a code change and a deploy** |
| Images | Files in `public/assets/` in git. **No upload path.** Hostinger builds from `main`, so files written to the server disk would be lost on redeploy |
| Email | `lib/mail.ts` over Hostinger SMTP, used only for dispute alerts. `EmailSubscriber` records consent and has unsubscribe |
| Discounts | None in checkout. Owner decision on record (Oct 2026): Founding Members, **no discounts**. Pricing relaunch is a separate unfinished piece of work |
| Payments | Stripe is in test mode |

So "log in and edit things" is not possible yet: apart from users and credits, the console has nothing to edit. Most of what you described needs new building blocks, not just new screens.

## 3. Roles (existing: ADMIN, MEMBER, VIEWER)

| Capability | ADMIN | MEMBER (ops) | VIEWER |
| --- | --- | --- | --- |
| Dashboard, orders, customers, subscribers (read) | yes | yes | read-only, no personal data export |
| Update order status, add fulfilment notes | yes | yes | no |
| Refund, cancel, anything touching money | yes | no | no |
| Edit catalogue (copy, availability, badges) | yes | yes (no price) | no |
| Change prices | yes | no | no |
| Upload and assign media | yes | yes | no |
| Draft campaigns | yes | yes | no |
| Send campaigns, (promo codes: out of scope) | n/a | n/a | n/a |
| Manage users, view audit log | yes | no | no |

Rule: deny by default, every route wrapped in `withRole` (already enforced by a test).

## 4. Requirements

Priority: **P1** builds the console's core value, **P2** is the commerce and media control, **P3** is marketing, **P0** is the foundation everything depends on.

### P0 Foundation (do first, everything below depends on it)
- **A0.1 Audit log.** Every admin write (who, what, before and after, when, IP) stored in an append-only table, viewable by ADMIN. Nothing below ships without it.
- **A0.2 Admin shell.** One layout with navigation by role, a dashboard landing page, sign-out, link to account. Replaces the bare pages.
- **A0.3 Session hygiene.** Admin can sign a user out everywhere; admin can set a temporary password for a user. (Self-service password change is done.)

### P1 Operations
- **A1.1 Orders.** List with filters (status, date, country, search by email or order id), detail view (items, address, Stripe ids, dispute state, Founding 100 credit), status workflow: paid, packed, shipped (with carrier and tracking), delivered, cancelled. CSV export for fulfilment.
- **A1.2 Dashboard.** Today and 30-day orders, revenue, average order value, subscribers and unsubscribes, open disputes, credits owed. Read-only, from existing tables.
- **A1.3 Customers.** Derived from orders: lifetime value, order count, subscription state, latest order. Search and export (ADMIN and MEMBER only).
- **A1.4 Subscribers.** Search, view consent record, manually unsubscribe, export (exists as CSV).
- **A1.5 Disputes view.** List open and closed disputes with evidence checklist (terms acceptance record already stored).

### P2 Content and commerce control
- **A2.1 Catalogue in the database.** Move the editable fields (name, descriptor, blurb, price, availability, badges, gallery order, SEO text) to the database, with `data/products.json` kept as the seed and fallback. Edits appear on the site without a deploy. This is an architectural change and needs its own plan.
- **A2.2 Price control.** ADMIN only, each change audit-logged, shown as before and after, with the Stripe price kept in step. Guard: a price edit cannot make a product purchasable that has no approved price.
- **A2.3 Media library.** Upload images (JPEG, PNG, WebP, MP4), automatic compression, stored in Supabase Storage (not the server disk), assign to a product's gallery roles, replace and reorder. Enforces the brand rules already on record: packshots are transparent 1400x1400 PNG, scenes 1400x1737.
- **A2.4 Site content blocks.** Edit the announcement bar, Home hero text, and FAQ entries from the console, with a preview before publish. Claims copy stays inside the approved-claims rules.
- **A2.5 Inventory flag.** Per product: in stock, low, sold out (disables Add to bag).

### P3 Marketing
- **A3.1 Email campaigns.** Compose (subject, preview text, body), choose an audience (all consented subscribers, Founding list, past customers who opted in), **send a test to yourself**, schedule, send. Every email carries the unsubscribe link and honours suppressions. Send log with counts. Provider: existing Hostinger SMTP unless volume demands more (see decision 3).
- **A3.2 Campaign calendar and tracking.** Name each campaign, tag links with UTM parameters, report orders attributed to it.
- ~~A3.3 Promo codes~~ Out of scope (decision 1).
- **A3.4 Founding 100 management.** Extend the existing credits screen: waitlist, position, notes, credit issue and redeem.

### Cross-cutting (apply to every item)
- Server-side role check and audit entry on every write; input validated; no raw HTML from the console rendered on the storefront without sanitising.
- Destructive actions (delete, refund, send campaign) need an explicit confirmation step.
- Each feature that touches production data, auth or money ships with a runbook (support-readiness).
- Tests per feature, including a mutation check, and a predeploy security pass before each release.

## 5. Out of scope for now
Two-factor authentication, customer accounts or login for shoppers, multi-warehouse, tax and invoicing, a CMS for the Journal, automated order-confirmation emails (separate decision).

## 6. Decisions (owner, 2026-10-27)
1. **Discounts: no promo codes.** A3.3 is removed from scope. Campaigns are email announcements, launches and gifts-with-purchase. The "no discounts" decision and the pricing relaunch stay untouched.
2. **Catalogue moves to the database (A2.1): approved.** `data/products.json` stays as seed and fallback. Needs its own plan and tests before build.
3. **Email volume and provider: open.** Default to Hostinger SMTP; revisit if the list outgrows its sending limits. Needed before P3.
4. **Order of work: approved.** P0 foundation, P1 operations, P2 content and commerce, P3 marketing. Each stage is its own PR, verified live before the next.
5. **Other users: open.** Who else gets access, and as MEMBER or VIEWER. Not blocking until the admin shell exists.

## 7. Next
Phase 2 (plan): technical design for P0 (audit log, admin shell, session hygiene), then P1.
