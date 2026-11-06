-- Order payment record: amounts in cents, tax, currency, paid/refunded times,
-- session expiry, a checkout fingerprint (reuse of an open Stripe session) and
-- the confirmation-email timestamp. Additive and nullable: no backfill, no
-- change to existing rows, safe to apply before the code that writes them.

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "amountPaidCents" INTEGER,
ADD COLUMN     "checkoutFingerprint" TEXT,
ADD COLUMN     "confirmationEmailAt" TIMESTAMP(3),
ADD COLUMN     "currency" TEXT,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "refundedAt" TIMESTAMP(3),
ADD COLUMN     "refundedCents" INTEGER,
ADD COLUMN     "sessionExpiresAt" TIMESTAMP(3),
ADD COLUMN     "taxCents" INTEGER;

-- CreateIndex
CREATE INDEX "Order_checkoutFingerprint_idx" ON "Order"("checkoutFingerprint");
