
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loginAsAdmin: () => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/me', {
        credentials: 'include',
      });
      if (response.ok) {
        const userData = await response.json();
        setUser({
          ...userData,
          isAdmin: userData.steamId === '76561199401459158' // Hardcoded admin check matching backend
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const loginAsAdmin = () => {
    // Deprecated: Real login is via Steam
    window.location.href = 'http://localhost:3000/api/auth/steam';
  };

  const logout = async () => {
    window.location.href = 'http://localhost:3000/api/auth/logout';
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin: !!user?.isAdmin, loginAsAdmin, logout, refreshUser: fetchUser, loading }}>
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
