# KOAS Mobile App Setup

## Prerequisites
- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator

## Installation

### 1. Install Dependencies
```bash
cd mobile-app
npm install
```

### 2. Install Required Packages
```bash
# For premium auth gradients
npx expo install expo-linear-gradient

# For premium SVG icons (bottom navigation)
npx expo install react-native-svg
```

### 3. Configure API Endpoint
Update `src/api/axios.ts` with your backend URL (default: `http://localhost:5000/api`)

### 4. Start Development Server
```bash
npm start
```

## Running the App

### iOS
```bash
npm run ios
```

### Android
```bash
npm run android
```

### Web (Limited Functionality)
```bash
npm run web
```

## Premium UI/UX Features

### Bottom Navigation System
The app features a production-grade bottom navigation with:
- **3 core tabs** optimized for one-thumb usage
- **Premium dark mode** design (#0A1810 background)
- **SVG icons** with subtle fill on active state
- **Optimized spacing** for mobile ergonomics (44px+ touch targets)
- **Platform-specific heights** (iOS: 88px with safe area, Android: 68px)
- **Accent color** (#3DB54A) for active states
- **Smooth transitions** without excessive animations

**Navigation Structure:**
1. **Explore** (Home) - Browse and discover stadiums
2. **Bookings** - View and manage your bookings
3. **Profile** - Account settings and logout

### Authentication Screens
- Premium dark mode with gradient backgrounds
- Elevated cards with backdrop blur effect
- Trust badges and loading states
- Requires `expo-linear-gradient` package

### Design System
- **Font:** Inter (system fallback)
- **Primary Color:** #0D4A1F (Forest Green)
- **Accent Color:** #3DB54A (Grass Green)
- **Dark Surfaces:** #0A1810, #111D17
- **Spacing Scale:** 4px-48px
- **Border Radius:** 6px-16px

## Project Structure

```
mobile-app/
├── src/
│   ├── api/           # API configuration (axios)
│   ├── context/       # Auth context provider
│   ├── navigation/    # Navigation setup (bottom tabs, stack)
│   ├── screens/       # Screen components
│   ├── types/         # TypeScript types
│   ├── utils/         # Utility functions
│   └── theme.ts       # Design tokens
├── assets/            # Images and icons
├── App.tsx            # Root component
└── index.ts           # Entry point
```

## Key Screens

### HomeScreen (Explore Tab)
- Stadium discovery with pull-to-refresh
- Premium card design with shadows
- Empty states and error handling
- Navigation to stadium details

### BookingsScreen
- User's booking history
- Status badges (PENDING, CONFIRMED, CANCELLED)
- Payment status indicators
- Cancel booking functionality

### ProfileScreen
- User information display
- Logout functionality
- Role badge (PLAYER)

### StadiumDetailScreen
- Stadium information
- Available time slots
- Booking creation

## Authentication Flow

1. User opens app → sees Login/Register screens
2. After login → JWT token stored in AsyncStorage
3. Token included in all API requests via axios interceptor
4. Logout → token cleared, redirected to auth screens

## API Integration

Base URL configured in `src/api/axios.ts`:
- Auth: `/auth/login`, `/auth/register`
- Stadiums: `/stadiums`, `/stadiums/:id`
- Bookings: `/bookings/my`, `/bookings/:id/cancel`
- Slots: `/stadiums/:id/slots`

## Dependencies

### Core
- React Native 0.81.5
- Expo SDK 54
- React Navigation 7.x
- TypeScript 5.9.2

### UI & Graphics
- `expo-linear-gradient` - Premium gradient backgrounds
- `react-native-svg` - SVG icon rendering

### State Management
- React Context API (AuthContext)

### API & Storage
- Axios - HTTP requests
- AsyncStorage - Token persistence

## Troubleshooting

### "expo-linear-gradient" not found
```bash
npx expo install expo-linear-gradient
```

### "react-native-svg" not found
```bash
npx expo install react-native-svg
```

### Navigation not working
- Ensure all navigation packages are installed
- Clear cache: `npx expo start -c`

### Metro Bundler Issues
```bash
npx expo start --clear
```

### iOS Simulator Issues
```bash
npx expo run:ios --clean
```

### Android Emulator Issues
```bash
npx expo run:android --clean
```

### API connection issues
- Check backend is running on correct port
- Update API URL in `src/api/axios.ts`
- Check network permissions

## Development Notes

- Use `expo start` for development with hot reload
- Test on both iOS and Android for platform-specific issues
- Bottom navigation uses platform-specific safe area handling
- All icons are SVG-based for crisp rendering on all screen densities
- Design system uses consistent spacing and color tokens from `theme.ts`

## Production Considerations

- Update API base URL for production environment
- Configure app icons and splash screens in `app.json`
- Test on physical devices for real-world performance
- Optimize images and assets
- Enable error tracking (Sentry, etc.)
- Configure push notifications if needed

## Design Philosophy

The mobile app follows these principles:
- **One-thumb usability** - All primary actions within thumb reach
- **Instant recognition** - Clear visual hierarchy and labeling
- **Fast scanning** - Minimal cognitive load
- **Premium feel** - Production-grade polish without overdesign
- **Mobile-native** - Platform-specific optimizations
- **Sports-tech identity** - Athletic, modern, trustworthy aesthetic
