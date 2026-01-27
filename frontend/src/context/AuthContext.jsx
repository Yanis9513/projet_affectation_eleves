import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('userRole');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedRole && storedToken) {
      setUser(JSON.parse(storedUser));
      setUserRole(storedRole);
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      // Call real API
      const response = await authAPI.login(credentials);
      const { access_token, user: userData } = response.data;

      // Save to state
      setUser(userData);
      setUserRole(userData.role);
      setIsLoggedIn(true);

      // Save to localStorage (use 'token' key to match api.js interceptor)
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userRole', userData.role);
      localStorage.setItem('token', access_token);

      // Return user data for navigation
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clear state
    setUser(null);
    setUserRole(null);
    setIsLoggedIn(false);

    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
  };

  const value = {
    user,
    isLoggedIn,
    userRole,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
