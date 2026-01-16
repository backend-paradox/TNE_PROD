import axiosInstance from '../../app/axios';
import { API_ENDPOINTS } from '../../utils/constants';

// ============================================
// AUTHENTICATION
// ============================================

// Login API
export const loginAPI = async (credentials) => {
  const response = await axiosInstance.post(API_ENDPOINTS.AUTH_LOGIN, credentials);
  return response.data.data;
};

// Register API
export const registerAPI = async (userData) => {
  const response = await axiosInstance.post(API_ENDPOINTS.AUTH_REGISTER, userData);
  return response.data.data;
};

// Logout API
export const logoutAPI = async (refreshToken) => {
  const response = await axiosInstance.post(API_ENDPOINTS.AUTH_LOGOUT, { refreshToken });
  return response.data;
};

// Get current user API
export const getCurrentUserAPI = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.AUTH_ME);
  return response.data.data;
};

// Refresh token API
export const refreshTokenAPI = async (refreshToken) => {
  const response = await axiosInstance.post(API_ENDPOINTS.AUTH_REFRESH, { refreshToken });
  return response.data.data;
};

// ============================================
// EMAIL VERIFICATION
// ============================================

// Verify email API
export const verifyEmailAPI = async (token) => {
  const response = await axiosInstance.post(API_ENDPOINTS.AUTH_VERIFY_EMAIL, { token });
  return response.data;
};

// Resend verification email
export const resendVerificationEmailAPI = async (email) => {
  const response = await axiosInstance.post(API_ENDPOINTS.AUTH_RESEND_VERIFICATION, { email });
  return response.data;
};

// ============================================
// PASSWORD MANAGEMENT
// ============================================

// Forgot password API
export const forgotPasswordAPI = async (email) => {
  const response = await axiosInstance.post(API_ENDPOINTS.AUTH_FORGOT_PASSWORD, { email });
  return response.data;
};

// Reset password API
export const resetPasswordAPI = async (token, newPassword) => {
  const response = await axiosInstance.post(API_ENDPOINTS.AUTH_RESET_PASSWORD, {
    token,
    newPassword,
  });
  return response.data;
};

// Change password API (authenticated)
export const changePasswordAPI = async (passwordData) => {
  const response = await axiosInstance.post(API_ENDPOINTS.AUTH_CHANGE_PASSWORD, passwordData);
  return response.data;
};

// ============================================
// TOKEN MANAGEMENT
// ============================================

// Revoke all tokens (logout from all devices)
export const revokeAllTokensAPI = async () => {
  const response = await axiosInstance.post(API_ENDPOINTS.AUTH_REVOKE_TOKENS);
  return response.data;
};

// ============================================
// TOKEN STORAGE HELPERS
// ============================================

// Store tokens in localStorage
export const storeTokens = (accessToken, refreshToken) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

// Store user data in localStorage
export const storeUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Get stored user
export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Get stored access token
export const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

// Get stored refresh token
export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

// Clear all auth data
export const clearAuthData = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('auth-storage'); // Zustand persistence
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getAccessToken();
};

// ============================================
// COMPLETE AUTH FLOW HELPERS
// ============================================

// Complete login flow
export const completeLogin = async (credentials) => {
  const data = await loginAPI(credentials);
  const { accessToken, refreshToken, user } = data;

  storeTokens(accessToken, refreshToken);
  storeUser(user);

  return { user, accessToken, refreshToken };
};

// Complete registration flow
export const completeRegistration = async (userData) => {
  const data = await registerAPI(userData);
  const { accessToken, refreshToken, user } = data;

  storeTokens(accessToken, refreshToken);
  storeUser(user);

  return { user, accessToken, refreshToken };
};

// Complete logout flow
export const completeLogout = async () => {
  try {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      await logoutAPI(refreshToken);
    }
  } catch (error) {
    console.error('Logout API error:', error);
  } finally {
    clearAuthData();
  }
};

// Initialize auth state from storage
export const initializeAuth = async () => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return null;
  }

  try {
    const user = await getCurrentUserAPI();
    storeUser(user);
    return user;
  } catch (error) {
    // Token might be expired, try to refresh
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        const data = await refreshTokenAPI(refreshToken);
        storeTokens(data.accessToken, data.refreshToken);

        const user = await getCurrentUserAPI();
        storeUser(user);
        return user;
      }
    } catch (refreshError) {
      clearAuthData();
    }
    return null;
  }
};
