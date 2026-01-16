import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token and handle FormData
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // For FormData (file uploads), let axios set the Content-Type automatically
    // This is important because axios needs to set the multipart boundary
    if (config.data instanceof FormData) {
      // Remove Content-Type to let browser set it with boundary
      delete config.headers['Content-Type'];
      // Also check common header variations
      if (config.headers.common) {
        delete config.headers.common['Content-Type'];
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper to clear auth state
const clearAuthState = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('auth-storage');
};

// Response interceptor - Handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't try to refresh token for auth endpoints (login, register, etc.)
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/');

    // For auth endpoints, just reject the error immediately (no redirect, no refresh attempt)
    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    // If 401, not an auth endpoint, and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          // No refresh token, clear auth state but don't redirect
          // Let the ProtectedRoute component handle the redirect
          clearAuthState();
          return Promise.reject(error);
        }

        // Call refresh token endpoint
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        // Backend returns { data: { accessToken, refreshToken } } directly
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        // Store new tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear auth state
        clearAuthState();

        // Don't redirect here - let ProtectedRoute component handle redirects
        // This prevents auto-redirect from public pages when tokens expire
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      // User doesn't have permission
      console.error('Access forbidden');
    }

    // Handle network errors
    if (!error.response) {
      error.message = 'Network error. Please check your connection.';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
