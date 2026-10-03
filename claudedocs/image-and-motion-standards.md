# Product image and motion standards

Rules that keep product imagery and hover motion uniform. Fix things here, once, not page by page.

## Packshots (`public/assets/products/*-jar.png`, `*-bottle.png`)

- Transparent PNG, 1400x1400, alpha 0 background, product centered at about 78% of frame height.
- Never bake a background color into the file. The ivory comes from the site frames (`NEUTRAL_FRAME_BG` in `lib/color.ts`), and the homepage hero depends on transparency for its floating bottle, drop-shadow and green glow.
- Before adding or replacing one, check an existing packshot's corner alpha and match it.
- Remove backgrounds with an edge flood-fill, not a global color threshold (a threshold punches holes in the clear glass cap). Start from the original photo in git.
- N1 (`n1-neck-decollete-jar.png`, 40 ml bottle) follows this rule since 2026-10-03. It was wrong twice before: a raw 698x1024 photo with a white background, then an opaque ivory square.

## Hover and entrance motion

- Per-card hover lives in `lib/motion.ts` (`productHoverClass`), keyed by ritual step. Every card uses it.
- Tailwind only generates classes it can read as complete literal strings. Do not build class names with `${}` interpolation, and keep `./lib/**/*.{ts,tsx}` in `tailwind.config.ts` `content`.
- Hero photo hover is `.product-reveal` in `app/globals.css`. Its entrance animation uses `fill-mode: forwards`, which holds `transform: translateY(0)` permanently and overrides any `:hover { transform }`. Use the independent `scale` property for hover.
