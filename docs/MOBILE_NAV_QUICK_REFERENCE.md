# Mobile Bottom Navigation - Quick Reference

## Installation

```bash
cd mobile-app
npm install
npx expo install react-native-svg
```

## Tab Structure

| # | Label | Icon | Purpose |
|---|-------|------|---------|
| 1 | Explore | Home/Building | Browse stadiums |
| 2 | Bookings | Calendar | Manage bookings |
| 3 | Profile | User | Account settings |

## Design Tokens

### Colors
```typescript
Background:     '#0A1810'
Border:         'rgba(61, 181, 74, 0.08)'
Active:         '#3DB54A'
Inactive:       'rgba(255, 255, 255, 0.5)'
```

### Spacing
```typescript
Height (iOS):   88px (60px + 28px safe area)
Height (Android): 68px (60px + 8px padding)
Padding Top:    8px
Padding Bottom: 28px (iOS) / 12px (Android)
Padding Horizontal: 8px
```

### Typography
```typescript
Font Size:      11px
Font Weight:    600
Letter Spacing: 0.2px
Margin Top:     4px (below icon)
```

### Icons
```typescript
Size:           24x24px
Stroke Width:   2px (inactive) / 2.5px (active)
Fill Opacity:   0% (inactive) / 12% (active)
```

## Touch Targets

```
Minimum:        44x44px (iOS HIG)
Effective:      48-52px per tab
Spacing:        8px between tabs
```

## Platform Differences

### iOS
- Height: 88px (includes safe area)
- Bottom padding: 28px (home indicator)
- Shadow: Yes (subtle elevation)

### Android
- Height: 68px
- Bottom padding: 12px
- Shadow: No (elevation: 0)

## Icon Components

```typescript
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

const HomeIcon = ({ color, focused }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
      stroke={color}
      strokeWidth={focused ? 2.5 : 2}
      fill={focused ? color : 'none'}
      fillOpacity={focused ? 0.12 : 0}
    />
  </Svg>
);
```

## Navigation Config

```typescript
<Tab.Navigator
  screenOptions={{
    tabBarActiveTintColor: colors.accent,
    tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
    tabBarStyle: {
      backgroundColor: '#0A1810',
      borderTopWidth: 1,
      borderTopColor: 'rgba(61, 181, 74, 0.08)',
      height: Platform.OS === 'ios' ? 88 : 68,
      paddingTop: spacing.sm,
      paddingBottom: Platform.OS === 'ios' ? 28 : spacing.md,
    },
  }}
>
```

## States

### Active Tab
- Color: #3DB54A
- Stroke: 2.5px
- Fill: 12% opacity
- Label: Same color

### Inactive Tab
- Color: rgba(255, 255, 255, 0.5)
- Stroke: 2px
- Fill: None
- Label: Same color

## Accessibility

✅ Touch targets: 44px+ minimum
✅ Color contrast: WCAG AA compliant
✅ Labels: Always visible
✅ VoiceOver/TalkBack: Supported

## Testing Commands

```bash
# Start dev server
npm start

# Test on iOS
npm run ios

# Test on Android
npm run android

# Clear cache
npx expo start -c
```

## Common Issues

### SVG not rendering
```bash
npx expo install react-native-svg
```

### Safe area issues
- Check `react-native-safe-area-context` is installed
- Verify platform-specific padding values

### Icons not showing
- Ensure SVG imports are correct
- Check viewBox dimensions (24x24)
- Verify stroke/fill properties

## File Locations

```
mobile-app/
├── src/
│   ├── navigation/
│   │   └── AppNavigator.tsx    # Navigation setup + icons
│   └── theme.ts                # Design tokens
├── package.json                # Dependencies
└── SETUP.md                    # Full setup guide
```

## Design Philosophy

**One-thumb usability** → All tabs within thumb reach
**Instant recognition** → Clear visual hierarchy
**Fast scanning** → Minimal cognitive load
**Premium feel** → Production-grade polish
**Mobile-native** → Platform-specific optimizations

## Key Metrics

- **3 tabs** (not 5+) - Reduces cognitive load
- **11px labels** - Readable but compact
- **24px icons** - Optimal for mobile
- **88px height (iOS)** - Includes safe area
- **44px+ touch targets** - Accessibility standard
- **0.2px letter spacing** - Improved legibility

## Quick Comparison

| Aspect | Before | After |
|--------|--------|-------|
| Icons | Emojis | SVG |
| Background | Light | Dark |
| Height | 60px | 88px/68px |
| Safe Area | ❌ | ✅ |
| Label | "Home" | "Explore" |

---

**Full Documentation:** See `MOBILE_NAVIGATION_REDESIGN.md`
