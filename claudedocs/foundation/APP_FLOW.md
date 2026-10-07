# App Flow

## 1. Site map (page by page)

| Route | Purpose | Indexed |
| --- | --- | --- |
| `/` | Home. N1-led hero, ritual overview, Founding 100 prompt | Yes |
| `/shop` | Full catalog grouped by ritual (Morning, Night) and collection | Yes |
| `/shop/[slug]` | Product page: gallery, purchase box, benefits, actives, science, routine position | Yes |
| `/ritual` | The four-product AM/PM ritual | Yes |
| `/build-your-ritual` | Guided ritual builder | Yes |
| `/assessment` | Skin assessment that recommends a starting point | Yes |
| `/founding-100` | Founding 100 program and signup | Yes |
| `/checkout` | Shipping details, consent, hand-off to Stripe | No |
| `/order/[id]` | Confirmation after Stripe returns | No |
| `/account` | Subscription management preview (demo only) | No |
| `/science`, `/science/*` | Ingredient and mechanism pages (ectoine, L-ornithine, bifida ferment lysate, barrier resilience, application, lasting hydration, synergy, comparison) | Yes |
| `/journal`, `/journal/*` | Editorial (ritual guide, Isola del Liri, reading a label, three skins one house) | Yes |
| `/house` | Brand and origin | Yes |
| `/press` | Press kit and launch lineup | Yes |
| `/contact`, `/terms`, `/privacy` | Contact and legal | Yes |
| `/admin/login`, `/admin/users`, `/admin/founding100-credits` | Operator tools | No |
| `/sitemap.xml`, `/robots.txt`, `/llms.txt` | Crawler files | n/a |

## 2. API routes

| Route | Method | Access | What it does |
| --- | --- | --- | --- |
| `/api/products` | GET | Public | Product list |
| `/api/cart`, `/api/cart/[itemId]` | GET, POST, PATCH, DELETE | Public (cart cookie) | Server-backed cart with computed totals |
| `/api/checkout` | POST | Public, rate-limited | Validates input, creates a pending Order and a Stripe Checkout Session |
| `/api/webhooks/stripe` | POST | Stripe signature | Marks orders paid, records disputes |
| `/api/founding-list` | GET, POST | Public (POST rate-limited) | GET returns only the claimed count and cap of 100. POST saves a signup and optionally forwards it to a webhook |
| `/api/admin/auth/login`, `/logout` | POST | Public / session | Admin sign-in and sign-out |
| `/api/admin/users`, `/users/[id]` | GET, POST, PATCH, DELETE | Admin | Manage operator accounts |
| `/api/admin/founding100-credits` | GET, POST | Admin and Member read, Admin write | Credit-back ledger |

## 3. Main flows

**Purchase**
1. Visitor browses `/shop` or a product page and picks a mode (90-day Ritual Plan, subscription every 45 days, or one-time).
2. Add to cart (drawer opens). Totals, savings, free-shipping and bonus-sample progress show in the drawer.
3. `/checkout`: country (US, CA, IT, AE), address, terms consent. The country decides whether state is required.
4. Submit calls `POST /api/checkout`, which creates a `pending` Order and a Stripe Checkout Session, then redirects to Stripe.
5. Stripe collects payment and calculates tax, then returns to `/order/[id]?session_id=...`.
6. The Stripe webhook (and the return redirect) set the order to `paid`. The webhook is the reliable path.
7. A dispute later arrives as a webhook event and is written onto the same order.

**Ritual discovery:** `/assessment` or `/build-your-ritual` leads to a recommended set of products and then to product pages.

**Founding 100:** `/founding-100` signup saves a `FoundingSignup`. Enrolled products (Recovery Masque, N1) get the 20% prepay discount in the cart. The 25% credit-back is tracked on the Order and managed by an Admin at `/admin/founding100-credits`.

**Operator:** `/admin/login` leads to `/admin/users` (Admin only) or `/admin/founding100-credits` (Admin, Member read). Viewer is the read-only role.

## 4. Error and edge states

- Unsupported country returns 400. Missing required field returns 400 with the field names.
- Too many checkout attempts returns 429.
- If Stripe rejects automatic tax (no head-office address on the account), checkout falls back to a no-tax session and logs it.
- Unknown product slug returns 404.
- Products without an approved price show "Price to be announced" instead of a buy box.
