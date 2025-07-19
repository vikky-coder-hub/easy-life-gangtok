import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for stored auth token and fetch user profile
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          apiService.setToken(token);
          const response = await apiService.getProfile();
          if (response.success) {
            setUser(response.data);
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('authToken');
            apiService.setToken(null);
          }
        } catch (error) {
          console.error('Failed to load user profile:', error);
          // Token is invalid, remove it
          localStorage.removeItem('authToken');
          apiService.setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await apiService.login(email, password);
      
      if (response.success) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      } else {
        setError(response.message || 'Login failed');
        return { success: false, error: response.message || 'Login failed' };
      }
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const loginWithOTP = async (phone, otp) => {
    try {
      setError(null);
      const response = await apiService.loginWithOTP(phone, otp);
      
      if (response.success) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      } else {
        setError(response.message || 'OTP login failed');
        return { success: false, error: response.message || 'OTP login failed' };
      }
    } catch (error) {
      const errorMessage = error.message || 'OTP login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const sendOTP = async (phone) => {
    try {
      setError(null);
      const response = await apiService.sendOTP(phone);
      return { success: response.success, message: response.message };
    } catch (error) {
      const errorMessage = error.message || 'Failed to send OTP';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const verifyOTP = async (phone, otp) => {
    try {
      setError(null);
      const response = await apiService.verifyOTP(phone, otp);
      return { success: response.success, message: response.message };
    } catch (error) {
      const errorMessage = error.message || 'OTP verification failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signup = async (userData) => {
    try {
      setError(null);
      const response = await apiService.signup(userData);
      
      if (response.success) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      } else {
        setError(response.message || 'Signup failed');
        return { success: false, error: response.message || 'Signup failed' };
      }
    } catch (error) {
      const errorMessage = error.message || 'Signup failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('authToken');
    }
  };

  const updateProfile = async (updates, profileImage = null) => {
    try {
      setError(null);
      const response = await apiService.updateProfile(updates, profileImage);
      
      if (response.success) {
        setUser(response.data);
        return { success: true, user: response.data };
      } else {
        setError(response.message || 'Profile update failed');
        return { success: false, error: response.message || 'Profile update failed' };
      }
    } catch (error) {
      const errorMessage = error.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const uploadProfileImage = async (imageFile) => {
    try {
      setError(null);
      const response = await apiService.uploadProfileImage(imageFile);
      
      if (response.success) {
        setUser(response.data);
        return { success: true, user: response.data };
      } else {
        setError(response.message || 'Image upload failed');
        return { success: false, error: response.message || 'Image upload failed' };
      }
    } catch (error) {
      const errorMessage = error.message || 'Image upload failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    user,
    login,
    loginWithOTP,
    sendOTP,
    verifyOTP,
    signup,
    logout,
    updateProfile,
    uploadProfileImage,
    loading,
    error,
    setError,
    isAuthenticated: !!user,
    isCustomer: user?.userType === 'customer',
    isSeller: user?.userType === 'seller',
    isAdmin: user?.userType === 'admin',
    // Legacy support for existing frontend code
    isBusinessPartner: user?.userType === 'seller'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};