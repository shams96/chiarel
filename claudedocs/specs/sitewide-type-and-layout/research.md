# Research: peer brands and 2026 trends (2026-11-06)

Method: computed styles read from each live homepage in the in-app browser (h1/h2/h3 font, size, weight, colour, case), one snapshot each. Viewport width could not be read (reported 0), so sizes are the rendered values at the browser pane's width; treat them as approximate, not as each brand's full responsive range. Trend claims come from web searches; most sources are vendor and agency blogs with commercial interest, so they are directional only.

## Peer brands (verified: measured on the live pages)
| Brand | Heading font | Section heading size | Heading colour | Notes |
|---|---|---|---|---|
| Augustinus Bader | Maison Neue (sans), one family | 24px (h2), 32-36px (h1/brand), 12px labels | white on dark hero; brand navy elsewhere | uppercase 12px h3 product names |
| Aesop | Suisse Intl (sans) + Zapf Humanist for some h2 | 24-25px | #333 (off-white on dark panels) | one weight (400), no size above 25px on h1/h2 |
| Tatcha | Rhymes Text (serif), Siaga body | 19.8-28.8px | #141414 | serif headings, weight 400 |
| Sisley | Roboto (sans) | 14px uppercase | black | smallest headings of the set |
| La Mer | custom "La Mer Headline" | 42px, every h2 the same | #303030 | uppercase, one size for all h2 and h3 |

## What this shows
1. Every peer uses one heading size per tier and one heading colour (near-black ink, or a single brand ink). None alternates ochre/green/ink by section.
2. Peer section headings are 20-42px. CHIAREL's homepage section headings run up to 61-72px (`clamp(...3.8rem)`, `4.5rem`); the existing `text-h2` token tops out at 44px, in line with La Mer.
3. Two peers (Tatcha, and CHIAREL itself) use a serif for headings; three use sans. A serif heading is a legitimate choice and distinctive in this set.
4. Colour is used on accents (links, labels, buttons), not on every heading.

## 2026 trends (inferred from vendor/agency sources, not verified independently)
- Serif headline plus clean sans body is described as the standard luxury-beauty pairing (matches Libre Bodoni + Jost).
- Fluid type and design tokens as the base layer for consistent type, colour and spacing (matches using the existing tokens instead of ad-hoc `clamp()`).
- Container-based layout; oversized display type needs deliberate wide-screen limits (matches the shared container).
- Muted palettes, editorial full-bleed imagery (images can stay full bleed; text sits in the container).

## Effect on the draft spec
- R1 stands, and the size cap matters more than the colour: moving homepage headings onto `text-h2` (max 44px) brings them in line with peers and with the inner pages.
- R3 (ochre headings) is the owner's stated preference and is kept. Peer evidence supports a single rule, not a specific colour; to keep it from over-colouring the page, ochre is for section headings only, and card/product names use ochre at `text-h4`, while body, labels and legal pages stay ink.
- R2 and R4 unchanged.

## Sources
- https://colorlib.com/wp/skincare-brand-website-examples/
- https://www.squareko.com/website-and-seo/top-squarespace-web-design-trends-for-beauty-fashion-and-retail-in-2026
- https://sensatype.com/the-typography-trends-defining-branding-in-2026
- https://line25.com/articles/web-design-trends-2026/
- https://bellaworksweb.com/website-design-trends-2026/
- Live pages measured: augustinusbader.com, aesop.com, tatcha.com, sisley-paris.com, cremedelamer.com
