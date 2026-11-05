# Guerlain US shopping experience: reference audit for CHIAREL

Audited 2026-11-04. Reference product: Abeille Royale Youth Watery Oil Serum, 50 ml, $160.
Labels: **DIRECTLY OBSERVED** (seen in live page/DOM this session), **INFERRED** (reasoned from what was seen), **COULD NOT VERIFY** (reason given).
Patterns are described in our own words; only short button/step labels are quoted.

---

## 1. Method and limits

- Tool: Browser pane. Desktop emulated at 1440x900, mobile at 375x812. Fresh guest session. No cookie banner appeared in the DOM, so nothing was accepted or declined.
- Path: PDP (desktop) -> ingredient modal -> reviews block -> add to cart (drawer) -> cart page -> sample gate -> checkout step 2 (identification). Then PDP (mobile) -> add to cart (sheet) -> cart page -> sample gate -> pre-checkout sheet.
- Stopped at: the **Identification** step (asks for an email). No email, address, payment detail or account entered. No order placed.
- **Mobile checkout not reachable.** Tapping the primary button on the mobile pre-checkout sheet led to an HTTP 403 "Access Denied" page from the site's CDN (edge security, probably tripped by emulated-mobile automation). I did not retry or work around it. Mobile checkout steps/fields/chrome are COULD NOT VERIFY.
- Side effect: the guest cart in that browser session holds 2x the serum. Nothing is tied to an account.
- Category-listing check was shallow (one page, DOM level). Shipping, Payment and Order review steps were never rendered; statements about them are INFERRED from the step bar and cart text only.
- Screenshots live only in the tool's own result store; none were saved to the repo.

---

## 2. Journey map

| Stage | Desktop | Mobile |
|---|---|---|
| **Discovery** | Mega-menu: Skincare split into Categories (face serums and oils, creams, eye/lip, toners, cleansers, masks, body), Collections (Abeille Royale, Orchidee Imperiale variants, Super Aqua), Benefits, plus New Arrivals and Gift Sets. DIRECTLY OBSERVED. Category page: short intro, row of collection tiles, "15 RESULTS", one "FILTERS" control, tiles with a "BUY NOW" quick-add (45 quick-action elements in DOM). DIRECTLY OBSERVED. | Slim header with search, bag, hamburger. DIRECTLY OBSERVED. Mobile menu contents: COULD NOT VERIFY (not opened). |
| **PDP top** | Two columns: left gallery with thumbnail strip beneath (product, texture, skin/face shots); right buy box. DIRECTLY OBSERVED. Buy box order: badge ("ICONIC GIFT"), collection, name, one-line descriptor, rating stars + count, size/price row, black full-width ADD TO CART, "pay in 4" line, "Find a store", phone/e-mail help, three reassurance lines (2 samples, free shipping, bee commitment). | Stacked: announcement bar, header, full-width square gallery with expand icon and thumbnail strip, then badge, name, descriptor, rating. DIRECTLY OBSERVED. ADD TO CART sits about 940 px down, below the first 812 px screen. DIRECTLY OBSERVED (DOM). |
| **Gallery / zoom** | Thumbnails switch image. Clicking the main image showed no visible zoom in my test; a hidden zoom container exists in DOM. Desktop zoom: COULD NOT VERIFY. | Expand icon opens a full-screen viewer that keeps the thumbnail strip. DIRECTLY OBSERVED. Pinch/double-tap: COULD NOT VERIFY. |
| **PDP body order** | Hero benefit statement -> video -> clinical/efficacy numbers -> origin/science story -> ingredient story with "Show all ingredients" -> texture -> numbered how-to-apply -> brand/bee commitment -> second video -> routine ("Advanced Youth Ritual") -> product carousel -> FAQ (5 collapsed questions) -> reviews (4.7, 1,293 reviews, histogram, topic filters, sort, regional sort) -> footer. DIRECTLY OBSERVED (section order and page offsets). | Same order, stacked; page about 19,800 px vs about 15,800 on desktop. DIRECTLY OBSERVED. |
| **Persistent buy affordance** | Past the buy box, a compact bar docks under the header with name, size, price, ADD TO CART. DIRECTLY OBSERVED. | A bar docks at the bottom with bottle thumbnail, size, price, black ADD TO CART. DIRECTLY OBSERVED. |
| **Add-to-cart feedback** | Brief loading animation, then a **right-side mini-cart drawer**: "Product added to cart", item, quantity stepper, a "Holiday edit" carousel (1/5), navy CHECKOUT with running total. Page position kept. DIRECTLY OBSERVED. | **Bottom sheet** over a dimmed page: "Shopping bag 2 items", item, stepper, navy CHECKOUT with total. Cross-sell text exists in sheet DOM; visibility below the sheet fold: COULD NOT VERIFY. |
| **Cart page** | Own URL. Stripped header: "Back", centred logo, help icon. 5-step bar (Shopping bag, Identification, Shipping, Payment, Order review). Left: line item (stepper, Edit, remove), "You may also like" (4 items with direct ADD TO CART), "2 free samples with all orders" picker, "Art of gifting" case choice, gift message. Right: loyalty teaser, summary (subtotal, tax, shipping "Free", gifting "Free", collapsed promo code, total), black CHECKOUT, **Express checkout** (PayPal, Apple Pay), logo row (Klarna, PayPal, Mastercard, Visa, Amex, Discover, Apple Pay). DIRECTLY OBSERVED. | Same blocks, one column. Header: back arrow, ring progress icon, "1. Shopping bag / Next step: IDENTIFICATION". Summary is about 2,600 px down. A sticky CHECKOUT bar with total shows only once the summary area is in view; not visible mid-page. DIRECTLY OBSERVED. |
| **Samples** | Default "Include samples"; 0/2 counter; carousel of up to five sample cards with checkboxes and "Details". CHECKOUT with 0 chosen is **blocked** with a red "Please select your samples." line; "Exclude samples" clears it. DIRECTLY OBSERVED. | Same; page auto-scrolls to the sample block on the blocked tap. DIRECTLY OBSERVED. |
| **Checkout start** | `/checkout?stage=customer`. Same step bar. Step 2 "Identification": one email field, SUBMIT, line "Enter your email to login to your account or to proceed as a guest." Steps 3-5 appear as collapsed grey headings. Right column: collapsed "Your order", loyalty prompt, totals, US-only note. Full site footer (newsletter, links) still present. DIRECTLY OBSERVED. | After samples are resolved, CHECKOUT first opens a sheet: total, financing line, primary "ORDER NOW", "EXPRESS CHECKOUT", PayPal button, logo row (Apple Pay on its own line). DIRECTLY OBSERVED. ORDER NOW then returned a 403. Identification onward: COULD NOT VERIFY. |
| **Account entry** | Person icon in the header on content pages (not on cart/checkout). At checkout, account entry is the email field plus a loyalty nudge. Footer: My account, Order tracking, Payment methods. DIRECTLY OBSERVED. Account creation: not tested by instruction. | Header shows search, bag, hamburger; no person icon seen. Mobile account entry: COULD NOT VERIFY. |
| **Confirmation** | COULD NOT VERIFY (needs payment). | COULD NOT VERIFY. |

---

## 3. What Guerlain does well (patterns worth adapting)

1. **Single-field identification.** One email box resolves login vs guest. DIRECTLY OBSERVED. Cuts the first-step decision to one input.
2. **Header stripped on cart/checkout** (back, logo, help only). DIRECTLY OBSERVED. Removes exits from the money path.
3. **Numbered step bar from the cart onward**, with "Next step" naming on mobile. DIRECTLY OBSERVED.
4. **Persistent add-to-cart with name, size and price** (top bar desktop, bottom bar mobile). DIRECTLY OBSERVED. Keeps buying reachable across a roughly 16,000 px story page.
5. **Add-to-cart keeps you on the product page**: drawer (desktop) or bottom sheet (mobile), with stepper and a checkout button showing the total. DIRECTLY OBSERVED.
6. **Shipping and sample offer stated repeatedly before checkout** (announcement bar, PDP lines, cart summary "Free"). DIRECTLY OBSERVED. No cart-stage shipping surprise.
7. **Simple totals with a collapsed promo field.** DIRECTLY OBSERVED. Effect on conversion is INFERRED, not measured.
8. **Payment expectations set early**: express wallets and logos on the cart, financing messaging on PDP, cart and mobile sheet. DIRECTLY OBSERVED.
9. **Footnoted clinical block**: each efficacy claim cites test type and participant count. DIRECTLY OBSERVED.
10. **Evidence-tier labelling**: ingredient claims say "in vitro test on ingredient"; product claims say "instrumental test" or "satisfaction test". DIRECTLY OBSERVED.
11. **Ingredient story ends in full disclosure**: "Show all ingredients" opens a "List of ingredients" modal with the complete ordered list and a formula reference number. DIRECTLY OBSERVED.
12. **Numbered how-to-apply** with a branded technique. DIRECTLY OBSERVED.
13. **Routine framing for cross-sell**: a ritual explanation precedes the product carousel. DIRECTLY OBSERVED.
14. **FAQ as search-style questions near the end.** DIRECTLY OBSERVED as headings; answers not read (collapsed). Purpose (SEO/answer engines) is INFERRED.
15. **Reviews with histogram, topic filters, recommend percentage, regional sort.** DIRECTLY OBSERVED.
16. **Sample picker with explicit opt-out.** DIRECTLY OBSERVED.
17. **Samples and gifting live in the cart**, keeping the checkout form short. INFERRED (steps 3-5 not seen).

---

## 4. Weaknesses and friction

- **Sample gate blocks the first CHECKOUT press** (default "Include", 0/2 chosen = error). DIRECTLY OBSERVED, desktop and mobile.
- **Mobile cart is long**; totals and checkout come after cross-sell, samples, gifting, gift message (about 2,600 px). Sticky checkout only appears near the summary. DIRECTLY OBSERVED.
- **Two consecutive "go to checkout" taps on mobile** (cart bar, then ORDER NOW sheet). DIRECTLY OBSERVED. Whether this is a deliberate wallet chooser: INFERRED.
- **Add to cart below the first mobile screen** until the docked bar appears. DIRECTLY OBSERVED.
- **Full footer kept on checkout** (newsletter, link lists, store finder) despite the stripped header. DIRECTLY OBSERVED.
- **Very long PDP** (about 16-20k px) with no section jump list. DIRECTLY OBSERVED.
- **Repeated carousel text in the DOM** (honey/royal-jelly block appears three times in page text). DIRECTLY OBSERVED; cause not determined.
- **Cross-sell price ambiguity**: cards say "From $65" / "From $185" while the cart shows $250 for the 50 ml of the same serum. DIRECTLY OBSERVED.
- **Dense clinical figures** (several footnotes each) in a centred, all-caps marketing layout; scannability is poor. DIRECTLY OBSERVED; readability judgment is mine.
- **Ingredient list is modal-only**; deep-linking not tested. INFERRED.
- **No undo seen** after remove/stepper changes. Existence of steppers DIRECTLY OBSERVED; undo behaviour COULD NOT VERIFY.
- **Bot protection returned a 403** on a normal-looking mobile tap. DIRECTLY OBSERVED once; cause INFERRED.
- Rotating announcement bar changes top-of-page height. DIRECTLY OBSERVED. Minor.

---

## 5. Checkout anatomy (as observed)

**Step bar (cart and checkout):** 1 Shopping bag, 2 Identification, 3 Shipping, 4 Payment, 5 Order review. DIRECTLY OBSERVED (labels).

**Step 1, Shopping bag.** DIRECTLY OBSERVED.
- Line item: image, collection, name, size, quantity stepper, price, Edit, remove.
- "You may also like": four items, each with ADD TO CART.
- "2 free samples with all orders": include/exclude radio, 0/2 counter, sample cards with "Details".
- "Art of gifting": two box options (MINIMAL, ICONIC), each with "Learn more"; shown free; small orders may ship in a gift bag.
- Gift message (collapsed).
- Loyalty teaser (160 points on this order).
- Summary: subtotal, tax ($0.00 pre-address), shipping "Free", gifting "Free", promo (collapsed), total.
- Actions: black CHECKOUT; Express checkout (PayPal, Apple Pay); logo row (Klarna, PayPal, Mastercard, Visa, Amex, Discover, Apple Pay).
- Notes: US addresses only, no APO/FPO/PO boxes; PayPal requires a street address; "100 % secure payment" tag; free shipping, samples, eco box, loyalty repeated in a reassurance strip.

**Step 2, Identification.** DIRECTLY OBSERVED. One required field (Email) with a clear control; SUBMIT; login-or-guest copy. Right column: collapsed "Your order" (1 item, $160), loyalty prompt, totals, US-only note.

**Steps 3-5.** Collapsed headings only. Shipping fields, delivery methods and dates, payment form layout, billing handling, terms: COULD NOT VERIFY (needs an email submit and address entry, off-limits).

**Delivery methods:** only "Free" seen. Speed choice and transit estimate: COULD NOT VERIFY.
**Payment methods (pre-form):** PayPal, Apple Pay, Klarna messaging, Visa, Mastercard, Amex, Discover. DIRECTLY OBSERVED as logos/buttons. "Pay in 4" text cites 0% interest and an instalment of $40 on $160. Card form fields: COULD NOT VERIFY.
**Trust signals:** "100 % secure payment", free shipping, samples, eco box, loyalty, US-shipping note; phone/e-mail help on the PDP. DIRECTLY OBSERVED. Returns/guarantee on cart/checkout: not seen, COULD NOT VERIFY.
**Distractions:** removed: header menu, search, promo bar. Kept: footer with newsletter and store finder; cart-page cross-sell and gifting blocks. DIRECTLY OBSERVED.
**Confirmation:** COULD NOT VERIFY.

---

## 6. Patterns for CHIAREL

### Adopt
- Stripped header on cart/checkout, and a minimal footer too (Guerlain does only half).
- Numbered step bar, with named next step on mobile.
- Persistent buy bar carrying name, size, price and button (desktop top, mobile bottom).
- Drawer (desktop) / bottom sheet (mobile) after add-to-cart, with stepper and a checkout button showing the total.
- One-field email identification resolving login vs guest.
- Shipping/offer reassurance repeated at the buy box and cart summary.
- Collapsed promo field.
- Claim footnotes naming test type and participant count; separate ingredient-level from product-level evidence.
- Complete ingredient list one click from the ingredient story.
- Numbered usage steps.

### Adapt
- **Ingredient disclosure:** anchored section or modal with its own URL fragment. Build the slot, but gate content on the owner's formula-transparency decision (INCI hidden until final).
- **Samples:** keep the choice, never gate checkout on it; pre-select a removable default or make it opt-in with no error state.
- **Cross-sell:** frame as a routine sequence; if shown in the cart, display the exact size and price the button adds.
- **Mobile cart:** totals and checkout earlier, or a sticky checkout bar for the whole cart.
- **Mobile pre-checkout sheet:** keep the express-wallet idea in one tap, not stacked behind a second checkout button.
- **Gifting:** one plain option (message plus box); two named cases is more than a small catalogue needs.
- **Efficacy block:** footnoted figures as a compact list/table in Libre Bodoni headings and Jost body, not centred all-caps lines.
- **Financing messaging:** only if CHIAREL really offers a financing provider.

### Deliberately avoid
- A checkout button that errors until samples are picked.
- Full newsletter/footer navigation on checkout.
- A mobile buy button more than one screen down with no persistent bar.
- Cloned carousel text in the DOM (check our own carousels).
- Cross-sell cards whose "From" price differs from the size added.
- Loyalty prompts competing with the pay button (INFERRED harm; moot without a loyalty program).
- Anything that makes a normal mobile tap trip bot protection; test our own mobile checkout with automation.

---

## 7. Open questions needing a real transaction

1. Guest address block: single or split fields, autocomplete, phone required?
2. Delivery methods at step 3, date estimates, does "Free" cover all?
3. When does the "$0.00" tax line update (after address)?
4. Payment step: embedded card form or redirect; billing defaulted to shipping; Klarna selectable in-form?
5. Order review: required acceptances, per-step edit links, display of samples and gift choice.
6. Confirmation page: contents, order number, guest-to-account prompt, tracking promises, upsell.
7. What happens to sample/gift choices when going back to the cart from identification?
8. Mobile checkout steps (blocked by 403): field layout, keyboard types, sticky pay button, step-bar collapse.
9. Does the email-first step create a pre-account (abandoned-cart emails) before consent?
10. Desktop image zoom (hover, click or none) and mobile pinch behaviour.
11. Returns/guarantee messaging at payment.
12. Is the mobile bottom-sheet cross-sell visible, and is it personalised or fixed merchandising?
