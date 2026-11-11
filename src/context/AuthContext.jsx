import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AuthContext } from './contextObjects';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('dg_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('dg_auth_token') || null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'

  // Verify and hydrate current user from backend on initial mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('dg_auth_token');
      if (storedToken) {
        try {
          const res = await api.auth.getMe();
          if (res?.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('dg_user', JSON.stringify(res.data.user));
          }
        } catch {
          // If token invalid/expired, clean up
          localStorage.removeItem('dg_auth_token');
          localStorage.removeItem('dg_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    if (res.data?.token && res.data?.user) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('dg_auth_token', res.data.token);
      localStorage.setItem('dg_user', JSON.stringify(res.data.user));
      setAuthModalOpen(false);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.auth.register(userData);
    if (res.data?.token && res.data?.user) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('dg_auth_token', res.data.token);
      localStorage.setItem('dg_user', JSON.stringify(res.data.user));
      setAuthModalOpen(false);
    }
    return res;
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.warn('Logout warning:', err.message);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('dg_auth_token');
      localStorage.removeItem('dg_user');
    }
  };

  const openAuth = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuth = () => {
    setAuthModalOpen(false);
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('dg_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        authModalOpen,
        authModalMode,
        openAuth,
        closeAuth,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
