CHIAREL™ — Next.js storefront with a Prisma/SQLite backend.

## Getting Started

```bash
npm install
npm run db:migrate   # creates prisma/dev.db and applies the schema
npm run db:seed      # loads data/products.json into the database
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Backend

- **Database**: SQLite via Prisma (`prisma/schema.prisma`). Product, Cart, CartItem, Order, and OrderItem models.
- **Middleware** (`middleware.ts`): assigns a `chiarel_cart_id` session cookie on first visit and sets baseline security headers.
- **API routes**:
  - `GET/POST /api/products` — product catalog
  - `GET/POST /api/cart`, `PATCH/DELETE /api/cart/[itemId]` — server-persisted cart, scoped to the session cookie
  - `POST /api/checkout` — creates an `Order` from the current cart (no live payment processing — see below)
- `npm run db:studio` opens Prisma Studio to inspect data directly.

Checkout intentionally stops short of charging a card: it records a real `Order` row and clears the cart, but actual payment processing is deferred to the CHIAREL Shopify boutique (Decision 021), matching the on-site copy.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
