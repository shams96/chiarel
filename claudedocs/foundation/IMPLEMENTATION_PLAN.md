# Implementation Plan (master)

Built incrementally from August 2026 and written up on 2026-10-07 from the git history and per-feature specs, so the phases below are a faithful record, not a plan written in advance. Per-feature detail is in `claudedocs/specs/`.

## Goal

Launch a subscription-first skincare store for CHIAREL in the US, Canada, Italy and the UAE, with safe payments, an operator back office, and strong search and answer-engine visibility.

## Phases

| Phase | What got built | Key deliverables | Status |
| --- | --- | --- | --- |
| 1. Foundation | Next.js app, brand tokens, product data, shop and product pages, cart | `data/products.json`, `/shop`, `/shop/[slug]`, cart API | Done |
| 2. Content and discoverability | Science, journal, house pages; structured data; sitemap; `llms.txt` | `/science/*`, `/journal/*`, `lib/seo.ts` | Done |
| 3. Checkout and orders | Stripe Checkout, order records, webhook, hardening | `/api/checkout`, `/api/webhooks/stripe`, `Order` tables | Done (test mode) |
| 4. Four-product launch | Launch ritual with N1, Founding 100 program, pricing rules | `CHIAREL_FOUR_PRODUCT_IMPLEMENTATION_PLAN.md`, `lib/founding100.ts` | Done |
| 5. Image gallery | Per-product galleries and image standard | `specs/product-image-gallery/` | Done |
| 6. Admin RBAC | Admin, Member, Viewer roles, sessions, user management | `specs/admin-rbac/` | Done |
| 7. Dispute-risk mitigation | Consent record, dispute tracking, rate alert, runbook | `specs/dispute-risk-mitigation/` | Done |
| 8. International launch | CA, IT, AE shipping, country-aware checkout, Stripe Tax | `specs/international-launch/` | Done (EU Responsible Person item open) |
| 9. Pre-launch QA and hosting | Four-agent QA sweep, isolated dev database, migration backfill, self-hosted fonts to fix Hostinger builds | Memory notes, `3d473f3` | Done |
| 10. Eye Contour and N1 imagery | Eye Contour as fifth launch product, N1 40 ml bottle photo, hover motion fix | `399532b`, `c835db5`, `ea06629` | Done |

## What is still open

| Item | Owner | Blocks launch? |
| --- | --- | --- |
| Switch Stripe to live keys; set the Stripe Tax head-office address on the live account; live webhook secret | Owner | Yes |
| Confirm Hostinger has the right `STRIPE_SECRET_KEY` for the intended account | Owner | Yes |
| Fix the bare `chiarel.com` domain HTTPS binding in hPanel (`www` works) | Owner | Yes |
| EU Cosmetics Regulation Responsible Person answer from Natural You Srl | Owner | For Italy sales |
| Dependency vulnerabilities (Next.js 14 to 15, Vitest 2 to 3, plus transitive) | Engineering | Should fix before launch |
| Real subscription billing and the `/account` page | Product | No (preview today) |
| N1 formula and evidence content (owner-approved) | Owner | No (honest placeholders live) |
| CI, wider automated tests, error monitoring, staging | Engineering | Recommended before live payments |

## How new work proceeds

Non-trivial features follow `spec-driven-development`: specify, plan, tasks, implement, converge, each as a short document in `claudedocs/specs/<feature>/`. Small fixes use assess, fix, test. Fixes go in the shared source (`lib/`, shared CSS, single asset), not page by page. See `DEVELOPMENT_STRATEGY.md`.
