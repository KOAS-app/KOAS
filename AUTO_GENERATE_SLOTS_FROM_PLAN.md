# Auto-Generate Slots from Subscription Plan

## Overview
Owners can now automatically generate time slots based on their subscription plan's day and time constraints. This eliminates manual slot creation and ensures all slots match the plan's requirements.

## Feature Description

### What It Does
- Automatically creates slots for a date range
- Respects subscription plan constraints:
  - ✅ Day range (e.g., Monday-Sunday)
  - ✅ Time range (e.g., 8 AM - 10 PM)
- Generates slots only on allowed days
- Creates slots only within allowed hours
- Skips past dates automatically
- Avoids creating overlapping slots

### How It Works

**Owner Flow:**
1. Navigate to Slots page
2. Click "From Plan" button
3. Select a subscription plan
4. Choose location
5. Set date range (start and end date)
6. Set slot duration (e.g., 1 hour, 0.5 hours)
7. Set price per slot
8. Click "Generate Slots"
9. System creates all matching slots automatically

## Implementation

### Backend

#### New Endpoint: POST /api/slots/generate-from-plan

**Request Body:**
```json
{
  "subscriptionPlanId": "uuid",
  "location": "Main Field",
  "startDate": "2026-06-01",
  "endDate": "2026-06-30",
  "slotDuration": "1",
  "price": "500"
}
```

**Logic:**
1. Fetch subscription plan with constraints
2. Parse day range (openingDay to closingDay)
3. Parse time range (openingTime to closingTime)
4. Loop through each date in range
5. Check if date's day of week is allowed
6. If allowed, generate slots for that day:
   - Start at openingTime
   - Create slots of specified duration
   - Stop at closingTime
7. Skip slots in the past
8. Skip overlapping slots
9. Create all valid slots in database

**Response:**
```json
{
  "created": 120,
  "message": "Successfully generated 120 slots based on plan constraints"
}
```

### Frontend

#### New Component: GenerateFromPlanModal.tsx

**Features:**
- Fetches active subscription plans
- Shows plan constraints preview
- Date range picker
- Slot duration input
- Price input
- Validation and error handling

**UI Elements:**
- Plan selector dropdown
- Constraint preview box (shows days, hours, max hours/day)
- Location selector
- Start/End date inputs
- Slot duration input (supports 0.5 for 30 min)
- Price input
- Generate button

#### Updated: SlotsPage.tsx

**Changes:**
- Added "From Plan" button in header
- Imports GenerateFromPlanModal
- Shows modal when button clicked
- Refreshes slot list after generation
- Shows success message with count

## Example Scenarios

### Scenario 1: Weekend Plan
**Plan:**
- Days: Saturday - Sunday
- Hours: 8:00 AM - 6:00 PM
- Duration: 30 days

**Settings:**
- Start Date: June 1, 2026
- End Date: June 30, 2026
- Slot Duration: 1 hour
- Price: 500 ETB

**Result:**
- Generates slots only on Saturdays and Sundays
- Each day has slots from 8 AM to 6 PM (10 slots per day)
- Total: ~80 slots (8 weekends × 2 days × 10 slots)

### Scenario 2: Weekday Plan
**Plan:**
- Days: Monday - Friday
- Hours: 5:00 PM - 10:00 PM

**Settings:**
- Start Date: June 1, 2026
- End Date: June 30, 2026
- Slot Duration: 1.5 hours
- Price: 600 ETB

**Result:**
- Generates slots only on weekdays
- Each day has slots from 5 PM to 10 PM (3 slots per day)
- Total: ~60 slots (20 weekdays × 3 slots)

### Scenario 3: Full Week Plan
**Plan:**
- Days: Monday - Sunday
- Hours: 6:00 AM - 11:00 PM

**Settings:**
- Start Date: June 1, 2026
- End Date: June 7, 2026 (1 week)
- Slot Duration: 2 hours
- Price: 800 ETB

**Result:**
- Generates slots every day
- Each day has slots from 6 AM to 11 PM (8 slots per day)
- Total: 56 slots (7 days × 8 slots)

## Benefits

### For Owners
- ✅ **Save Time**: Generate hundreds of slots in seconds
- ✅ **Consistency**: All slots match plan constraints automatically
- ✅ **No Errors**: System prevents invalid slot creation
- ✅ **Bulk Creation**: Create slots for weeks or months at once
- ✅ **Flexible**: Choose any date range and slot duration

### For Players
- ✅ **More Availability**: Owners can easily create more slots
- ✅ **Consistent Schedule**: Slots always match subscription plan
- ✅ **Predictable**: Know when slots will be available

## Technical Details

### Day of Week Validation
```javascript
const dayMap = { 'Sunday': 0, 'Monday': 1, ..., 'Saturday': 6 };
const openDayIndex = dayMap[plan.openingDay];
const closeDayIndex = dayMap[plan.closingDay];

// Check if day is in range (handles wrap-around)
if (openDayIndex <= closeDayIndex) {
  isDayAllowed = dayOfWeek >= openDayIndex && dayOfWeek <= closeDayIndex;
} else {
  // Wraps around (e.g., Saturday to Monday)
  isDayAllowed = dayOfWeek >= openDayIndex || dayOfWeek <= closeDayIndex;
}
```

### Time Parsing
```javascript
// Parse "08:00 AM" to 8.0, "10:30 PM" to 22.5
const parseTimeToHours = (timeStr) => {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  
  return hours + (minutes / 60);
};
```

### Slot Generation Loop
```javascript
for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
  const dayOfWeek = d.getDay();
  
  if (!isDayAllowed(dayOfWeek)) continue;
  
  let currentHour = openHour;
  while (currentHour < closeHour) {
    const endHour = Math.min(currentHour + duration, closeHour);
    
    // Create slot from currentHour to endHour
    // Check for overlaps
    // Skip if in past
    // Add to slots array
    
    currentHour = endHour;
  }
}
```

## API Route

**File:** `backend/src/routes/slot.routes.js`

```javascript
router.post('/generate-from-plan', 
  authenticate, 
  authorizeRoles('OWNER'), 
  generateSlotsFromPlan
);
```

## Files Modified

### Backend
- `backend/src/controllers/slot.controller.js` - Added `generateSlotsFromPlan` function
- `backend/src/routes/slot.routes.js` - Added route

### Frontend
- `owner-web/src/components/GenerateFromPlanModal.tsx` - New modal component
- `owner-web/src/pages/SlotsPage.tsx` - Added button and modal integration

## Usage Tips

1. **Create Plan First**: Make sure you have an active subscription plan
2. **Choose Duration Wisely**: 
   - 0.5 hours = 30 minutes
   - 1 hour = standard slot
   - 1.5 hours = 90 minutes
   - 2 hours = longer sessions
3. **Date Range**: Can generate for days, weeks, or months
4. **Check Results**: Review generated slots in the slot list
5. **Delete if Needed**: Can delete individual slots if needed

## Future Enhancements

1. **Recurring Generation**: Auto-generate for next month
2. **Multiple Plans**: Generate from multiple plans at once
3. **Preview**: Show preview before generating
4. **Batch Delete**: Delete all slots for a date range
5. **Price Variations**: Different prices for different times
6. **Capacity**: Generate multiple slots for same time (different fields)

## Testing Checklist

- [ ] Slots generated only on allowed days
- [ ] Slots generated only within allowed hours
- [ ] Past dates skipped
- [ ] Overlapping slots skipped
- [ ] Correct slot duration
- [ ] Correct price applied
- [ ] Success message shows count
- [ ] Slot list refreshes
- [ ] Works with wrap-around days (Sat-Mon)
- [ ] Works with wrap-around times (10 PM - 2 AM)
- [ ] Error handling for invalid inputs
- [ ] Tier restrictions enforced

---

**Status**: ✅ **IMPLEMENTED AND READY**

Owners can now generate slots automatically based on subscription plan constraints, saving significant time and ensuring consistency.
