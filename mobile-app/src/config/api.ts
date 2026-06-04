import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Determine the correct base URL for API and static assets
const getBaseUrl = (): string => {
  // Check if this is a standalone build (APK/IPA) vs Expo Go
  const isStandaloneBuild = Constants.executionEnvironment === 'standalone' || 
                             Constants.executionEnvironment === 'storeClient';
  
  // Use production API URL for standalone builds (APK/IPA)
  const prodUrl = Constants.expoConfig?.extra?.apiUrl;
  if (isStandaloneBuild && prodUrl) {
    console.log('📱 Using production API:', prodUrl);
    return prodUrl;
  }

  // For Expo Go / development, auto-detect local backend
  const debuggerHost = Constants.expoConfig?.hostUri ?? Constants.manifest2?.extra?.expoGo?.debuggerHost;

  if (debuggerHost) {
    // Strip port from host and use backend port 5000
    const host = debuggerHost.split(':')[0];
    const localUrl = `http://${host}:5000`;
    console.log('🔧 Using local backend:', localUrl);
    return localUrl;
  }

  // Fallback for emulators (development)
  if (Platform.OS === 'android') {
    console.log('🤖 Using Android emulator fallback: http://10.0.2.2:5000');
    return 'http://10.0.2.2:5000';
  }
  
  console.log('🍎 Using iOS simulator fallback: http://localhost:5000');
  return 'http://localhost:5000';
};

export const API_BASE_URL = getBaseUrl();
export const API_URL = `${API_BASE_URL}/api`;
