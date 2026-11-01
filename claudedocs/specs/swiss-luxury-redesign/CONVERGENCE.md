# Convergence report: Swiss luxury redesign vs the brief

Branch stack: #123 (Phase 2) < #124 (Phase 3) < #125 (Phase 4) < #126 (Phase 5) < #127 (Phase 6). Dated 2026-11-01.
Evidence tags: **verified** (run or seen this session), **inferred**, **not verified**.

## Brief requirements

| Requirement | Status | Evidence |
|---|---|---|
| One typeface, Libre Bodoni | Met, verified | One computed font family on 28 pages at 7 widths (196 combinations; Founding-100 checked separately at 1440 and 390); no Jost in built CSS |
| Cloud Dancer ground, Garden, Red Ochre | Met, verified | Tokens in `tailwind.config.ts`; `redochre` folded into `ochre`; House page ground is flat Cloud (Liri Flow texture removed) |
| 12 / 8 / 4 column grid, shared container and margins | Met, verified | `.grid-12`, `max-w-container`, `px-margin`; Science, Journal, House, Press use the grid at lg |
| 12-section homepage in brief order | Met, verified | `app/page.tsx` order; section 07 is a visible placeholder (below) |
| PDP in the brief's order | Met, verified | `tests/pdp-sections.test.ts` order test |
| No dark sections | Met, verified | No `bg-ink` / `bg-ocean` section on public pages; Founding-100 hero is ivory. Press logo swatch keeps `bg-ocean` on purpose (Peach Dust wordmark needs it) |
| 12px text floor | Met, verified | Zero text under 12px outside the footer on those 196 combinations; footer small text raised to 12px (font size only) |
| Mobile-first at 375 / 390 / 430 / 768 / 1024 / 1440 / 1920 | Met for overflow, small text, overlap and one family on 28 pages; viewed on screen at 390 and 1440 for most pages | Founding-100 viewed on screen at 1440 and 390 against the local dev database |
| Restrained motion, intro at or under 1.5s | Met, verified | Intro clears about 1.5s after load; sticky bar and hero respect reduced motion |
| No new fonts or dependencies; integrations, URLs, SEO preserved | Met, verified | `package.json` and lockfile unchanged on the branch; JSON-LD untouched; no API, DB, auth or payment code changed |
| Tests | Met, verified | tsc, ESLint (repo config), 501 tests, build, local smoke test 8 of 8 |
| Responsive image delivery | Partly met | Hero has 640w/960w variants. Other scene images (300 to 440 KB) are single-size. See Open items |
| Lighthouse before and after | Not verified | Not run |
| Clinical Observations content | Placeholder | Needs Grazia Savoriti's wording |
| Formulator portrait, lab photography | Not met | Needs Natural You permission and photography |
| Relevant scientific references | Partly met | Ingredient notes link to existing Science pages only; real citations needed |

## Security and architecture audit (scoped to this change, production build)

- **Scope:** the redesign changes no API, DB, auth, payment, middleware or config code. Audited the production build started with `next start`.
- **Verified clean:** CSP, HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy and Permissions-Policy present; foreign `Origin` gets no CORS headers; `/.env`, `/.git/config`, `.next` internals return 404; `/api/admin/*` returns 401 unauthenticated; Stripe webhook without a signature returns 400; admin login is rate-limited (4 bad attempts return 401, the rest 429); no source maps and no secret strings in the client bundle; `dangerouslySetInnerHTML` is used only for JSON-LD built from static data.
- **Dependency scan (`npm audit --omit=dev`): 1 critical, 1 high, 2 moderate. All pre-existing: `package.json` and the lockfile are unchanged on this branch.**
  - Next 15.5.27, critical: unauthenticated RCE in the Image Optimization API (SVG) and Server Actions DoS. The optimizer route returns 404 here (`images.unoptimized: true`) and the app has no server actions, so neither is reachable in this configuration (verified). Upgrading Next is still the fix; it is a dependency change outside this redesign.
  - PostCSS (high, transitive): build-time stylesheet processing only, not a runtime path.
  - nodemailer (moderate, direct): address-parsing advisories; worth a look wherever user-supplied addresses reach it.
- **Not verified:** `/admin` returns 200 without a login cookie; its HTML contains no admin data and its data APIs return 401, but I have not confirmed it renders a login form (client-side). Pre-existing code.
- **Organisational gaps a formal audit would need (not code):** incident-response note, access reviews, vendor risk assessments. No certification is claimed.

## Open items

1. Responsive images beyond the hero: needs a decision (pre-generated variants go stale when the owner replaces an image under the same filename, see `scripts/publish-images.mjs`).
2. Lighthouse before and after: needs a go-ahead to run an external tool.
3. Upgrade Next (and nodemailer) to the patched versions, in its own PR.
4. Owner inputs: Clinical Observations wording, Formulator permission and photography, citations, testimonial consents, stock-licence check.
