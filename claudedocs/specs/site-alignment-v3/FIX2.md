# Launch fixes round 2 (owner brief of Oct 22, second paste) - binding for all workstreams

Owner rules: CHIAREL is not live, change directly. British spelling in visible copy (moisturiser, colour; do not touch code identifiers, CSS or URLs). Brand always CHIAREL™. Do not change any formula, ingredient list, INCI array or price. Footer.tsx is owner-off-limits: never edit it. No ingredient percentages anywhere (standing owner decision; the Night Crème must not show wrong percentages and must show none). No INCI lists published. No 'vegan', 'airless', 'cruelty-free', 'hypoallergenic', 'fragrance-free', 'ophthalmologist tested', no marine/fish collagen, no 'reinforces' or 'repairs', no 'Customer Tested', no before-and-after photos, no cortisol/hormone words. Benefit lines use 'the look of ...' form.

Products (names with ™ in headings/listings; internal slugs and DB keys are UNCHANGED; public URL becomes a new `path`):
1 Clarity Essence™ 40 ml bottle, glass Red Ochre, $189 / $151 sub. internal slug chiarel-essence -> path clarity-essence
2 Clarity Day Crème™ 50 g jar, Red Ochre, $158/$126. slug terra-radiance-creme -> path clarity-day-creme. Concern line 'For dry skin under daily stress.' + 'Follow with SPF.'
3 Clarity Night Crème™ 50 g jar, Formal Garden, $148/$118. slug recovery-masque -> path clarity-night-creme
4 Clarity Neck & Décolleté Crème™ 40 ml bottle, Formal Garden, $138/$118. slug n1-neck-decollete -> path clarity-neck-decollete-creme
5 Clarity Eye Contour Concentrate™ 40 ml bottle, Peach Dust, $189/$151. slug eye-contour-concentrate -> path clarity-eye-contour-concentrate
Key ingredients on each product page: Essence Peptides · Niacinamide · Hyaluronic Acid; Day Ceramides · Cholesterol · Squalane; Night Bakuchiol · Peptides · Niacinamide; Neck Copper Peptide · Ceramides · Squalane; Eye Caffeine · Peptides · Hyaluronic Acid.

Decisions by the lead (do not reopen):
- Product pages live at /shop/<path> (existing route). Production DB cannot be re-seeded by us, so DB `Product.slug` stays the old internal slug; the catalog JSON gains `path` (public URL key). Everything user-facing links via a single helper `productHref(slug)` in lib/products.ts returning `/shop/<path>`. Old `/shop/<old slug>` addresses get permanent redirects (next.config.mjs) to the new paths. Footer.tsx links the old /shop/n1-neck-decollete: the redirect covers it; do not edit Footer.
- Shipping stays: complimentary shipping on every order (owner said so explicitly, overriding the $150 line). Do not change shipping; just LIST every place shipping wording appears in your report.
- 'Ritual Plan' (the 90-day option) wording: replace user-facing 'Ritual Plan' with neutral wording that keeps the feature working (e.g. 'Subscription'/'90-day plan' as already used elsewhere); do not break cart/checkout logic or Founding 100.
- Glass colour/family fields: Essence & Day = Red Ochre; Night & Neck = Formal Garden; Eye = Peach Dust. Remove 'CHIAREL Rose' and 'CHIAREL Verde' family names from visible copy and data (use neutral or the colour name).
- 'Every active ingredient disclosed' badge: INCI is hidden until Register v3/final supplier declarations (not on file). Remove the badge from product pages and any 'full active list' promise on PDPs; leave the House 'Considered Practice' sentence (owner text) and report the tension.
- Do not rename image files (Footer and CDN depend on them); fix alt text and captions only. Jar art that prints old names cannot be fixed in code: report it.
