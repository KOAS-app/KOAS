import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../api/axios';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (userData: AdminUser, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    const stored = localStorage.getItem('admin_user');
    return stored ? (JSON.parse(stored) as AdminUser) : null;
  });

  const [loading, setLoading] = useState(() => {
    // If there is an admin token, verify it first on app start
    return !!localStorage.getItem('admin_token');
  });

  const login = (userData: AdminUser, token: string) => {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setUser(null);
  };

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        const updatedUser = res.data as AdminUser;
        localStorage.setItem('admin_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } catch (err) {
        console.error('Admin session verification failed on startup:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };
    verifySession();
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
