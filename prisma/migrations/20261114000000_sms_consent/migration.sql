-- SMS consent evidence (TCPA). New table only: no change to existing rows,
-- safe to apply before the code that writes it.

-- CreateTable
CREATE TABLE "SmsConsent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "phone" TEXT NOT NULL,
    "consentText" TEXT NOT NULL,
    "consentTextVersion" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "revokedAt" TIMESTAMP(3),
    "revokedVia" TEXT,

    CONSTRAINT "SmsConsent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SmsConsent_phone_idx" ON "SmsConsent"("phone");
