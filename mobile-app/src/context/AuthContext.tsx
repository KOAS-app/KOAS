import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../types';
import api, { setLogoutCallback } from '../api/axios';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  const login = async (userData: User, token: string) => {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  useEffect(() => {
    const restore = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');
        if (storedToken && storedUser) {
          // Set the cached user first for instant UX
          setUser(JSON.parse(storedUser) as User);
          
          // Verify token validity with backend in the background
          try {
            const res = await api.get('/auth/me');
            const updatedUser = res.data as User;
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
          } catch (err: any) {
            console.error('Mobile startup session verification failed:', err);
            if (err.response && err.response.status === 401) {
              await logout();
            }
          }
        }
      } catch (err) {
        console.error('Failed to restore mobile session:', err);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  useEffect(() => {
    setLogoutCallback(logout);
    return () => {
      setLogoutCallback(async () => {});
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
