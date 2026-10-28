# Admin console: festive restyle (brief)

The admin was built deliberately plain. The owner wants it festive and inviting, in the CHIAREL brand: Formal Garden header, Red Ochre ribbon edge, Peach Dust and Champagne accents, Libre Bodoni headings, real product imagery for empty states. **Behaviour does not change**: same routes, same fetch calls, same state logic, same API contracts, same role handling. This is markup and class names only.

## The kit (`components/admin/ui.tsx`, do not edit; ask the lead if a primitive is missing)
`PageShell`, `PageHeader` (eyebrow, title, subtitle, actions), `Card` (tones ivory, white, peach, garden, redochre, champagne), `SectionTitle`, `Stat` / `StatGrid`, `Button` (primary, secondary, champagne, danger, ghost; `small`), `LinkButton`, `Field` + `inputClass` (inputs, selects, textareas), `Table` (`head` array + rows) with `tdClass`, `Badge` + `statusTone(status)`, `Alert` (error, success, info), `EmptyState` (title, text, image), `Loading`.
The shell (`AdminShell.tsx`) already provides the garden header, nav and ribbon edge, and the page background (Ivory). Pages render inside `<main>`; start with `<PageShell>`.

## Rules
- Tailwind classes and the kit only. No inline `style={{}}` (except where a value is truly dynamic), no `system-ui`, no hard-coded hex colours: use the brand tokens (`garden`, `redochre`, `peachdust`, `champagne`, `ivory`, `ink`). Flat colours, no gradients.
- Headings in Libre Bodoni via the kit (`font-serif`); body Jost is the default.
- Keep every existing text string the user can read unless it is clearly wrong; keep `role="alert"` / `role="status"` semantics (the `Alert` does this). Keep labels associated with inputs (`Field`), keep `aria-*`, keep keyboard behaviour. Native `confirm`/`prompt` flows stay as they are.
- Friendly empty states with `EmptyState` (it uses a packshot) and plain-language helper text. Status words become `Badge`s via `statusTone`.
- Responsive: usable at 390px (tables scroll sideways inside `Table`, controls wrap), generous at 1440px and 2000px.
- Viewer-redacted shapes and permission-dependent controls must keep working exactly as before.
- Accessible contrast only (the kit's pairings are already checked; do not put ink/50 body text on peach).

## Verify with your own eyes (required)
A dev server runs on http://localhost:3102 from this worktree (hot reload). Test users (password `role-pass-123456`): `e2e-admin@local.test`, `e2e-member@local.test`, `e2e-viewer@local.test`.
Screenshot tool: `node C:\Users\NEWUSE~1\AppData\Local\Temp\claude\C--Users-New-User-dev-Chiarel-brand-chiarel\9c9020fb-3860-422c-a180-cef15895856f\scratchpad\shot.mjs <url> <width> <out.png> [heightCap]` with env `LOGIN=e2e-admin@local.test:role-pass-123456` and **your own** `DBG_PORT` (given in your task) so parallel runs do not collide; env `FIND="Heading text"` clips from that h2. Write outputs under your own prefix in that scratchpad folder, then Read the PNG (downscale with PIL first if tall). Check each page at 1440 and 390, empty AND populated (seed rows with your own prefix, then delete them).
Run `npx tsc --noEmit` and `npx eslint <your files>` clean. Do not run `next build` or a second `next dev`. Do not touch git, ui.tsx, AdminShell.tsx, app/admin/page.tsx, app/admin/login/page.tsx, or another agent's pages.
