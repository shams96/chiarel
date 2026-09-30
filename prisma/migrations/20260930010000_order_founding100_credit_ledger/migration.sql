-- Founding 100 credit-back ledger (claudedocs/specs/international-launch/,
-- N1/Founding 100 fold): tracks the promised 25%-of-checkout store credit,
-- previously unenforced/untracked anywhere. Both columns nullable — null
-- founding100Credit means "not a Founding 100 order", not "zero owed".

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "founding100Credit" INTEGER;
ALTER TABLE "Order" ADD COLUMN "founding100CreditIssuedAt" TIMESTAMP(3);
