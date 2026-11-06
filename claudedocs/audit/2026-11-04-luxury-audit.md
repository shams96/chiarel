# CHIAREL luxury audit, 2026-11-04

Evidence tags: **verified** = read in code or live HTML this session; **fetched** = reported by a page fetch (a summariser read the page, so treat as strong but second-hand); **inferred** = reasoned, not seen; **not seen** = could not be checked.

## Coverage
- chiarel.com: home, /shop, /ritual, /science, /house, /shop/chiarel-essence (fetched; selected claims re-checked in code or live HTML).
- Competitors: Augustinus Bader (US home) and La Prairie (US home) fetched as text. La Mer and Guerlain returned HTTP 403 to the fetch tool, so I read their home pages through the browser pane as text. Both were in their holiday state, so what I saw is a seasonal home page, not their core brand pages.
- **Not assessed:** photography, video, motion and micro-interactions on every site. I read text only. Any comment on art direction below is about what the copy and captions say, not what the images look like.

---

## A. Executive summary

CHIAREL reads as a considered, calm, well-organised brand with unusually honest claim language. It does not yet read as a peer of Augustinus Bader or La Prairie, for one reason: **it asks for trust it has not yet earned on the page.** The peers lead with proof (named technology, footnoted study numbers, heritage, awards, services). CHIAREL leads with atmosphere and trademarks, and the places where proof should sit are empty or contradictory:

1. A visible "Testing, stated plainly" module on the home page whose fields all read "To be published" (verified in `components/home/HomeObservations.tsx:14` and in the live HTML).
2. "Every active ingredient disclosed" on the home, ritual and product pages, with no INCI list and no concentrations (fetched).
3. Naming, pricing and claim inconsistencies a luxury buyer will notice (below).

Tier placement, my judgment from text only: La Mer and La Prairie are the reference tier; Bader is one step down in polish but ahead on evidence; Guerlain is strongest on heritage and personalisation; CHIAREL is currently an elegant start-up, a clear tier below. The gap is closable and mostly editorial, not technical.

---

## B. Critical findings

### B1. The drop timing (your question) — what the record shows
- **What changed (verified):** the home "drop" intro (`components/HeroIntro.tsx`) was cut from a 6.8 s hold plus 0.5 s exit (about 7.3 s) to a 1.2 s hold plus 0.3 s exit (1.5 s). Drop impact moved from 2.3 s to 0.45 s; wave travel from 4.2 s to 0.85 s; wordmark from 4.1 s to 0.6 s. The session flag was bumped from `v8` to `v9`, so every returning visitor sees the new version once.
- **When (verified):** commit `4db4081`, "Phase 6: 1.5s intro…", 2026-11-01 12:29 -0600, under your git identity (all commits in this repo carry it, so authorship cannot be told apart from the log).
- **Why it happened (verified in docs):** the redesign audit (`claudedocs/specs/swiss-luxury-redesign/AUDIT.md`) listed "HeroIntro (6.8 s overlay to <= 1.5 s entrance)" to replace. `SPEC.md` item D10 says: "Replace with a <=1.5 s quiet entrance (or remove). **Owner-authored, so your call.**" `DECISIONS.md` records "Owner accepted rulings D1-D15 ('YES') in session on 2026-10-31" and lists "D10 | HeroIntro shortened to <= 1.5 s (Phase 6)."
- **What I cannot establish:** whether your "YES" on 2026-10-31 was a bulk answer to a list of fifteen items without you registering D10 as a cut of the signature moment. The record is a file written by the session, not an independent log of the exchange. SPEC.md itself flagged D10 as your call, so the item was surfaced, but a single line inside a fifteen-row table is a weak way to ask about the one signature moment on the site. **That is a process fault on my side, whichever way your memory of the exchange goes.**
- **What I ruled out (verified):** no countdown, drop date, launch date or urgency timer exists anywhere in `app`, `components` or `lib` on `main` (the only matches are the text "not a fabricated countdown" in a Founding-100 comment and internal route constants). The live home, shop and ritual pages show no such text either (fetched). Nobody else's commits touch `HeroIntro.tsx`; the only later edit (`a5585d5`, 2026-11-02) is the colour change.
- **Fix, if you want the original back:** restore the timing constants and animation durations from `110a5a5` (the last version before Phase 6). It is a one-file revert plus the flag bump to `v10` so it replays. Say the word and I will do it as a PR; nothing merges until you say so.

### B2. Proof is missing where the brand promises it
- "Testing, stated plainly" with "To be published" in every field is worse than no module: it advertises the absence of evidence. **Recommendation:** remove it from the home page until real figures exist. Keep the "How we observe" explanation in /science.
- The Science page shows ingredient names and the "for the look of" language, but no study design, numbers or sources (fetched).

### B3. "Every active ingredient disclosed" is not true as shown
- Product pages show three or four key ingredients, no INCI, no concentrations (fetched). Your own standing decision is that INCI stays hidden until final and no percentages appear anywhere. Both can be correct, but the sentence cannot say "every" while the list is withheld. **Recommendation:** change the line to what is true now ("Key actives named. Full ingredient list published at launch.") or remove it.
- Content mismatches to reconcile: marine hydrolysed collagen is named as a benefit on the Essence page but is not in its ingredient list (fetched); Bifida Ferment Lysate is explained under Essence but not listed in it (fetched); the home Key Ingredients table omits Bifida Ferment Lysate and L-Ornithine (fetched).

### B4. Product naming
- Essence is "Clarity Essence™", "Signature Essence" (three places on the PDP) and "Essence". Day and Night appear as "Day Crème" / "Night Crème" in labels and "Clarity Day Crème™" in names. The ™ appears on some mentions and not others, including image alt text vs visible headings (fetched).
- "Consumer Collection™" appears as a label with no product assigned (fetched).
- **Rule to adopt:** one canonical name per product, ™ on first mention per page only (or none in body copy), "Signature Essence" retired. Peers: Bader uses "The Cream / The Rich Cream / The Elixir"; La Mer "The Concentrate Serum / The Eye Concentrate"; La Prairie names collections, not adjectives.

### B5. Pricing presentation
- Subscription saving is about 20% on four products and about 14.5% on Neck & Décolleté ($138 → $118) (verified consistent on home, shop and PDP). The Neck one-time price ($138) sits below Night ($148), which will look like an error.
- "From $3.36 a day" on the home hero is unlabelled; it is Essence's $151 ÷ 45 days (fetched, arithmetic checks). Say which product and the cycle.
- No size on shop cards or home (fetched); the PDP gives 40 ml for Essence. The peers show size and price on the grid (La Mer: 0.5 oz / 1 oz sizes beside price).
- Not touched: the sub-$100 repricing in the pricing-relaunch worksheet is a separate open decision.

### B6. Conversion mechanics on the PDP (fetched)
- The main button reads "Begin the Ritual"; "Add to bag" appears on cross-sell cards only. No default plan preselected. No reviews or ratings, no delivery estimate, "made to order" with no lead time, subscription pause/skip/cancel stated only in the FAQ ("email orders@chiarel.com"). The new "Your Ritual" account (#142) is the natural place to move this self-service, once deployed.

### B7. Contradictions a careful reader or regulator will find
- Formulator: "developed … under her guidance" (House page) vs "develops every formulation directly" (FAQ) (fetched). Pick the one that is true and use it everywhere.
- Unhedged claims on Essence ("For fine lines and firmness") and Eye Contour ("For puffiness, dark circles and fine lines") sit beside carefully hedged ones elsewhere (fetched). Not touching the approved "Customer Tested" and "clinically studied ingredients" language. The two unhedged taglines are the odd ones out and the highest-risk lines in the catalogue.
- Ritual page: Eye Contour copy says "morning or night" but it is listed under Evening only; step labels mix "Step 1" with "→Step 2"; "Follow with SPF" has no product or link; "Order follows the texture, lightest first" is not obviously true of the Evening order (fetched).
- "Begin the Ritual" goes to /ritual from the hero and to the Essence page from the closing CTA (fetched).

### B8. Provenance imagery vs provenance claims
- Day and Night are staged in Capri while the brand is Isola del Liri (fetched). The Isola del Liri water image is captioned "Brand scene, not a photograph of the spring", which is honest but means there is no real image of the source on the product pages. The House page has little place imagery (fetched; the home page does carry the bridge photo, verified in `HomePhilosophy`). The lab, the town and the formulator are the three images a peer would lead with; none is real photography today.

---

## C. Page-by-page (chiarel.com)

| Page | Works | Weak | Fix |
|---|---|---|---|
| Home | Clear section order, hedged claims, "Formulated by a pharmacist" and Italy cues, honest captions | Abstract hero ("Advancing Cellular Clarity™", never defined); slogan sub-line; empty testing module; unlabelled $3.36; two destinations for one CTA label | Define the phrase in one sentence under the hero; remove testing module; label price line; one destination per CTA label |
| Shop | Five products, consistent structure | No sizes, near-identical taglines, naming drift | Size + one-line differentiator per card; canonical names |
| Ritual | Strong line "prepare for it, then let it go"; AM/PM structure | Eye Contour contradiction, label formats, no routine total, SPF dead-end | Fix per B7; add "Morning ritual $X / Evening ritual $Y" totals |
| Science | Tidy, restrained | No data, no mechanism, undefined "Modern Biological Stress™" | Define the term; add "what each complex is for" paragraph; study data only when real |
| House | Specific on place and the red-ochre story | Formulator is one credential line; no place imagery; Natural You Srl vs 1HubSolutions entities unexplained | Give the formulator an editorial voice; real photography of town and lab |
| Essence PDP | Consistent name, correct price maths, specific guarantee | No Add to bag, no reviews, no INCI, duplicated sections, thin spec | Per B6 |

---

## D. Competitive insights (text only; images not assessed)

- **Augustinus Bader (fetched):** leads with a named technology ("Powered by Advanced TFC8®") tied to a benefit in the headline; a three-part proof structure ("Patented Technologies", "Clinically Proven. Highly Effective.", "Clean & Conscious") with results as percentages and study design and participant counts in footnotes; product names are a system ("The Cream", "The Elixir"); an award wall organised by product ("See 40+ Awards"); a loyalty club and auto-replenish in the main nav; tiered gifts and a free-delivery threshold. **Lesson:** the proof is footnoted, specific and findable. CHIAREL's equivalent is the module that says "To be published."
- **La Prairie (fetched):** collection names are single concepts (Life Matrix, Skin Caviar, Pure Gold); shopping by category, collection and benefit; "Find Your Skincare Ritual" quiz in several places; service layer (online consultation, virtual masterclass, hotel and spa); heritage line ("more than 90 years"); a loyalty programme link. **Lesson:** the ritual is sold as guidance and service, not a list of steps.
- **La Mer (browser text, holiday state):** product grid shows name, one-line benefit, size options, price and Add to bag together; named technology in the product line ("marine retinol alternative MRA-3™", "RPC-6"); members programme ("Waves de la Mer") with early access; complimentary samples with every order; live chat. **Lesson:** sampling and membership carry the luxury, not discounts.- **Guerlain (browser text, holiday state):** each line has a heritage hook (Abeille Royale, L'Heure Bleue); "Personalize" as a repeated action; limited-edition and bestseller labels; names in capitals with a descriptor line ("YOUTH WATERY OIL SERUM", "92% NATURAL-ORIGIN…") giving a number where one is true. **Lesson:** a number beside a claim, and personalisation as a service.
- **Guerlain, Abeille Royale collection page (browser text, verified by reading the page):** the collection opens with a provenance-plus-proof paragraph: "Bees produce some of the world's most effective natural healing substances… based upon 15 years of research, 9 patents and 9 publications", with a footnote that the test was "In vitro test on ingredient". Product names are fixed: collection first, then a plain descriptor ("ABEILLE ROYALE / HONEY TREATMENT DAY CREAM"), never an adjective. Every product tile carries name, one-line purpose with skin type ("all skin types, even sensitive"), price and a Buy Now button. Numbers sit beside claims and are footnoted: "8 marks of skin clarity corrected in 8 weeks¹", "Repair 85% of fatigue signs". Refills are separate priced products. Rituals are sold as sets with a plain descriptor ("3-step ritual…", $295, "Youth repair age-defying ritual", $330). Complimentary samples (choice of two), free shipping and a loyalty programme (Guerlain&You) sit in the footer band. **Lesson for CHIAREL:** the page proves before it sells (years, patents, publications, an in-vitro footnote) and uses the same four-line tile everywhere. Two of CHIAREL's own words, "Clarity" and "Ritual", are already Guerlain-grade names; the missing part is the numbers and the footnotes. Note: Guerlain also makes unhedged efficacy claims ("corrects"), which CHIAREL should not copy.
- **Not seen for any of the four:** photography, motion, video, micro-interactions, subscription terms. Do not treat the above as a full benchmark of those.

---

## E. Prioritised plan

**Phase 1: immediate (consistency, trust, your control)**
1. Decide on the intro: keep 1.5 s, or restore the original (B1). I do nothing until you choose.
2. Remove the "To be published" module from the home page.
3. Replace "Every active ingredient disclosed" with a true sentence.
4. Canonical product names and ™ rule; retire "Signature Essence".
5. Fix the Neck & Décolleté price/discount presentation (a price decision for you, not a copy fix).
6. Resolve the formulator sentence; hedge or reword the two unhedged taglines.
7. Ritual page fixes (Eye Contour, labels, SPF, routine totals); one destination per CTA label.
8. Put size on shop cards; label the $3.36 line.

**Phase 2: luxury elevation**
1. Photography brief below; replace Capri-for-Italy with Isola del Liri and the lab.
2. Define "Cellular Clarity™" and "Modern Biological Stress™" in one sentence each, once, then use them sparingly.
3. Formulator page section in her voice (permission from Natural You Srl is still open).
4. A real "Add to bag" with default plan, delivery estimate and made-to-order lead time on every PDP.

**Phase 3: conversion and long-term systems**
1. Evidence page when figures exist (design and participant counts footnoted, as Bader does).
2. Ritual finder quiz (La Prairie pattern) built on your existing skin assessment.
3. Members: samples with first order, early access, subscription self-service in "Your Ritual" (the P2 item in the customer-accounts spec).
4. Reviews, once there are real customers; none before.

---

## F. Specific recommendations

**Copy**
- Hero under-line: replace the slogan with one sentence that says what the product does, in your hedged register ("Five formulations for the look of calmer, clearer skin, made to order in Isola del Liri.").
- Price line: "Clarity Essence, $151 every 45 days on subscription, $189 once."
- Evidence line (until data exists): "We publish our testing when it has been reviewed. Until then, we name the actives and say what each is for."

**Structure**
- Product naming grid: one table (name, descriptor, size, price) as the source for shop, ritual and PDP so they cannot drift.
- Shop card: name, purpose in four words, size, price, Add to bag.

**Photography brief (to commission, not generate)**
- The source: Lago di Posta Fibreno and the Liri at the town, morning light, no product.
- The lab and the hands of the formulator, with Natural You Srl permission.
- Texture and application: a pump/dropper close-up, texture on skin, hand-scale shot for every product (the Essence PDP has none, fetched).

**UX flows**
- Home → PDP → Add to bag in two taps with the plan preselected to the subscription and the one-time option one tap away.
- Order confirmation → "Save your ritual" (already built in #142) → "Your Ritual" with next shipment, pause and skip.

---

## Method limits
Page fetches are summaries produced by a model reading the page; I re-verified the Clinical Observations placeholder (code and live HTML), the price figures (three pages agree) and the intro timing (git history). Everything tagged "fetched" should be confirmed by eye before it drives a decision.
