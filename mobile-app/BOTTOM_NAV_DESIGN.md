# KOAS Mobile Bottom Navigation Design System

## Overview
Premium, production-grade bottom navigation optimized for one-thumb usage, instant recognition, and real-world mobile conditions.

---

## Navigation Structure

### 3-Tab System (Optimal for Mobile)
```
┌─────────────────────────────────────────────┐
│  [Explore]    [Bookings]    [Profile]       │
└─────────────────────────────────────────────┘
```

**Why 3 tabs?**
- Instant thumb reach across entire bar
- Zero cognitive overload
- Clear mental model of app structure
- Fast switching between core features
- Scalable for future additions

---

## Tab Breakdown

### 1. **Explore** (Primary Discovery)
- **Icon**: Search/Magnifying glass
- **Purpose**: Turf discovery, stadium browsing, availability search
- **User Journey**: "I want to find a turf to book"
- **Priority**: Primary entry point for new bookings

### 2. **Bookings** (Active Management)
- **Icon**: Calendar with emphasis
- **Purpose**: View upcoming/past bookings, manage reservations
- **User Journey**: "I want to check my bookings"
- **Priority**: High-frequency access for active users

### 3. **Profile** (Account & Settings)
- **Icon**: User avatar
- **Purpose**: Account settings, preferences, payment methods, support
- **User Journey**: "I want to manage my account"
- **Priority**: Secondary but essential for account management

---

## Design Specifications

### Visual Hierarchy

#### Active State
- **Color**: `#16a34a` (Primary green)
- **Stroke Weight**: `2.25px`
- **Label Weight**: `600 (Semibold)`
- **Icon Fill**: Subtle inner accent (15-20% opacity)
- **Recognition**: Instant visual feedback

#### Inactive State
- **Color**: `#8a9490` (Muted gray)
- **Stroke Weight**: `2px`
- **Label Weight**: `600 (Semibold)`
- **Opacity**: Reduced but readable

### Spacing & Ergonomics

```
iOS:  84px total height
      - 8px top padding
      - 24px icon area
      - 3px gap
      - 11px label
      - 20px bottom padding (safe area)

Android: 64px total height
         - 8px top padding
         - 24px icon area
         - 3px gap
         - 11px label
         - 12px bottom padding
```

**Touch Targets**: Minimum 44x44pt (iOS HIG compliant)

### Typography
- **Font Size**: 11px
- **Weight**: 600 (Semibold)
- **Letter Spacing**: 0.3px
- **Line Height**: Auto
- **Case**: Sentence case (not uppercase)

### Colors (Dark Mode Optimized)

```css
Background:     #111816  (Dark surface)
Border Top:     rgba(255, 255, 255, 0.06)  (Subtle separation)
Active:         #16a34a  (Primary green)
Inactive:       #8a9490  (Muted text)
Shadow:         rgba(0, 0, 0, 0.12)  (Subtle depth)
```

---

## Icon Design Principles

### Consistency
- All icons: 24x24px viewport
- Stroke-based (not filled)
- 2px default stroke, 2.25px active
- Rounded line caps and joins
- Optical alignment over mathematical

### Active State Enhancement
- **Explore**: Inner circle fill (20% opacity)
- **Bookings**: Small calendar date fill (20% opacity)
- **Profile**: Avatar circle fill (15% opacity)

### Recognition Speed
- Icons chosen for instant recognition
- No abstract metaphors
- Universal symbols (search, calendar, user)
- Works in low-light conditions
- Readable at small sizes

---

## Interaction Design

### Tap Behavior
- **Feedback**: Instant color change (no delay)
- **Animation**: None (speed over flash)
- **Haptic**: System default (iOS only)
- **Sound**: None

### Transitions
- **Duration**: Instant (0ms)
- **Easing**: N/A
- **Philosophy**: Speed and clarity over animation

### Keyboard Behavior
- **Auto-hide**: Yes (`tabBarHideOnKeyboard: true`)
- **Reason**: Maximize input area, reduce visual clutter

---

## Accessibility

### Contrast Ratios
- Active state: 4.5:1+ (WCAG AA compliant)
- Inactive state: 3:1+ (readable but de-emphasized)

### Touch Targets
- Minimum: 44x44pt (iOS HIG)
- Actual: Full tab width × 64-84px height
- Result: Easy one-thumb operation

### Labels
- Always visible (not icon-only)
- Clear, concise, unambiguous
- Proper semantic meaning

---

## Platform Optimization

### iOS Specific
- Safe area insets respected (20px bottom padding)
- System font rendering
- Native shadow implementation
- Haptic feedback support

### Android Specific
- Material elevation system
- Reduced bottom padding (12px)
- Sans-serif medium font
- Navigation bar handling

---

## Real-World Usage Scenarios

### ✅ Optimized For:
- One-handed operation while walking
- Quick glances (< 1 second recognition)
- Outdoor usage (high contrast)
- Low attention contexts
- Frequent switching between tabs
- Night usage (dark mode first)

### ❌ Not Optimized For:
- Decorative screenshots
- Marketing materials
- Desktop viewing
- High animation expectations

---

## Future Scalability

### Potential 4th Tab (If Needed)
**Option A: Teams/Matches**
- Icon: Users/Group
- Purpose: Team management, match scheduling
- Placement: Between Bookings and Profile

**Option B: Notifications**
- Icon: Bell
- Purpose: Booking updates, match invites
- Placement: Far right

**Decision Criteria:**
- User research data
- Feature usage analytics
- Cognitive load testing
- One-thumb reachability

### What NOT to Add
- ❌ More than 5 tabs (cognitive overload)
- ❌ Hidden overflow menus (poor discoverability)
- ❌ Floating action buttons (visual noise)
- ❌ Gesture-based navigation (poor discoverability)

---

## Design Philosophy Summary

### Core Principles
1. **Speed over spectacle** - Instant access beats fancy animations
2. **Clarity over cleverness** - Obvious beats creative
3. **Usability over aesthetics** - Function beats form
4. **Simplicity over features** - Less is more

### Quality Benchmarks
- Can users navigate without looking? ✓
- Works in bright sunlight? ✓
- Operable with one thumb? ✓
- Zero learning curve? ✓
- Feels premium but effortless? ✓

---

## Technical Implementation

### Dependencies
- `@react-navigation/bottom-tabs`
- `react-native-svg` (custom icons)
- Theme system integration

### Performance
- No re-renders on tab switch
- Lazy-loaded screens
- Optimized SVG rendering
- Minimal shadow calculations

### Maintenance
- Icons: Single source of truth
- Colors: Theme system tokens
- Spacing: Design system constants
- Platform logic: Centralized

---

## Comparison: Before vs After

| Aspect | Before | After |
|--------|--------|-------|
| **Icon Style** | Filled on active | Stroke + subtle fill accent |
| **Stroke Weight** | 2.5px active | 2.25px active (refined) |
| **Colors** | Hardcoded values | Theme system tokens |
| **Height (iOS)** | 88px | 84px (optimized) |
| **Height (Android)** | 68px | 64px (optimized) |
| **Icon Spacing** | 2px top margin | 1px top margin (tighter) |
| **Label Spacing** | 4px gap | 3px gap (refined) |
| **Letter Spacing** | 0.2px | 0.3px (improved readability) |
| **Shadow** | Basic | Enhanced depth |
| **Keyboard Behavior** | Not specified | Auto-hide enabled |
| **Icon Design** | Generic home icon | Search icon (clearer purpose) |

---

## Success Metrics

### Quantitative
- Tab switch time: < 300ms
- Recognition time: < 500ms
- Error rate: < 2%
- One-thumb reach: 100%

### Qualitative
- Feels premium? ✓
- Instantly understandable? ✓
- Trustworthy? ✓
- Daily-use ready? ✓

---

## References & Inspiration

### UX Patterns
- Apple iOS Human Interface Guidelines
- Material Design Navigation
- Stripe mobile app clarity
- Strava sports app usability

### Design Quality
- Linear app polish
- Notion mobile simplicity
- Modern SaaS mobile patterns
- Sports-tech aesthetic (athletic, not gaming)

---

**Last Updated**: May 13, 2026  
**Design System Version**: 1.0  
**Platform**: React Native (iOS + Android)
