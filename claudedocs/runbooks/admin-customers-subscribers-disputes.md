# Runbook: customers, subscribers, disputes

Tier 2, assisted triage: an agent can diagnose and propose; a human approves anything that changes data or touches production.

## Customers (`/admin/customers`)
- Built from **paid, not cancelled** orders, grouped by email ignoring case. Lifetime value is gross USD, before refunds and fees.
- Admin and Member see full details and can search and export; a Viewer sees a masked list only.
- Opening a customer shows their orders (looked up with a POST, so the email never appears in a URL).
- Export (CSV) holds personal data: it is written to the audit log first, so `/admin/audit` shows who exported and when.

## Subscribers (`/admin/subscribers`)
- Shows the newsletter list with consent date and source. Filter by active or unsubscribed.
- **Unsubscribe** (Admin, Member): use when someone asks to be removed. It only ever sets the unsubscribe date; the entry is kept so the suppression is never lost.
- **There is no resubscribe button on purpose.** Consent has to come from the person (the signup form). Never re-add someone because they asked by email; point them to the form.
- CSV export is Admin only and audited.

## Disputes (`/admin/disputes`)
- Lists every order with a dispute: status, reason, amount, dates, and an **evidence checklist** (terms acceptance record, carrier and tracking, shipped and delivered dates, customer email, shipping address, itemised order). A flagged item is evidence you do not have.
- The dispute-rate panel is our own estimate against the Visa and Mastercard thresholds (see `claudedocs/specs/dispute-risk-mitigation/`). Stripe's dashboard is the system of record.
- The Stripe link opens the payment; responding to the dispute (uploading evidence) is done in Stripe. This page is read-only.
- **Best defence is the tracking record.** Mark orders shipped with real tracking at `/admin/orders` the day they leave; an order with no tracking shows as missing evidence here.

## Symptoms and fixes

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| A customer is missing from Customers | Their order is pending, cancelled, or was never paid | Check `/admin/orders` for the order's payment and fulfilment state |
| Same person appears twice | Different email spelling (typo or alias), not just case | Treated as two customers by design; no merge tool yet |
| Subscriber still gets mail after unsubscribing | Mail sent outside the console, or cached send list | Check the entry shows unsubscribed; campaigns (P3) will honour it automatically |
| Dispute shows no Stripe link | The order has no PaymentIntent id recorded | Find it in Stripe by the customer email and amount |
| "Terms acceptance" flagged missing | Older order from before the consent record existed | Nothing to do; rely on the other evidence |
