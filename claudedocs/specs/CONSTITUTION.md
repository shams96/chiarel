# Constitution — CHIAREL (chiarel.com)

This is the feature-workflow addendum for spec-driven-development in this repo. It does not restate
the owner's standing global rules (ENGINEERING_STYLE.md, RULES.md, PRINCIPLES.md, AGENTS.md) or general
software engineering discipline — those already govern every session and apply here unchanged. This file
only covers what's specific to building features *for this brand's site*.

## Brand-specific gates every feature must pass

- **No AI-invented product art.** Jars, packaging, and formula visuals must be the owner's real
  photography/renders (source: `website/10k-websites/` transparent PNGs in the sibling prototype repo,
  or new studio photography). Never generate or composite fake label text, invented ingredients, or
  placeholder jars presented as final. See project memory `chiarel-site-light-never-dark`.
- **Light, never dark.** No dark-background sections, no evening/dusk art direction. High-key daylight
  is the default for every visual surface. See project memory `chiarel-site-light-never-dark`.
- **Claims discipline.** No copy, alt text, or image caption implies a claim above what's substantiated.
  Check new copy against the risk table in `CHIAREL_LAUNCH_MAPPING_AUDIT.md` (avoid "cellular turnover",
  "barrier repair", "dermal", "regeneration", "firming" without evidence, etc.) before it ships.
- **Honest gaps stay visible, not hidden.** If a feature ships with a placeholder, missing asset, or
  deferred capability, it's stated as DRAFT / pending in the UI or copy — never silently faked to look
  finished (this repo's own converge notes already practice this; keep doing it).
- **No unapproved scope changes to price, claims, or product architecture.** A UI/component feature
  (like a gallery) must not quietly touch pricing, SKU structure, or claims language — those require
  explicit owner sign-off per `chiarel-production-site` memory's staged process (audit → approve →
  implement → validate).

## Working agreement

- Follow the existing page/component conventions in `app/shop/[slug]/page.tsx` and `data/products.json`
  rather than introducing a parallel data model.
- Verify against the **live** site (chiarel.com) before assuming current behavior — briefs and memory
  can describe an outdated crawl.
- Never push from `dev\Accio\Chiarel` (stale fork of the same remote) — only this repo.
