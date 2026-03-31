'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isMounted: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultValue: AuthContextType = {
  isLoggedIn: false,
  login: async () => false,
  logout: () => {},
  isMounted: false,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Hidratar desde sessionStorage
    const saved = sessionStorage.getItem('adminLoggedIn');
    if (saved === 'true') {
      setIsLoggedIn(true);
    }
    setIsMounted(true);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        return false;
      }

      setIsLoggedIn(true);
      sessionStorage.setItem('adminLoggedIn', 'true');
      return true;
    } catch {
      return false;
    }
  };

  const logout = (): void => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('adminLoggedIn');
    void fetch('/api/admin/logout', { method: 'POST' });
  };

  const value: AuthContextType = {
    isLoggedIn,
    login,
    logout,
    isMounted,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
