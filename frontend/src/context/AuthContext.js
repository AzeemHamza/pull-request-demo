import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    return () => axios.interceptors.request.eject(interceptor);
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      enqueueSnackbar(`Welcome back, ${userData.username}!`, { variant: 'success' });
      return userData;
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed';
      enqueueSnackbar(msg, { variant: 'error' });
      throw err;
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await axios.post('/api/auth/register', { username, email, password });
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      enqueueSnackbar('Registration successful!', { variant: 'success' });
      return userData;
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed';
      enqueueSnackbar(msg, { variant: 'error' });
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    enqueueSnackbar('Logged out', { variant: 'info' });
  };

  const updateProfile = async (data) => {
    const res = await axios.put('/api/auth/profile', data);
    setUser(prev => ({ ...prev, ...res.data }));
    enqueueSnackbar('Profile updated', { variant: 'success' });
  };

  const changePassword = async (currentPassword, newPassword) => {
    await axios.put('/api/auth/password', { currentPassword, newPassword });
    enqueueSnackbar('Password changed', { variant: 'success' });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};