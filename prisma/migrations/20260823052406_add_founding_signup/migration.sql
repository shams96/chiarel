-- CreateTable
CREATE TABLE "FoundingSignup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "social" TEXT,
    "referredBy" TEXT,
    "source" TEXT
);
