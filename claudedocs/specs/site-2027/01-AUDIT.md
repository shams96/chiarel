# CHIAREL site, 2027 audit (Phase 0 of spec-driven change)

Status: DRAFT for owner review. Nothing here has been built or changed on the site.
Date: 2026-10-18. Evidence tags: **verified** (seen this session), **inferred** (reasoned, not seen), **unknown** (not checked).

## 1. What was reviewed

| Source | Coverage | Limits |
|---|---|---|
| Owner screen capture `capture-1.trec` (38 s, decoded to frames) | Guerlain home hero film only | Never scrolls past the hero |
| Guerlain in the in-app browser | Home (scrolled), skincare mega-menu, Abeille Royale collection page, Youth Watery Oil Serum product page, footer/services block | Small viewport; fine motion not captured. Not seen: La Maison, spas/boutiques, store locator, account, cart/checkout, fragrance and makeup pages |
| CHIAREL live home, scrolled | Hero, ritual bands, product pairs, Terra editorial | Some blank bands appeared between sections while scrolling in the tool; **unknown** whether real or reveal animations that the tool scrolled past |
| CHIAREL other pages | Known from the repo and this session's work (not re-scrolled today) | Marked **inferred** where not seen live today |
| Trend research (web search) | Two searches, sources below | Mostly agency/vendor blogs plus Euromonitor commentary; no 2027 forecast specific to luxury neck care found |

## 2. What Guerlain does (verified)

1. **Hero is a ~38 s crafted film**, not a still: stop-motion jewelled puppets, Paris bridge made of beads, products revealed only in the last seconds. Overlay is minimal: small label, title, one white button, mute/pause. Header is a white bar with wordmark left, three icons right, over a thin navy announcement strip that rotates messages (new launch, complimentary shipping and samples, engraving).
2. **Commerce sits directly under the film:** carousel with NEW / BESTSELLER / LIMITED EDITION tags, prices, Buy now, Personalize. Two large editorial tiles, then gift paths (Art of Gifting, Engraving, Gift Finder).
3. **Collection page:** a manifesto paragraph with sourced proof ("15 years of research, 9 patents and 9 publications", footnoted "in vitro test on ingredient"), category chips (Lotions, Serums, Creams, Eyes, Cleansers, Body), 31 results in a grid with editorial image tiles inserted between products. **Refills** are priced lower than the full jar. **Entry price points** exist ($60 7-day "Bee Lab Shot" course, $65 serum).
4. **Product page:** reviews (1,293), Klarna instalments, a phone number and email for help, "2 samples", "complimentary shipping on all orders", sustainability line. Long story sections with provenance (named forest in Norway), "99% naturally-derived (ISO 16128)", and **clinical statistics with panel sizes in footnotes** (n=31, 40, 104).
5. **Service layer:** boutiques, spas, store locator, loyalty programme, engraving/personalisation, choice of 2 samples with every order.

## 3. CHIAREL today

Strengths (verified unless marked):
- Calm, uncluttered type; wordmark and Libre Bodoni headlines read as house style.
- Clear AM/PM ritual structure with distinct bands; per-day pricing; plan selector.
- Honest provenance (made fresh to order in Isola del Liri), complimentary samples with every order, 90-day guarantee (seen on N1 page).
- Functional product names ("Neck & Décolleté Renewal Emulsion", "Eye Treatment") that AI search and shoppers can parse.
- Accessibility, security and performance work already merged this autumn (inferred sufficient; not re-audited here).

Gaps against the benchmark:

| # | Gap | Evidence tier |
|---|---|---|
| G1 | **No motion or film.** Hero is a still. Nothing carries a story over time. | verified |
| G2 | **Imagery is not one system.** Light hands hero; dark glossy N1 gallery; sunlit Capri scenes; studio models; AI-looking hands. Moods and lighting differ page to page. | verified |
| G3 | **Merchandising is thin.** No tags (new/limited/bestseller), no gifting path, no personalisation, no refills, no low-priced entry ritual beyond samples. | verified |
| G4 | **Social proof absent.** No reviews, ratings or press quotes on pages seen. | verified (home, N1 page); inferred elsewhere |
| G5 | **Story depth.** Isola del Liri, the lab and the formulator are named but not shown (no craft chapters, no place imagery used as a system). | inferred |
| G6 | **No service layer.** No visible phone/chat concierge line on pages seen; account is limited (copy says orders by email). | verified (account copy) |
| G7 | **Proof format differs from Guerlain.** Guerlain publishes footnoted trial numbers; CHIAREL has no equivalent and must not invent one. Approved claims ("Customer Tested", "clinically studied ingredients") stay as is. | verified |
| G8 | **Open owner/lab items that cap the upgrade:** supplier INCI (gate for publishing ingredient lists), fragrance declaration, Eye Treatment trademark clearance, N1 and Eye pricing/launch dates, Stripe still in test mode. | verified (project records) |

## 4. Trends that bear on the plan (sourced)

- **AI search visibility gap for luxury names.** Euromonitor argues proprietary luxury names give AI systems little functional information; a top e-commerce skincare brand can rank far lower for AI referrals. Implication: functional descriptors, structured product data and concern-led copy. [Euromonitor](https://www.euromonitor.com/article/luxury-is-becoming-ais-blind-spot)
- **Discovery, personalisation, ingredient transparency** as the three investments in 2026 beauty e-commerce commentary (vendor sources, unverified figures). [Cosmetics Business](https://cosmeticsbusiness.com/discovery-personalisation-and-transparency-are-driving-cosmetics-e), [Ringly](https://ringly.io/blog/beauty-ecommerce-trends-2026)
- **Longevity and prevention** replacing "anti-ageing correction"; "Clean reimagined": away from free-from claims toward evidence-backed ingredient marketing (Euromonitor 2026-27 trends summary, partial access). [Euromonitor top five trends](https://www-euromonitor-com.lib.ezproxy.hkust.edu.hk/article/top-five-trends-shaping-beauty-and-personal-care-in-2026-and-2027)
- **Neck and décolleté is an emerging category** (screen-time "tech neck" coverage; a May 2026 neck-and-face serum launch from another brand). [Glamour SA](https://www.glamour.co.za/beauty/skincare/beyond-the-jawline-the-beauty-trend-redefining-modern-skincare-ddb51460-a5ad-4477-92c1-9375536f7f43)
- **Prestige skincare grew about 1% in the first nine months of 2025** while mass grew faster, so authority has to be earned with proof, not heritage. [Beauty Independent](https://www.beautyindependent.com/?p=181177)

Not found: any 2027 forecast specific to luxury neck care or clinical-claims disclosure standards in prestige.

## 5. Recommended position (for decision)

**Science-led luxury with Italian provenance**, not heritage luxury. CHIAREL cannot out-heritage a 190-year house, but it can lead on evidence-forward transparency, a neck/décolleté category it owns, and a made-to-order craft story that is true. Borrow Guerlain's craft, film, service layer and merchandising discipline, not its claims style.

## 6. Page-by-page audit (job, state, gap)

State key: V = viewed live today, K = known from repo/earlier work (inferred), grade A strong / B good, gaps / C needs work.

| Route | Job | State | Grade | Main gap vs benchmark |
|---|---|---|---|---|
| `/` home | Say what CHIAREL is; route to ritual or N1 | V | B | Still hero, no film, uneven imagery, no tags/gifting |
| `/shop` | Browse | K | B | No collection story, tags, filters, editorial tiles |
| `/shop/[slug]` PDP | Convert | V (N1) | B | No reviews, no phone/concierge, short story, no provenance chapter |
| `/ritual` | Teach AM/PM routine | K | A- | Static; no film/animation of the steps |
| `/build-your-ritual` | Personalised set | K | B | Not connected to assessment results (inferred) |
| `/assessment` | Skin diagnostic | K | B | Result-to-product link and AI-search value untested |
| `/science/*` (10 pages) | Explain actives | K | B | Heavy text; needs consistent template and image system |
| `/house`, `/journal/*` (4), `/press` | Story and authority | K | C+ | No craft chapters, place imagery, or press proof |
| `/founding-100` | Early-access offer | K | B | Needs owner confirmation of terms |
| `/cart`, `/checkout`, `/order/[id]` | Complete purchase | K | B+ | Test mode; no wallets, no instalments |
| `/account` | Orders/subscription | K | C | Email-based management |
| `/contact`, `/privacy`, `/terms`, `/unsubscribed` | Service and legal | K | B | No concierge line |
| `/admin/*` | Internal | K | n/a | Out of scope |

## 7. What this audit cannot decide

Conversion and traffic effects; Guerlain's unseen pages; whether the blank scroll bands on CHIAREL are real; how the brand wants to handle claims beyond the two approved ones. Phase 1 (specification) should not start until the owner confirms the position in section 5 and supplies the missing captures or confirms the above.
