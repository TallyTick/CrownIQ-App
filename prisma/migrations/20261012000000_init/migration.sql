-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,
    "refreshToken" TEXT,
    "refreshTokenExpires" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scan" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "variantCount" INTEGER NOT NULL,
    "findingCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Scan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VariantSnapshot" (
    "id" TEXT NOT NULL,
    "scanId" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productTitle" TEXT NOT NULL,
    "variantTitle" TEXT NOT NULL,
    "sku" TEXT,
    "tracked" BOOLEAN NOT NULL,
    "sellWhenEmpty" BOOLEAN NOT NULL,
    "available" INTEGER NOT NULL,
    "soldLast30Days" INTEGER NOT NULL,

    CONSTRAINT "VariantSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Finding" (
    "id" TEXT NOT NULL,
    "scanId" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "variantId" TEXT,
    "message" TEXT NOT NULL,
    "fix" TEXT NOT NULL,

    CONSTRAINT "Finding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Scan_shop_createdAt_idx" ON "Scan"("shop", "createdAt");

-- CreateIndex
CREATE INDEX "VariantSnapshot_scanId_idx" ON "VariantSnapshot"("scanId");

-- CreateIndex
CREATE INDEX "Finding_scanId_idx" ON "Finding"("scanId");

-- AddForeignKey
ALTER TABLE "VariantSnapshot" ADD CONSTRAINT "VariantSnapshot_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

