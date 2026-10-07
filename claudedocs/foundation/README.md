# CHIAREL foundation documents

Project-wide documents for chiarel.com. Per-feature specs live in `claudedocs/specs/<feature>/` (SPEC, PLAN, TASKS, CONVERGE) and the project rules in `claudedocs/specs/CONSTITUTION.md`. These documents cover the whole site.

Written 2026-10-07, after the site was built, from the code as it stands. They describe what exists, mark what is a gap, and are not a record of what was planned in advance.

| Document | What it answers |
| --- | --- |
| [PRD.md](PRD.md) | What the site does, feature by feature, and what is out of scope |
| [TECHNICAL_REQUIREMENTS.md](TECHNICAL_REQUIREMENTS.md) | Stack, hosting, environments, security, performance, third-party services |
| [APP_FLOW.md](APP_FLOW.md) | Every page and API route, and how a visitor moves through them |
| [DESIGN_BRIEF.md](DESIGN_BRIEF.md) | Brand tokens, type, imagery, motion and layout rules for every screen |
| [BACKEND_SCHEMA.md](BACKEND_SCHEMA.md) | Where data lives, how it is structured, who can access it, key relationships |
| [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) | What was built in what order, and what is still open |
| [DEVELOPMENT_STRATEGY.md](DEVELOPMENT_STRATEGY.md) | Engineering practices followed, and the honest gaps |

Source of truth for facts that change: product data is `data/products.json`, the database is `prisma/schema.prisma`, countries are `lib/countries.ts`, pricing rules are `lib/pricing.ts` and `lib/founding100.ts`. If a document and the code disagree, the code wins and the document needs fixing.
