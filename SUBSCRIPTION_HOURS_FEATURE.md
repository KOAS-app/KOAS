# Subscription Plan Hours Per Day Feature

## Overview
This feature allows stadium owners to specify the maximum hours per day that players can play under their subscription plans. Players must choose booking times within these constraints before proceeding to payment.

## Changes Made

### 1. Database Schema (`backend/prisma/schema.prisma`)
- Added `hoursPerDay` field to `SubscriptionPlan` model
- Type: `Float` with default value of `1.0`
- Represents maximum hours a player can book per day under the subscription

### 2. Backend API (`backend/src/controllers/`)

#### `subscriptionPlan.controller.js`
- Updated `createSubscriptionPlan` to accept and save `hoursPerDay` parameter
- Updated `updateSubscriptionPlan` to accept and update `hoursPerDay` parameter
- Default value: 1.0 hour if not specified

#### `booking.controller.js`
- Added validation logic (step 2b) to check daily hours limit
- Calculates total hours already booked on the same day
- Prevents booking if adding the new slot would exceed `hoursPerDay` limit
- Returns clear error message showing current usage and limit

**Validation Flow:**
1. Check if player has active subscription
2. Validate day of week (existing)
3. Validate time range (existing)
4. **NEW: Validate hours per day limit**
   - Calculate slot duration in hours
   - Sum all bookings for the same day
   - Reject if total would exceed `plan.hoursPerDay`
5. Validate weekly limit (existing)
6. Validate total subscription limit (existing)

### 3. Owner Web Interface (`owner-web/`)

#### `src/components/SubscriptionPlanModal.tsx`
- Added "Hours per Day" dropdown selector
- Options: 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 8 hours
- Placed next to "Allowed Play Days per Week" field
- Included in form submission payload

#### `src/pages/SubscriptionPlansPage.tsx`
- Added hours per day display in plan cards
- Shows: "⏱️ X hour(s) per day"
- Positioned between time range and weekly limit

#### `src/types/index.ts`
- Added `hoursPerDay: number` to `SubscriptionPlan` interface

### 4. Mobile App (`mobile-app/`)

#### `src/screens/StadiumDetailScreen.tsx`
- Added hours per day display in subscription plan cards
- Shows: "⏱️ X hour(s) per day"
- Helps players understand the daily limit before subscribing

#### `src/types/index.ts`
- Added `hoursPerDay: number` to `SubscriptionPlan` interface

### 5. Booking Flow Validation

When a player with an active subscription tries to book a slot:

1. **Backend validates** the booking against all constraints including hours per day
2. **Error message** if limit exceeded: 
   ```
   "Daily hours limit exceeded: Your subscription allows X hour(s) per day. 
   You have already booked Y hour(s) on this day."
   ```
3. **Booking succeeds** only if all constraints are met

## User Experience

### For Stadium Owners:
1. Navigate to "Subscription Plans" page
2. Click "Create Plan" or edit existing plan
3. Set "Hours per Day" (e.g., 2 hours)
4. Set other constraints (days, time range, weekly limit)
5. Save plan

### For Players:
1. View subscription plans on stadium detail screen
2. See all constraints including "X hours per day"
3. Subscribe to plan and pay
4. When booking slots:
   - Can book multiple slots on same day up to daily hour limit
   - Receives clear error if trying to exceed limit
   - Can book on different days within weekly/total limits

## Example Scenarios

### Scenario 1: 2 Hours Per Day Plan
- Plan: 2 hours per day, 3 days per week
- Player books 1-hour slot (9 AM - 10 AM) ✅
- Player tries to book another 1.5-hour slot same day ❌
- Error: "Daily hours limit exceeded: Your subscription allows 2 hour(s) per day. You have already booked 1 hour(s) on this day."

### Scenario 2: Flexible Booking
- Plan: 3 hours per day, 5 days per week
- Player books 1-hour slot (2 PM - 3 PM) ✅
- Player books another 1-hour slot (5 PM - 6 PM) same day ✅
- Player books another 1-hour slot (8 PM - 9 PM) same day ✅
- Total: 3 hours used, limit reached for the day

## Technical Notes

### Duration Calculation
- Slot duration = (endTime - startTime) in hours
- Supports fractional hours (e.g., 1.5 hours for 90-minute slots)

### Database Migration
- Run `npx prisma db push` to apply schema changes
- Existing plans will have default `hoursPerDay = 1.0`
- Owners should update existing plans to set appropriate limits

### Validation Order
The booking validation checks constraints in this order:
1. Slot availability and past date check
2. Active subscription check
3. Day of week validation
4. Time range validation
5. **Hours per day validation** (NEW)
6. Weekly days limit validation
7. Total subscription days limit validation

This ensures efficient validation and clear error messages.

## Future Enhancements

Potential improvements:
- Allow different hours per day for weekdays vs weekends
- Show remaining hours for the day in booking UI
- Add analytics for hours usage per subscription
- Support hour rollover (unused hours carry to next day)
