import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'student' | 'instructor' | 'admin';
  date_joined: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authAPI.getProfile();
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setError(null);
      await authAPI.login(username, password);
      
      // Get user profile
      const profileResponse = await authAPI.getProfile();
      setUser(profileResponse.data);
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Invalid credentials');
      throw error;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await authAPI.logout();
      setUser(null);
    } catch (error: any) {
      setError(error.response?.data?.error || 'An error occurred during logout');
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      setError(null);
      await authAPI.register(data);
      // After registration, log the user in
      await login(data.username, data.password);
    } catch (error: any) {
      setError(error.response?.data?.error || 'An error occurred during registration');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        logout,
        register,
      }}
    >
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