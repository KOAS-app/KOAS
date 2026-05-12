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

// Premium SVG Icons (24x24)
const HomeIcon = ({ color, focused }: { color: string; focused: boolean }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
      stroke={color}
      strokeWidth={focused ? 2.5 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={focused ? color : 'none'}
      fillOpacity={focused ? 0.12 : 0}
    />
    <Path
      d="M9 22V12h6v10"
      stroke={color}
      strokeWidth={focused ? 2.5 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
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
      strokeWidth={focused ? 2.5 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={focused ? color : 'none'}
      fillOpacity={focused ? 0.12 : 0}
    />
    <Line
      x1="16"
      y1="2"
      x2="16"
      y2="6"
      stroke={color}
      strokeWidth={focused ? 2.5 : 2}
      strokeLinecap="round"
    />
    <Line
      x1="8"
      y1="2"
      x2="8"
      y2="6"
      stroke={color}
      strokeWidth={focused ? 2.5 : 2}
      strokeLinecap="round"
    />
    <Line
      x1="3"
      y1="10"
      x2="21"
      y2="10"
      stroke={color}
      strokeWidth={focused ? 2.5 : 2}
      strokeLinecap="round"
    />
  </Svg>
);

const ProfileIcon = ({ color, focused }: { color: string; focused: boolean }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Circle
      cx="12"
      cy="8"
      r="4"
      stroke={color}
      strokeWidth={focused ? 2.5 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={focused ? color : 'none'}
      fillOpacity={focused ? 0.12 : 0}
    />
    <Path
      d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"
      stroke={color}
      strokeWidth={focused ? 2.5 : 2}
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
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
        tabBarStyle: {
          backgroundColor: '#0A1810',
          borderTopWidth: 1,
          borderTopColor: 'rgba(61, 181, 74, 0.08)',
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingTop: spacing.sm,
          paddingBottom: Platform.OS === 'ios' ? 28 : spacing.md,
          paddingHorizontal: spacing.sm,
          elevation: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
          letterSpacing: 0.2,
          fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
        },
        tabBarItemStyle: {
          paddingVertical: spacing.xs,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ marginTop: 2 }}>
              <HomeIcon color={color} focused={focused} />
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
            <View style={{ marginTop: 2 }}>
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
            <View style={{ marginTop: 2 }}>
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
