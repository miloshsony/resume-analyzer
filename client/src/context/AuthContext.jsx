import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Configure axios base defaults
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
axios.defaults.baseURL = API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize and check localStorage for existing session
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          // Set dynamic token for all Axios calls
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          console.log('Session restored for:', parsedUser.email);
        } catch (e) {
          console.error('Failed to parse stored user session data:', e);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Clear current error states
  const clearError = () => setAuthError(null);

  // Register Handler
  const registerUser = async (name, email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await axios.post('/api/auth/register', { name, email, password });
      const { token, user: newUser } = response.data;

      // Save credentials in client storage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));

      // Hook token into standard axios calls
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(newUser);
      console.log('Register successful for:', newUser.email);
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration API Error:', error);
      const errMsg = error.response?.data?.message || 'Failed to complete registration';
      setAuthError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Login Handler
  const loginUser = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user: loggedUser } = response.data;

      // Save credentials
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(loggedUser));

      // Hook token into axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(loggedUser);
      console.log('Login successful for:', loggedUser.email);
      return { success: true, user: loggedUser };
    } catch (error) {
      console.error('Login API Error:', error);
      const errMsg = error.response?.data?.message || 'Invalid email or password';
      setAuthError(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Logout Handler
  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    console.log('Session terminated. Logged out.');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        registerUser,
        loginUser,
        logoutUser,
        clearError,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be invoked within an AuthProvider context wrapper');
  }
  return context;
};
