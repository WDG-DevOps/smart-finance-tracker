import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      // Store hasAppLockPin flag
      const userWithPinFlag = {
        ...userData,
        appLockPin: userData.hasAppLockPin ? true : undefined
      };
      localStorage.setItem('user', JSON.stringify(userWithPinFlag));
      setUser(userWithPinFlag);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  const register = async (username, email, password, fullName) => {
    try {
      const response = await authAPI.register({ username, email, password, fullName });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      // Store hasAppLockPin flag
      const userWithPinFlag = {
        ...userData,
        appLockPin: userData.hasAppLockPin ? true : undefined
      };
      localStorage.setItem('user', JSON.stringify(userWithPinFlag));
      setUser(userWithPinFlag);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const togglePrivacyMode = async () => {
    try {
      const response = await authAPI.togglePrivacyMode();
      const updatedUser = { ...user, privacyMode: response.data.privacyMode };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Failed to toggle privacy mode:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        togglePrivacyMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
