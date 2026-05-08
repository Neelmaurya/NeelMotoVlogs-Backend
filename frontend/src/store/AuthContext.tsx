'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'ADMIN' | 'CREATOR' | 'VIEWER';
  profile_image: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const token = Cookies.get('access_token');
      if (token) {
        try {
          const response = await api.get('users/me/');
          setUser(response.data);
        } catch (error) {
          console.error('Failed to fetch user', error);
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('token/', { email, password });
    const { access, refresh } = response.data;
    
    Cookies.set('access_token', access, { expires: 7 });
    Cookies.set('refresh_token', refresh, { expires: 30 });
    
    const userResponse = await api.get('users/me/');
    setUser(userResponse.data);
    router.push('/dashboard');
  };

  const logout = () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
