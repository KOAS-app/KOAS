-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('PENDING', 'RECEIPT_SUBMITTED', 'ACTIVE', 'REJECTED', 'EXPIRED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "subscriptionPlan" TEXT NOT NULL DEFAULT 'STARTER';

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "stadiumId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerSubscription" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "subscriptionPlanId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "subscriptionCode" TEXT NOT NULL,
    "pricePaid" DOUBLE PRECISION NOT NULL,
    "receiptImageUrl" TEXT,
    "playerSubmittedAt" TIMESTAMP(3),
    "ownerConfirmedAt" TIMESTAMP(3),
    "ownerRejectedAt" TIMESTAMP(3),
    "ownerRejectionReason" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubscriptionPlan_stadiumId_idx" ON "SubscriptionPlan"("stadiumId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerSubscription_subscriptionCode_key" ON "PlayerSubscription"("subscriptionCode");

-- CreateIndex
CREATE INDEX "PlayerSubscription_playerId_idx" ON "PlayerSubscription"("playerId");

-- CreateIndex
CREATE INDEX "PlayerSubscription_subscriptionPlanId_idx" ON "PlayerSubscription"("subscriptionPlanId");

-- CreateIndex
CREATE INDEX "PlayerSubscription_subscriptionCode_idx" ON "PlayerSubscription"("subscriptionCode");

-- AddForeignKey
ALTER TABLE "SubscriptionPlan" ADD CONSTRAINT "SubscriptionPlan_stadiumId_fkey" FOREIGN KEY ("stadiumId") REFERENCES "Stadium"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerSubscription" ADD CONSTRAINT "PlayerSubscription_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerSubscription" ADD CONSTRAINT "PlayerSubscription_subscriptionPlanId_fkey" FOREIGN KEY ("subscriptionPlanId") REFERENCES "SubscriptionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
