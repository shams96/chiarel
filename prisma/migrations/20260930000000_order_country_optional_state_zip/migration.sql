-- International launch (claudedocs/specs/international-launch/): Order gains
-- a required `country` column (backfilled "US" for every existing row, since
-- the site was US-only before this), and `state`/`zip` become optional since
-- not every launch country has both (e.g. Italy, UAE have no "state").

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "country" TEXT NOT NULL DEFAULT 'US';
ALTER TABLE "Order" ALTER COLUMN "state" DROP NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "zip" DROP NOT NULL;
