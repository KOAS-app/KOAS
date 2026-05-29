import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Determine the correct base URL for API and static assets
const getBaseUrl = (): string => {
  // Use production API URL if configured (set in app.config.js extra.apiUrl)
  const prodUrl = Constants.expoConfig?.extra?.apiUrl;
  if (prodUrl) return prodUrl;

  const debuggerHost = Constants.expoConfig?.hostUri ?? Constants.manifest2?.extra?.expoGo?.debuggerHost;

  if (debuggerHost) {
    // Strip port from host and use backend port 5000
    const host = debuggerHost.split(':')[0];
    return `http://${host}:5000`;
  }

  // Fallback for emulators
  if (Platform.OS === 'android') return 'http://10.0.2.2:5000';
  return 'http://localhost:5000';
};

export const API_BASE_URL = getBaseUrl();
export const API_URL = `${API_BASE_URL}/api`;
