import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  linkedinEmail?: string;
  linkedinPassword?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string, linkedinEmail: string, linkedinPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
    linkedinEmail?: string;
    linkedinPassword?: string;
  }) => Promise<void>;
}

const API_URL = 'http://localhost:5001/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch(`${API_URL}/users/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            localStorage.removeItem('token');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const register = async (email: string, password: string, firstName: string, lastName: string, linkedinEmail: string, linkedinPassword: string) => {
    try {
      console.log('Attempting registration with data:', { email, firstName, lastName, linkedinEmail });
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, firstName, lastName, linkedinEmail, linkedinPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Registration failed:', errorData);
        throw new Error(errorData.error || 'Registration failed');
      }

      const data = await response.json();
      console.log('Registration successful:', data);
      localStorage.setItem('token', data.token);
      setUser(data.user);
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('An unexpected error occurred during registration');
    }
  };

  const updateProfile = async (data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
    linkedinEmail?: string;
    linkedinPassword?: string;
  }) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    try {
      console.log('Sending profile update request:', data);
      const response = await axios.put(`${API_URL}/users/profile`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Profile update response:', response.data);
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Profile update error:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to update profile');
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${API_URL}/users/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
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
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 