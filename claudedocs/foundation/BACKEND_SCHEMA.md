# Backend Schema: data, access and relationships

Source of truth: `prisma/schema.prisma`. This document explains it; the file wins if they differ.

## 1. Where data lives

| Data | Location | Notes |
| --- | --- | --- |
| Customers' orders, carts, signups, admin users, sessions | PostgreSQL (Supabase in production, Docker locally) | Accessed only through Prisma in `lib/db.ts` |
| Product catalog (marketing data) | `data/products.json`, loaded by `lib/products.ts` | Drives pages and pricing. The `Product` table mirrors it for foreign keys on cart and order lines |
| Payments, tax, card data | Stripe | CHIAREL never stores card numbers |
| Disputes | Stripe is the audit trail; summary fields are copied onto `Order` | |
| Admin sessions | `Session` table, plus a signed cookie | |
| Cart identity | `chiarel_cart_id` cookie (httpOnly, 90 days) maps to a `Cart` row | No customer login |

## 2. Tables

| Table | Purpose | Key fields |
| --- | --- | --- |
| `Product` | Catalog mirror for relations | `slug` (id), `sku` (unique), prices in whole dollars (`priceSub`, `priceOneTime`), `actives` (JSON) |
| `Cart` | One per cart cookie | `id`, timestamps |
| `CartItem` | A line in a cart | `cartId`, `productSlug`, `mode`, `qty`. Unique per (cart, product) |
| `Order` | One per checkout attempt | `status` (`pending`, `paid`), `stripeSessionId` (unique), shipping address and `country`, `subtotal`, `savings`, `shipping`, `total`, `bonusSample`, consent fields, Founding 100 credit fields, dispute fields |
| `OrderItem` | Frozen line of an order | `productSlug`, `mode`, `qty`, `unitPrice` at purchase time |
| `FoundingSignup` | Founding 100 waitlist | `name`, `email`, optional `phone`, `social`, `referredBy`, `source` |
| `User` | Operator account | `email` (unique), `passwordHash` (bcrypt), `role` |
| `Session` | Admin login session | `userId`, `expiresAt` |

Enum `Role`: `ADMIN`, `MEMBER`, `VIEWER`.

## 3. Relationships

```
Cart 1 ─── * CartItem * ─── 1 Product
Order 1 ─── * OrderItem * ─── 1 Product
User 1 ─── * Session
```

- Deleting a `Cart` deletes its items. Deleting an `Order` deletes its items. Deleting a `User` deletes their sessions.
- Order lines copy the price at purchase time, so later price changes never rewrite history.
- A dispute is flat fields on the `Order` (one dispute maps to one order), matched through `stripePaymentIntentId`.

## 4. Who can access what

| Actor | Can do | Enforced by |
| --- | --- | --- |
| Visitor (no login) | Read products and the Founding 100 count, manage their own cart, check out, view their order page | Cart cookie, rate limits. `/order/[id]` is reachable by anyone holding the order id (cuid, unguessable) |
| Stripe | Post webhooks | Signature verification with `STRIPE_WEBHOOK_SECRET` |
| `VIEWER` | Read-only operator access | `withRole` |
| `MEMBER` | Read Founding 100 credits | `withRole(["ADMIN","MEMBER"])` |
| `ADMIN` | Manage users, write credit-back records | `withRole(["ADMIN"])` |

Deny by default: an admin API route without `withRole` is a defect. Roles are checked on the server on every request.

## 5. Sensitive data

- Orders hold name, email, shipping address. Treat as personal data: never log it, never put it in URLs.
- `passwordHash` is bcrypt. Never returned by any API.
- The database connection strings and `ADMIN_SESSION_SECRET` live only in environment variables.

## 6. Migration history

`prisma/migrations/`: `init_postgres` (Aug 2026), order country and optional state/zip, Founding 100 credit ledger, and a backfill for RBAC and dispute fields that existed in production without a migration file. Production once drifted from the migration history twice; always run `npm run db:prod:status` before and after a migration, and diff before assuming they match.

## 7. Gaps

- No customer table, so no order history for customers and no per-customer subscription state. Subscription "modes" are recorded on lines but not billed on a schedule by this system.
- No data deletion or export path for personal data on request (manual only).
- No backup or restore procedure documented here; rely on Supabase's own backups and confirm their retention.
