import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'player' | 'guest';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const response = await authAPI.login({ email, password });
    const { user: userData, token: authToken } = response.data;

    setUser(userData);
    setToken(authToken);

    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const register = async (username: string, email: string, password: string): Promise<void> => {
    const response = await authAPI.register({ username, email, password });
    const { user: userData, token: authToken } = response.data;

    setUser(userData);
    setToken(authToken);

    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);

    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (updatedUser: User): void => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isLoading,
    login,
    register,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
