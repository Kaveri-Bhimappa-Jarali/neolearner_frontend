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
    localStorage.setItem('access_token', token);
    const userRes = await api.get('/learners/me');
    setUser(userRes.data);
    return userRes.data;
  };

  const register = async (userData) => {
    const normalizedUserData = {
      ...userData,
      email: userData.email.trim().toLowerCase()
    };
    const regRes = await api.post('/auth/register', normalizedUserData);
    return regRes;
  };

  const googleLogin = async (googlePayload) => {
    const res = await api.post('/auth/google', googlePayload);
    const token = res.data.access_token;
    localStorage.setItem('access_token', token);
    const userRes = await api.get('/learners/me');
    setUser(userRes.data);
    return { user: userRes.data, needsOnboarding: res.data.needs_onboarding };
  };

  const verifyEmail = async (email, code, password = '') => {
    const res = await api.post('/auth/verify-email', { email: email.trim().toLowerCase(), code: code.trim() });
    if (res.data?.access_token) {
      const token = res.data.access_token;
      localStorage.setItem('access_token', token);
      const userRes = await api.get('/learners/me');
      setUser(userRes.data);
    } else if (password) {
      try {
        await login(email, password);
      } catch (e) {
        console.warn('Auto-login after email verification failed:', e);
      }
    }
    return res;
  };

  const resendCode = async (email) => {
    return await api.post('/auth/resend-code', { email });
  };

  const resetPassword = async (email, newPassword) => {
    const res = await api.post('/auth/reset-password', {
      email: email.trim().toLowerCase(),
      new_password: newPassword
    });
    const token = res.data.access_token;
    localStorage.setItem('access_token', token);
    const userRes = await api.get('/learners/me');
    setUser(userRes.data);
    return userRes.data;
  };

  const updateInterfaceLanguage = async (langCode) => {
    localStorage.setItem('preferred_language_code', langCode);
    localStorage.setItem('interface_lang', langCode);
    window.dispatchEvent(new Event('language-change'));
    
    if (user) {
      try {
        const resL = await api.get('/languages/');
        const list = Array.isArray(resL.data) ? resL.data : (resL.data?.languages || []);
        const targetLangObj = list.find(l => l.code === langCode);
        if (targetLangObj) {
          const res = await api.put('/learners/me', { preferred_language_id: targetLangObj.id });
          setUser(res.data);
        } else {
          setUser(prev => prev ? { ...prev, preferred_language_code: langCode, preferred_language: { ...(prev.preferred_language || {}), code: langCode } } : null);
        }
      } catch (e) {
        setUser(prev => prev ? { ...prev, preferred_language_code: langCode, preferred_language: { ...(prev.preferred_language || {}), code: langCode } } : null);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, googleLogin, verifyEmail, resendCode, resetPassword, updateInterfaceLanguage, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
