import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session/token
    const checkAuth = async () => {
      try {
        // In a real app, you would verify the token with your backend
        const token = localStorage.getItem('token');
        if (token) {
          // Mock user data - replace with actual API call
          setUser({
            id: '1',
            email: 'user@example.com',
            firstName: 'John',
            lastName: 'Doe',
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // In a real app, you would make an API call to your backend
      // This is a mock implementation
      if (email && password) {
        const token = 'mock-token';
        localStorage.setItem('token', token);
        setUser({
          id: '1',
          email,
          firstName: 'John',
          lastName: 'Doe',
        });
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      // In a real app, you would make an API call to your backend
      // This is a mock implementation
      const token = 'mock-token';
      localStorage.setItem('token', token);
      setUser({
        id: '1',
        email,
        firstName,
        lastName,
      });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // In a real app, you would make an API call to your backend
      localStorage.removeItem('token');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 