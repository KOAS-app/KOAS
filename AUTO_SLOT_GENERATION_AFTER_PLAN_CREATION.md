# Auto Slot Generation After Plan Creation

## Overview
When owners create a new subscription plan, they are immediately prompted to generate time slots that match the plan's constraints. This creates a seamless workflow from plan creation to slot availability.

## Feature Description

### Two-Step Process

**Step 1: Create Subscription Plan**
- Owner fills in plan details:
  - Name, price, duration
  - Day range (Monday-Sunday)
  - Time range (8 AM - 10 PM)
  - Hours per day, weekly limit
  - Description
- Clicks "Create Plan"
- Plan is saved to database

**Step 2: Generate Slots (Automatic Prompt)**
- Modal automatically transitions to slot generation
- Shows plan constraints as preview
- Owner configures:
  - Location
  - Date range (start/end)
  - Slot duration (e.g., 1 hour)
  - Price per slot
- Options:
  - **Generate Slots**: Creates all matching slots
  - **Skip for Now**: Closes modal without generating

### Key Benefits

✅ **Seamless Workflow**: No need to navigate to separate pages
✅ **Immediate Availability**: Slots ready right after plan creation
✅ **Guided Process**: Owner doesn't forget to create slots
✅ **Constraint Matching**: Slots automatically match plan rules
✅ **Optional**: Can skip if owner wants to create slots later

## Implementation

### Frontend Changes

#### SubscriptionPlanModal.tsx

**New State:**
```typescript
const [step, setStep] = useState<'plan' | 'slots'>('plan');
const [createdPlanId, setCreatedPlanId] = useState<string | null>(null);
const [stadiumData, setStadiumData] = useState<{ id: string; locations: string[] } | null>(null);
const [slotForm, setSlotForm] = useState({
  location: '',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  slotDuration: '1',
  slotPrice: '',
});
```

**Modified handleSubmit:**
```typescript
if (isEdit) {
  // Edit mode: just update and close
  await api.put(`/subscription-plans/${plan.id}`, payload);
  onSuccess();
} else {
  // Create mode: save plan, then show slot generation
  const res = await api.post('/subscription-plans', payload);
  setCreatedPlanId(res.data.id);
  
  // Fetch stadium data
  const stadiumRes = await api.get('/stadiums/my');
  const stadium = stadiumRes.data[0];
  setStadiumData({ id: stadium.id, locations: stadium.locations || [] });
  
  // Move to step 2
  setStep('slots');
}
```

**New handleGenerateSlots:**
```typescript
const handleGenerateSlots = async (e: React.FormEvent) => {
  e.preventDefault();
  setSaving(true);
  setError('');

  try {
    await api.post('/slots/generate-from-plan', {
      subscriptionPlanId: createdPlanId,
      location: slotForm.location,
      startDate: slotForm.startDate,
      endDate: slotForm.endDate,
      slotDuration: slotForm.slotDuration,
      price: slotForm.slotPrice,
    });
    onSuccess();
  } catch (err) {
    setError(getApiError(err, 'Failed to generate slots.'));
  } finally {
    setSaving(false);
  }
};
```

**New handleSkipSlots:**
```typescript
const handleSkipSlots = () => {
  onSuccess(); // Just close and refresh
};
```

### UI Flow

**Step 1 UI (Plan Creation):**
```
┌─────────────────────────────────────┐
│ Add Subscription Plan               │
│ Step 1: Create your subscription   │
├─────────────────────────────────────┤
│                                     │
│ [Plan Name Input]                   │
│ [Price] [Duration]                  │
│ [Opening Day] [Closing Day]         │
│ [Opening Time] [Closing Time]       │
│ [Weekly Days] [Hours/Day]           │
│ [Description]                       │
│ [Active Toggle]                     │
│                                     │
│ [Cancel] [Create Plan] ←────────────┤
└─────────────────────────────────────┘
```

**Step 2 UI (Slot Generation):**
```
┌─────────────────────────────────────┐
│ Generate Slots for Plan             │
│ Step 2: Auto-generate time slots   │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Plan: Weekend Warrior           │ │
│ │ 📅 Saturday - Sunday            │ │
│ │ 🕒 8:00 AM - 6:00 PM            │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Location Dropdown]                 │
│ [Start Date] [End Date]             │
│ [Slot Duration (hours)]             │
│ [Price per Slot]                    │
│                                     │
│ [Skip for Now] [Generate Slots] ←───┤
└─────────────────────────────────────┘
```

## User Experience

### Owner Journey

```
1. Click "Create Plan" on Subscription Plans page
   ↓
2. Fill in plan details
   - Name: "Weekend Warrior"
   - Days: Saturday - Sunday
   - Hours: 8 AM - 6 PM
   - Duration: 30 days
   ↓
3. Click "Create Plan"
   ↓
4. Modal automatically shows slot generation form
   - Plan constraints displayed
   - Pre-filled with defaults
   ↓
5. Owner configures slots:
   - Location: Main Field
   - Dates: June 1-30
   - Duration: 1 hour
   - Price: 500 ETB
   ↓
6. Click "Generate Slots"
   ↓
7. System creates ~80 slots
   ↓
8. Modal closes, page refreshes
   ↓
9. Plan and slots are ready!
```

### Alternative: Skip Slots

```
1-4. Same as above
   ↓
5. Owner clicks "Skip for Now"
   ↓
6. Modal closes
   ↓
7. Plan created, no slots yet
   ↓
8. Owner can generate slots later from:
   - Slots page "From Plan" button
   - Or manually create slots
```

## Example Scenarios

### Scenario 1: Weekend Plan with Immediate Slots

**Step 1 - Create Plan:**
- Name: "Weekend Warrior"
- Price: 2000 ETB
- Duration: 30 days
- Days: Saturday - Sunday
- Hours: 8:00 AM - 6:00 PM
- Hours/Day: 2 hours
- Weekly Days: 2 days

**Step 2 - Generate Slots:**
- Location: Main Field
- Start: June 1, 2026
- End: June 30, 2026
- Duration: 1 hour
- Price: 500 ETB

**Result:**
- Plan created ✅
- ~80 slots generated ✅
- Players can immediately subscribe and book ✅

### Scenario 2: Create Plan, Generate Slots Later

**Step 1 - Create Plan:**
- Name: "Weekday Evening"
- Price: 1500 ETB
- Duration: 30 days
- Days: Monday - Friday
- Hours: 5:00 PM - 10:00 PM

**Step 2 - Skip:**
- Click "Skip for Now"

**Result:**
- Plan created ✅
- No slots yet
- Owner generates slots later when ready

## Technical Details

### Edit vs Create Mode

**Edit Mode:**
- Shows only plan form
- No slot generation step
- Updates existing plan
- Closes immediately after save

**Create Mode:**
- Shows plan form first
- Automatically transitions to slot generation
- Saves plan, then prompts for slots
- Two-step process

### Data Flow

```
User fills plan form
  ↓
Clicks "Create Plan"
  ↓
POST /api/subscription-plans
  ↓
Plan saved, returns plan.id
  ↓
Fetch stadium data (locations)
  ↓
Set createdPlanId
  ↓
Transition to step 2
  ↓
User fills slot form
  ↓
Clicks "Generate Slots"
  ↓
POST /api/slots/generate-from-plan
  {
    subscriptionPlanId: createdPlanId,
    location, startDate, endDate,
    slotDuration, price
  }
  ↓
Slots generated
  ↓
Modal closes
  ↓
Page refreshes
```

### Error Handling

**Plan Creation Errors:**
- Shows error in step 1
- User can fix and retry
- Doesn't proceed to step 2

**Slot Generation Errors:**
- Shows error in step 2
- User can fix and retry
- Plan already created (not lost)
- Can skip and generate later

## Benefits

### For Owners
✅ **Faster Setup**: Create plan and slots in one flow
✅ **No Forgetting**: Prompted immediately to create slots
✅ **Flexibility**: Can skip and do later if needed
✅ **Consistency**: Slots automatically match plan
✅ **Time Saving**: No navigation between pages

### For Players
✅ **Immediate Availability**: Slots ready right away
✅ **Better Experience**: Can subscribe and book immediately
✅ **Consistency**: Slots always match plan constraints

## Files Modified

**Frontend:**
- `owner-web/src/components/SubscriptionPlanModal.tsx`
  - Added two-step process
  - Added slot generation form
  - Added state management for steps
  - Added slot generation handlers

**Backend:**
- No changes needed (uses existing endpoint)
- `/api/slots/generate-from-plan` already implemented

## Testing Checklist

- [ ] Create new plan shows step 1
- [ ] After creating plan, automatically shows step 2
- [ ] Plan constraints displayed in step 2
- [ ] Location dropdown populated
- [ ] Date range defaults to 30 days
- [ ] Generate slots creates slots successfully
- [ ] Skip button closes modal without generating
- [ ] Edit mode doesn't show step 2
- [ ] Error handling works in both steps
- [ ] Page refreshes after completion
- [ ] Plan and slots both visible after creation

## Future Enhancements

1. **Preview**: Show estimated slot count before generating
2. **Multiple Locations**: Generate for all locations at once
3. **Recurring**: Auto-generate for next month
4. **Templates**: Save slot generation settings as templates
5. **Batch Operations**: Generate for multiple plans at once

---

**Status**: ✅ **IMPLEMENTED AND READY**

Owners now have a seamless two-step process: create plan → generate slots, all in one modal flow!
