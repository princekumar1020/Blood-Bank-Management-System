import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(sessionStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = sessionStorage.getItem('token');
    const storedUser = sessionStorage.getItem('user');
    const storedUserId = sessionStorage.getItem('userId');
    const storedUserRole = sessionStorage.getItem('userRole');
    if (storedToken) {
      setToken(storedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else if (storedUserId) {
        setUser({ id: storedUserId, role: storedUserRole || null });
      }
    }
    setLoading(false);

    // Add a response interceptor to handle 401 errors globally
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          logout();
          navigate('/auth', { replace: true });
        }
        return Promise.reject(error);
      }
    );

    // Cleanup the interceptor when the component unmounts
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  const login = (userData) => {
    const sessionUser = userData.user || (userData.userId ? { id: userData.userId, role: userData.role } : null);
    sessionStorage.setItem('token', userData.token);
    if (sessionUser) {
      sessionStorage.setItem('user', JSON.stringify(sessionUser));
    }
    if (userData.userId) {
      sessionStorage.setItem('userId', userData.userId);
    }
    if (userData.role) {
      sessionStorage.setItem('userRole', userData.role);
    }
    setToken(userData.token);
    setUser(sessionUser);
    axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userRole');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = { user, token, isAuthenticated: !!token, login, logout, loading };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};