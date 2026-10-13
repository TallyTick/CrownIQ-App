-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issueCount" INTEGER NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Alert_shop_sentAt_idx" ON "Alert"("shop", "sentAt");
