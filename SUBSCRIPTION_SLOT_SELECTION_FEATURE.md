# Subscription Slot Selection Before Payment Feature

## Overview
Players now select their preferred time slots **before payment** during the subscription checkout process. The system ensures all selected slots comply with the subscription plan's constraints (day range, time range, hours per day, weekly limit).

## Complete Flow

### 1. Player Subscribes to Plan
1. Player views subscription plans on stadium detail screen
2. Sees all constraints: day range, time range, hours per day, weekly limit
3. Clicks "Subscribe Now"

### 2. Slot Selection (Step 1)
**SubscriptionCheckoutScreen - Step 1:**
- Fetches all available slots from the stadium
- **Filters slots** based on plan constraints:
  - ✅ Day of week must be within `openingDay` to `closingDay`
  - ✅ Time must be within `openingTime` to `closingTime`
  - ✅ Slot must not be already booked
  - ✅ Slot must be in the future
- Displays filtered slots grouped by date
- Player selects multiple slots
- **Real-time validation** when selecting:
  - ✅ Hours per day limit (calculates total hours for same day)
  - ✅ Weekly days limit (counts unique days)
- Shows selected slots summary
- "Continue to Payment" button enabled when slots selected

### 3. Payment Details (Step 2)
- Shows progress indicator (Step 1 complete, Step 2 active)
- Displays bank transfer details
- Shows selected slots summary
- Player transfers money via bank app

### 4. Receipt Upload (Step 3)
- Player uploads payment receipt screenshot
- Submits subscription application with:
  - Plan ID
  - Price paid
  - Receipt image URL
  - **Selected slot IDs array**

### 5. Owner Approval
**Owner Web - Subscription Requests Page:**
- Owner sees pending subscription applications
- Reviews player info, plan details, receipt
- Can see selected slots (future enhancement)
- Approves or rejects

### 6. Automatic Booking
**When owner approves:**
- Subscription status → ACTIVE
- Start/end dates calculated
- **Automatically books all selected slots:**
  - Marks each slot as `isBooked = true`
  - Creates `Booking` record with status `CONFIRMED`
  - Creates `Payment` record with method `SUBSCRIPTION`, status `PAID`
- Player receives active membership

## Technical Implementation

### Database Schema Changes

#### SubscriptionPlan Model
```prisma
model SubscriptionPlan {
  // ... existing fields
  hoursPerDay Float @default(1.0) // NEW: Maximum hours per day
}
```

#### PlayerSubscription Model
```prisma
model PlayerSubscription {
  // ... existing fields
  selectedSlotIds String[] @default([]) // NEW: Array of slot IDs
}
```

### Frontend Changes

#### Mobile App - SubscriptionCheckoutScreen.tsx
**New Features:**
- Multi-step checkout process (3 steps)
- Slot filtering based on plan constraints
- Real-time validation during selection
- Visual slot selection UI with date grouping
- Progress indicator
- Selected slots summary

**Key Functions:**
```typescript
filterSlotsByPlanConstraints(slots, plan) // Filters slots by day/time
toggleSlotSelection(slotId) // Validates and toggles selection
handleContinueToPayment() // Moves to step 2
groupSlotsByDate() // Groups slots by date for display
```

**Validation Logic:**
- Hours per day: Calculates total duration of slots on same day
- Weekly limit: Counts unique days in selection
- Shows alerts if limits exceeded

### Backend Changes

#### playerSubscription.controller.js

**subscribeToPlan:**
```javascript
// Now accepts selectedSlotIds array
const { subscriptionPlanId, pricePaid, receiptImageUrl, selectedSlotIds } = req.body;

// Stores selected slots in database
selectedSlotIds: selectedSlotIds || []
```

**confirmSubscription:**
```javascript
// Uses transaction to:
// 1. Activate subscription
// 2. Book all selected slots
// 3. Create bookings and payments

await prisma.$transaction(async (tx) => {
  // Update subscription
  // Loop through selectedSlotIds
  // Mark slots as booked
  // Create bookings with CONFIRMED status
  // Create payments with SUBSCRIPTION method
});
```

## User Experience

### For Players:

**Before (Old Flow):**
1. Subscribe → Pay → Wait for approval → Book slots manually

**After (New Flow):**
1. Subscribe → **Select slots** → Pay → Wait for approval → Slots auto-booked ✨

**Benefits:**
- Know exactly which slots they'll get
- No risk of slots being taken while waiting for approval
- Clear visibility of available times within plan constraints
- Immediate booking upon approval

### For Owners:

**Benefits:**
- See player's intended usage upfront
- Can verify slots match plan constraints
- Automatic booking reduces manual work
- Better capacity planning

## Validation Rules

### Client-Side (Mobile App)
1. **Slot Filtering:**
   - Day of week within plan range
   - Time within plan hours
   - Not already booked
   - In the future

2. **Selection Validation:**
   - Hours per day limit
   - Weekly days limit
   - Real-time feedback

### Server-Side (Backend)
1. **On Subscription:**
   - Plan exists and is active
   - No existing active subscription
   - Valid receipt image

2. **On Approval:**
   - Slots still available
   - Slots belong to stadium
   - Transaction ensures atomicity

## Example Scenarios

### Scenario 1: Weekend Warrior Plan
**Plan:** 2 hours/day, Sat-Sun, 8 AM - 6 PM, 2 days/week

**Player selects:**
- Saturday 9 AM - 10 AM ✅
- Saturday 2 PM - 3 PM ✅ (total 2 hours)
- Sunday 10 AM - 11 AM ✅
- Sunday 4 PM - 5 PM ✅ (total 2 hours)

**Result:** 4 slots selected, 2 days, within all limits ✅

### Scenario 2: Exceeding Daily Limit
**Plan:** 1.5 hours/day, Mon-Fri, 5 PM - 10 PM

**Player selects:**
- Monday 5 PM - 6 PM (1 hour) ✅
- Monday 7 PM - 8:30 PM (1.5 hours) ❌

**Alert:** "Your subscription allows 1.5 hour(s) per day. You've selected 2.5 hour(s) for this day."

### Scenario 3: Exceeding Weekly Limit
**Plan:** 1 hour/day, 3 days/week

**Player selects:**
- Monday 6 PM - 7 PM ✅
- Tuesday 6 PM - 7 PM ✅
- Wednesday 6 PM - 7 PM ✅
- Thursday 6 PM - 7 PM ❌

**Alert:** "Your subscription allows booking on 3 day(s) per week."

## API Endpoints

### POST /api/player-subscriptions/subscribe
**Request:**
```json
{
  "subscriptionPlanId": "uuid",
  "pricePaid": 1500,
  "receiptImageUrl": "/uploads/receipts/...",
  "selectedSlotIds": ["slot-id-1", "slot-id-2", "slot-id-3"]
}
```

**Response:**
```json
{
  "message": "Subscription request submitted successfully...",
  "subscription": {
    "id": "uuid",
    "status": "RECEIPT_SUBMITTED",
    "selectedSlotIds": ["slot-id-1", "slot-id-2", "slot-id-3"],
    ...
  }
}
```

### PATCH /api/player-subscriptions/:id/confirm
**Behavior:**
- Activates subscription
- Automatically books all slots in `selectedSlotIds`
- Creates bookings with `CONFIRMED` status
- Creates payments with `SUBSCRIPTION` method

## Future Enhancements

1. **Owner View of Selected Slots:**
   - Show selected slots in subscription request details
   - Visual calendar view

2. **Slot Availability Check:**
   - Warn if selected slots become unavailable
   - Allow player to reselect

3. **Flexible Booking:**
   - Allow partial slot selection
   - Book remaining slots later within limits

4. **Calendar View:**
   - Visual calendar for slot selection
   - Color-coded by availability

5. **Recurring Bookings:**
   - Select pattern (e.g., every Monday 6 PM)
   - Auto-generate slots for subscription duration

## Testing Checklist

- [ ] Slots filtered correctly by day range
- [ ] Slots filtered correctly by time range
- [ ] Hours per day validation works
- [ ] Weekly days validation works
- [ ] Selected slots stored in database
- [ ] Slots auto-booked on approval
- [ ] Bookings created with correct status
- [ ] Payments created with SUBSCRIPTION method
- [ ] UI shows correct constraints
- [ ] Progress indicator works
- [ ] Empty state shows when no slots available
- [ ] Error handling for API failures

## Migration Notes

**Existing Subscriptions:**
- `selectedSlotIds` defaults to empty array
- No impact on existing active subscriptions
- Players can still book manually as before

**Database:**
- Run `npx prisma db push` to apply schema changes
- No data migration needed
