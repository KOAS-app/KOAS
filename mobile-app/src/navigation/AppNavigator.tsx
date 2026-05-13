import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Platform } from 'react-native';
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import { colors, spacing } from '../theme';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import StadiumDetailScreen from '../screens/StadiumDetailScreen';
import BookingsScreen from '../screens/BookingsScreen';
import ProfileScreen from '../screens/ProfileScreen';

import type { RootStackParamList, AuthStackParamList, TabParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// ═══════════════════════════════════════════════════════════════
// Premium Bottom Tab Icons
// Optimized for one-thumb usage, instant recognition, mobile clarity
// ═══════════════════════════════════════════════════════════════

const ExploreIcon = ({ color, focused }: { color: string; focused: boolean }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Circle
      cx="11"
      cy="11"
      r="8"
      stroke={color}
      strokeWidth={focused ? 2.25 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M21 21l-4.35-4.35"
      stroke={color}
      strokeWidth={focused ? 2.25 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {focused && (
      <Circle
        cx="11"
        cy="11"
        r="3"
        fill={color}
        opacity={0.2}
      />
    )}
  </Svg>
);

const BookingsIcon = ({ color, focused }: { color: string; focused: boolean }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Rect
      x="3"
      y="4"
      width="18"
      height="18"
      rx="2"
      stroke={color}
      strokeWidth={focused ? 2.25 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line
      x1="16"
      y1="2"
      x2="16"
      y2="6"
      stroke={color}
      strokeWidth={focused ? 2.25 : 2}
      strokeLinecap="round"
    />
    <Line
      x1="8"
      y1="2"
      x2="8"
      y2="6"
      stroke={color}
      strokeWidth={focused ? 2.25 : 2}
      strokeLinecap="round"
    />
    <Line
      x1="3"
      y1="10"
      x2="21"
      y2="10"
      stroke={color}
      strokeWidth={focused ? 2.25 : 2}
      strokeLinecap="round"
    />
    {focused && (
      <Rect
        x="7"
        y="14"
        width="4"
        height="4"
        rx="1"
        fill={color}
        opacity={0.2}
      />
    )}
  </Svg>
);

const ProfileIcon = ({ color, focused }: { color: string; focused: boolean }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Circle
      cx="12"
      cy="8"
      r="4"
      stroke={color}
      strokeWidth={focused ? 2.25 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={focused ? color : 'none'}
      fillOpacity={focused ? 0.15 : 0}
    />
    <Path
      d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"
      stroke={color}
      strokeWidth={focused ? 2.25 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: {
          backgroundColor: colors.dark.surface,
          borderTopWidth: 1,
          borderTopColor: colors.dark.border,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingTop: spacing.sm,
          paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md,
          paddingHorizontal: spacing.xs,
          elevation: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 3,
          letterSpacing: 0.3,
          fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
        },
        tabBarItemStyle: {
          paddingVertical: spacing.xs,
          gap: 2,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ marginTop: 1 }}>
              <ExploreIcon color={color} focused={focused} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ marginTop: 1 }}>
              <BookingsIcon color={color} focused={focused} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ marginTop: 1 }}>
              <ProfileIcon color={color} focused={focused} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerTintColor: colors.primary }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
            <Stack.Screen
              name="StadiumDetail"
              component={StadiumDetailScreen}
              options={({ route }) => ({ title: route.params.stadiumName })}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
