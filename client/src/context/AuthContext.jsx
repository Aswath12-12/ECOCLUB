import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ecoclub_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify authentication on app launch
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('ecoclub_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await authService.getMe();
        if (res.success && res.data.user) {
          setUser(res.data.user);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Session restoration failed:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (identifier, password) => {
    const res = await authService.login({ identifier, password });
    if (res.success && res.data.token) {
      const authToken = res.data.token;
      const authUser = res.data.user;

      localStorage.setItem('ecoclub_token', authToken);
      localStorage.setItem('ecoclub_user', JSON.stringify(authUser));

      setToken(authToken);
      setUser(authUser);
      return authUser;
    }
    throw new Error(res.message || 'Login failed');
  };

  const logout = () => {
    localStorage.removeItem('ecoclub_token');
    localStorage.removeItem('ecoclub_user');
    setToken(null);
    setUser(null);
  };

  const changePassword = async (currentPassword, newPassword) => {
    const res = await authService.changePassword({ currentPassword, newPassword });
    if (res.success) {
      if (user) {
        const updatedUser = { ...user, mustChangePassword: false };
        setUser(updatedUser);
        localStorage.setItem('ecoclub_user', JSON.stringify(updatedUser));
      }
      return res;
    }
    throw new Error(res.message || 'Password update failed');
  };

  const updateUser = (fields) => {
    setUser((prev) => {
      const updated = { ...prev, ...fields };
      localStorage.setItem('ecoclub_user', JSON.stringify(updated));
      return updated;
    });
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    role: user?.role || null,
    mustChangePassword: user?.mustChangePassword || false,
    login,
    logout,
    changePassword,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
