-- Add missing SubscriptionPlan schedule and usage columns
ALTER TABLE "SubscriptionPlan"
ADD COLUMN "openingTime" TEXT NOT NULL DEFAULT '08:00 AM';

ALTER TABLE "SubscriptionPlan"
ADD COLUMN "closingTime" TEXT NOT NULL DEFAULT '10:00 PM';

ALTER TABLE "SubscriptionPlan"
ADD COLUMN "openingDay" TEXT NOT NULL DEFAULT 'Monday';

ALTER TABLE "SubscriptionPlan"
ADD COLUMN "closingDay" TEXT NOT NULL DEFAULT 'Sunday';

ALTER TABLE "SubscriptionPlan"
ADD COLUMN "weeklyAllowedDays" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "SubscriptionPlan"
ADD COLUMN "hoursPerDay" DOUBLE PRECISION NOT NULL DEFAULT 1.0;
