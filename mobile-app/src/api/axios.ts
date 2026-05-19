import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Determine the correct base URL:
// - Physical device (Expo Go): use the dev server host (your machine's LAN IP)
// - Android emulator: 10.0.2.2 maps to host machine localhost
// - iOS simulator: localhost works directly
const getBaseUrl = (): string => {
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
  timeout: 10000,
});

let logoutCallback: (() => Promise<void>) | null = null;

export const setLogoutCallback = (cb: () => Promise<void>) => {
  logoutCallback = cb;
};

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
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
