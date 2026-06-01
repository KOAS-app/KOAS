-- Add missing `location` column to SubscriptionPlan and `selectedSlotIds` array column to PlayerSubscription
ALTER TABLE "SubscriptionPlan"
ADD COLUMN "location" TEXT;

ALTER TABLE "PlayerSubscription"
ADD COLUMN "selectedSlotIds" TEXT[] NOT NULL DEFAULT '{}';
