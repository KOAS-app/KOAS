import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Determine the correct base URL:
// - Production/EAS build: use the configured API URL from app.config.js
// - Physical device (Expo Go): use the dev server host (your machine's LAN IP)
// - Android emulator: 10.0.2.2 maps to host machine localhost
// - iOS simulator: localhost works directly
const getBaseUrl = (): string => {
  // Use production API URL if configured (set in app.config.js extra.apiUrl)
  const prodUrl = Constants.expoConfig?.extra?.apiUrl;
  if (prodUrl) return `${prodUrl}/api`;

  const debuggerHost = Constants.expoConfig?.hostUri ?? Constants.manifest2?.extra?.expoGo?.debuggerHost;

  if (debuggerHost) {
    // Strip port from host and use backend port 5000
    const host = debuggerHost.split(':')[0];
    return `http://${host}:5000/api`;
  }

  // Fallback for emulators
  if (Platform.OS === 'android') return 'http://10.0.2.2:5000/api';
  return 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000, // Increased timeout for file uploads
  // Do NOT set headers globally - let each request handle its own
});

let logoutCallback: (() => Promise<void>) | null = null;

export const setLogoutCallback = (cb: () => Promise<void>) => {
  logoutCallback = cb;
};

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  
  // For FormData uploads, ensure proper Content-Type handling
  // Don't manually set Content-Type for multipart/form-data - axios will add boundary
  if (config.data instanceof FormData) {
    // Delete any manually set Content-Type to let axios handle it
    delete config.headers['Content-Type'];
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      if (logoutCallback) {
        await logoutCallback();
      } else {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
