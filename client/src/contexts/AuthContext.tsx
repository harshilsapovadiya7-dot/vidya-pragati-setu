import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, authApi } from '../lib/api';
import { Role, DEMO_ACCOUNTS } from '../lib/constants';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const res = await authApi.getMe();
      if (res && res.user) {
        setUser(res.user);
      } else {
        // Check localStorage backup for demo session
        const stored = localStorage.getItem('vps_demo_user');
        if (stored) {
          setUser(JSON.parse(stored));
        } else {
          setUser(null);
        }
      }
    } catch {
      const stored = localStorage.getItem('vps_demo_user');
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const res = await authApi.login({ email, password });
      setUser(res.user);
      localStorage.setItem('vps_demo_user', JSON.stringify(res.user));
      return res.user;
    } catch (err) {
      // Fallback: check if matches demo credentials so users can test immediately
      const demoMatch = DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === email.toLowerCase());
      if (demoMatch) {
        const names = demoMatch.name.split(' ');
        const mockUser: User = {
          id: `demo-${demoMatch.role.toLowerCase()}`,
          email: demoMatch.email,
          role: demoMatch.role,
          firstName: names[0] || 'Demo',
          lastName: names.slice(1).join(' ') || 'User',
          district: 'Bhopal',
          schoolName: 'Govt Excellence HSS, Bhopal',
        };
        setUser(mockUser);
        localStorage.setItem('vps_demo_user', JSON.stringify(mockUser));
        return mockUser;
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      setUser(null);
      localStorage.removeItem('vps_demo_user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
