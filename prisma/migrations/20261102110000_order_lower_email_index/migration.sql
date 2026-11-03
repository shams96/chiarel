-- Guest-order back-fill matches on lower("email") exactly; a plain index on "email" is not used for that.
DROP INDEX IF EXISTS "Order_email_idx";
CREATE INDEX "Order_lower_email_idx" ON "Order" (lower("email"));
