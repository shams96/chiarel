# Design Brief

Every screen follows this. Change a rule here and in the shared file it points to, never page by page.

## 1. Direction

An editorial luxury skincare house, quiet and light. High-key daylight, generous space, restrained motion. **Never dark**: no dark sections or dusk art direction (the announcement bar is the one existing exception and is not a pattern to extend).

## 2. Colour (tokens in `tailwind.config.ts`)

| Token | Hex | Use |
| --- | --- | --- |
| `ivory` | #F8F6F1 | Page background |
| `cloud` | #F0F2EB | Product image frames (`NEUTRAL_FRAME_BG` in `lib/color.ts`) |
| `ink` | #1C1A17 | Text |
| `ochre` | #9B4722 | Website UI accent only (links, small labels). 5.94:1 contrast |
| `garden` | #1F5129 | N1's product colour (Formal Garden) |
| `champagne` | #D6C5A0 | Rules and badges; valid for product and packaging typography |
| `peach`, `ocean` | #FAD6C9, #0C2D38 | Product colour accents |

Use tokens, never raw hex in components.

## 3. Typography

- **Libre Bodoni** (`font-serif`, `--font-serif`): headlines, product names, prices of emphasis.
- **Jost** (`font-sans`, `--font-sans`): body, labels, interface text.
- Body base is 17px, a deliberate step above 16px for legibility. Small uppercase labels are 11 to 12px with wide tracking, never below 11px.
- Always refer to the fonts by name (Libre Bodoni, Jost) in code, docs and conversation.

## 4. Imagery

- **Packshots** (`public/assets/products/`): transparent PNG, 1400x1400, product centered at about 78% of the frame height, never a baked background colour. Frames supply the `cloud` tone. N1 broke this rule twice; see `claudedocs/image-and-motion-standards.md`.
- Real photography and renders only. No invented labels, ingredients or placeholder jars presented as final. A missing asset gets an honest placeholder (`ComingSoonPackshot`).
- Editorial images: 3:2 landscape, 2400px or wider, cropping allowed.
- Alt text names the real product and does not carry claims.

## 5. Layout

- Content column `max-w-6xl` with 24px side padding; reading text `max-w-3xl` or narrower. Define a width once and reuse it.
- Product grids use square frames (`aspect-square`) so nothing is cropped.
- Mobile first. Mobile PDP hero is shorter (5:4) so price and buy button sit within about one screen of scroll.

## 6. Motion

- One easing curve site-wide: `cubic-bezier(0.22, 1, 0.36, 1)` (`EASE` in `lib/motion.ts`).
- Per-product hover gesture lives in `productHoverClass()` in `lib/motion.ts`. Cards, PDP and ritual grid all use it. Class names there must be full literal strings (Tailwind cannot read interpolated ones) and `lib/` must stay in the Tailwind `content` list.
- Hero entrance (`hero-rise`, 900ms) is the single authored on-load moment. The hero photo hover uses the CSS `scale` property because the entrance animation holds `transform`.
- Press feedback on tappable cards and buttons; hover effects only on real pointers (`hover:hover` and `pointer:fine`).
- Everything respects `prefers-reduced-motion`.

## 7. Content rules

- Claims discipline: check copy against the risk table in `CHIAREL_LAUNCH_MAPPING_AUDIT.md`. Cosmetic, non-medical language.
- Draft or owner-approval-pending copy is marked DRAFT in the code and stays honest on the page.
- Trademark marks (™) follow the existing usage on each page.

## 8. Accessibility

- Contrast 4.5:1 for text, visible focus states, labelled icon buttons, semantic headings, semantic lists for the ritual steps, native `<details>` for accordions.
- Touch targets 44px or larger.
