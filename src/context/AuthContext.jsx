import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const res = await api.get('/learners/me');
          setUser(res.data);
        } catch (error) {
          localStorage.removeItem('access_token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email.trim().toLowerCase());
    formData.append('password', password);
    
    const res = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    const token = res.data.access_token;
    const userRes = await api.get('/learners/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    localStorage.setItem('access_token', token);
    setUser(userRes.data);
    return userRes.data;
  };

  const register = async (userData) => {
    const normalizedUserData = {
      ...userData,
      email: userData.email.trim().toLowerCase()
    };
    await api.post('/auth/register', normalizedUserData);
    await login(normalizedUserData.email, normalizedUserData.password);
  };

  const googleLogin = async (googlePayload) => {
    const res = await api.post('/auth/google', googlePayload);
    const token = res.data.access_token;
    localStorage.setItem('access_token', token);
    const userRes = await api.get('/learners/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setUser(userRes.data);
    return { user: userRes.data, needsOnboarding: res.data.needs_onboarding };
  };

  const verifyEmail = async (email, code) => {
    return await api.post('/auth/verify-email', { email, code });
  };

  const resendCode = async (email) => {
    return await api.post('/auth/resend-code', { email });
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, googleLogin, verifyEmail, resendCode, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
