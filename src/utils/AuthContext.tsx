import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from './apiConfig';

interface AuthContextType {
  isAdmin: boolean;
  login: (token: string) => void;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_token');
    }
    return null;
  });

  const [isAdmin, setIsAdmin] = useState(!!token);

  const login = (newToken: string) => {
    setToken(newToken);
    setIsAdmin(true);
    localStorage.setItem('admin_token', newToken);
  };

  const logout = () => {
    setToken(null);
    setIsAdmin(false);
    localStorage.removeItem('admin_token');
  };

  useEffect(() => {
    if (token) {
      // Verify token on load
      fetch(`${API_BASE_URL}/api/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (!res.ok) logout();
      })
      .catch(() => logout());
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
