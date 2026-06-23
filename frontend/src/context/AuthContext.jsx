import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { verifyToken } from '../services/api';

const AuthContext = createContext(null);

const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes in ms

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const inactivityTimer = useRef(null);

  const logout = useCallback(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminLoginTime');
    setAdmin(null);
    clearTimeout(inactivityTimer.current);
  }, []);

  const resetInactivityTimer = useCallback(() => {
    clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      logout();
      // Redirect to login with session expired message
      if (window.location.pathname.startsWith('/admin') &&
          window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login?expired=1';
      }
    }, INACTIVITY_LIMIT);
  }, [logout]);

  // Attach activity listeners when admin is logged in
  useEffect(() => {
    if (!admin) return;

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((e) => window.addEventListener(e, resetInactivityTimer, { passive: true }));
    resetInactivityTimer(); // start the timer immediately on login

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetInactivityTimer));
      clearTimeout(inactivityTimer.current);
    };
  }, [admin, resetInactivityTimer]);

  // On mount — verify existing token and check session age
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const loginTime = localStorage.getItem('adminLoginTime');

    if (token) {
      // If session is older than 8 hours, force logout regardless of activity
      const SESSION_MAX = 8 * 60 * 60 * 1000;
      if (loginTime && Date.now() - parseInt(loginTime) > SESSION_MAX) {
        logout();
        setLoading(false);
        return;
      }

      verifyToken()
        .then((res) => setAdmin(res.data.admin))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, adminData) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminLoginTime', Date.now().toString());
    setAdmin(adminData);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);