import { createAsyncThunk, createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';
import axiosInstance from '../../app/axios';
import { getErrorMessage } from '../../utils/helpers';
import { API_ENDPOINTS } from '../../utils/constants';
import type { LoginHistoryResponse, User } from '../../types';

// Auth response type
interface AuthResponse {
  success: boolean;
  error?: string;
  isNewUser?: boolean;
  user?: User | null;
}

// OAuth Provider types
type OAuthProvider = 'GOOGLE' | 'FACEBOOK' | 'APPLE' | 'TWITTER';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
}

interface AuthTokens {
  accessToken?: string;
  refreshToken?: string;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  hasHydrated: false,
};

const extractTokens = (data: any): AuthTokens => {
  if (!data) return {};
  if (data.tokens) {
    return {
      accessToken: data.tokens.accessToken,
      refreshToken: data.tokens.refreshToken,
    };
  }
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  };
};

const persistTokens = ({ accessToken, refreshToken }: AuthTokens) => {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
  }
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
};

const persistUser = (user: User | null | undefined) => {
  if (!user) return;
  localStorage.setItem('user', JSON.stringify(user));
};

const mergeUserWithProfile = async (user: User): Promise<User> => {
  try {
    const profileResponse = await axiosInstance.get(API_ENDPOINTS.USER_PROFILE);
    const profile = profileResponse.data.data || profileResponse.data;
    if (profile) {
      return {
        ...user,
        name: profile.name || user.name,
        phone: profile.phone || user.phone,
        avatar: profile.profilePicUrl || user.avatar,
      };
    }
  } catch {
    // Profile fetch is optional; keep auth user if it fails.
  }
  return user;
};

export const login = createAsyncThunk<AuthResponse, { email: string; password: string }>(
  'auth/login',
  async ({ email, password }) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH_LOGIN, { email, password });
      const data = response.data.data || response.data;
      const { user } = data;
      const tokens = extractTokens(data);
      persistTokens(tokens);

      const mergedUser = await mergeUserWithProfile(user);
      persistUser(mergedUser);
      return { success: true, user: mergedUser };
    } catch (error) {
      const message = getErrorMessage(error, 'Invalid email or password');
      return { success: false, error: message };
    }
  }
);

export const signup = createAsyncThunk<
  AuthResponse,
  { name: string; email: string; phone: string; password: string }
>('auth/signup', async ({ name, email, phone, password }) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH_REGISTER, {
      name,
      email,
      phone,
      password,
    });
    const data = response.data.data || response.data;
    const { user } = data;
    const tokens = extractTokens(data);
    persistTokens(tokens);

    const mergedUser = await mergeUserWithProfile(user);
    persistUser(mergedUser);
    return { success: true, user: mergedUser };
  } catch (error) {
    const message = getErrorMessage(error, 'Registration failed. Please try again.');
    return { success: false, error: message };
  }
});

export const forgotPassword = createAsyncThunk<AuthResponse, { email: string }>(
  'auth/forgotPassword',
  async ({ email }) => {
    try {
      await axiosInstance.post(API_ENDPOINTS.AUTH_FORGOT_PASSWORD, { email });
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to send reset email. Please try again.');
      return { success: false, error: message };
    }
  }
);

export const resetPassword = createAsyncThunk<AuthResponse, { token: string; password: string }>(
  'auth/resetPassword',
  async ({ token, password }) => {
    try {
      await axiosInstance.post(API_ENDPOINTS.AUTH_RESET_PASSWORD, { token, newPassword: password });
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to reset password. The link may have expired.');
      return { success: false, error: message };
    }
  }
);

export const logout = createAsyncThunk<AuthResponse, void>('auth/logout', async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await axiosInstance.post(API_ENDPOINTS.AUTH_LOGOUT, { refreshToken }).catch(() => {});
    }
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('auth-storage');
    localStorage.removeItem('booking-storage');
    localStorage.removeItem('travel-wishlist');
    localStorage.removeItem('travel-wishlist-items');
  }

  return { success: true };
});

export const clearAuth = createAsyncThunk<AuthResponse, void>('auth/clearAuth', async () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('auth-storage');
  localStorage.removeItem('booking-storage');
  localStorage.removeItem('travel-wishlist');
  localStorage.removeItem('travel-wishlist-items');
  return { success: true };
});

export const changePassword = createAsyncThunk<
  AuthResponse,
  { currentPassword: string; newPassword: string }
>('auth/changePassword', async ({ currentPassword, newPassword }) => {
  try {
    await axiosInstance.post(API_ENDPOINTS.AUTH_CHANGE_PASSWORD, { currentPassword, newPassword });
    return { success: true };
  } catch (error) {
    const message = getErrorMessage(error, 'Failed to change password');
    return { success: false, error: message };
  }
});

export const getLoginHistory = createAsyncThunk<
  LoginHistoryResponse,
  { page?: number; limit?: number } | void
>('auth/getLoginHistory', async (args) => {
  const page = args?.page ?? 1;
  const limit = args?.limit ?? 10;

  try {
    const response = await axiosInstance.get(
      `${API_ENDPOINTS.AUTH_LOGIN_HISTORY}?page=${page}&limit=${limit}`
    );
    const historyArray = response.data.data || [];
    const pagination = response.data.meta || { page, limit, total: 0, totalPages: 0 };

    if (historyArray.length === 0) {
      console.warn('Login history is empty - current session may not be logged');
    }

    return {
      history: Array.isArray(historyArray) ? historyArray : [],
      pagination,
    };
  } catch (error) {
    console.error('Failed to fetch login history:', error);
    return { history: [], pagination: { page, limit, total: 0, totalPages: 0 } };
  }
});

export const revokeAllTokens = createAsyncThunk<AuthResponse, void>(
  'auth/revokeAllTokens',
  async () => {
    try {
      await axiosInstance.post(API_ENDPOINTS.AUTH_REVOKE_TOKENS);
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to revoke tokens');
      return { success: false, error: message };
    }
  }
);

export const revokeSession = createAsyncThunk<AuthResponse, { sessionId: number }>(
  'auth/revokeSession',
  async ({ sessionId }) => {
    try {
      await axiosInstance.delete(`/auth/revoke-session/${sessionId}`);
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to revoke session');
      return { success: false, error: message };
    }
  }
);

export const oauthLogin = createAsyncThunk<
  AuthResponse,
  { provider: OAuthProvider; accessToken: string; idToken?: string }
>('auth/oauthLogin', async ({ provider, accessToken, idToken }) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH_OAUTH_LOGIN, {
      provider,
      accessToken,
      idToken,
    });
    const data = response.data.data || response.data;
    const { user, isNewUser } = data;
    const tokens = extractTokens(data);
    persistTokens(tokens);

    const mergedUser = await mergeUserWithProfile(user);
    persistUser(mergedUser);
    return { success: true, isNewUser, user: mergedUser };
  } catch (error) {
    const message = getErrorMessage(error, 'OAuth login failed. Please try again.');
    return { success: false, error: message };
  }
});

export const getCurrentUser = createAsyncThunk<AuthResponse, void>(
  'auth/getCurrentUser',
  async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.AUTH_ME);
      const user = response.data.data || response.data;
      const mergedUser = await mergeUserWithProfile(user);
      return { success: true, user: mergedUser };
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to get user data');
      return { success: false, error: message };
    }
  }
);

export const verifyEmail = createAsyncThunk<AuthResponse, { token: string }>(
  'auth/verifyEmail',
  async ({ token }) => {
    try {
      await axiosInstance.post(API_ENDPOINTS.AUTH_VERIFY_EMAIL, { token });
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, 'Email verification failed');
      return { success: false, error: message };
    }
  }
);

export const resendVerification = createAsyncThunk<AuthResponse, { email: string }>(
  'auth/resendVerification',
  async ({ email }) => {
    try {
      await axiosInstance.post(API_ENDPOINTS.AUTH_RESEND_VERIFICATION, { email });
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to resend verification email');
      return { success: false, error: message };
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    // Set hasHydrated flag manually (called after persist rehydration)
    setHasHydrated: (state) => {
      state.hasHydrated = true;
    },
    // Demo login for testing - bypasses backend authentication
    demoLogin: (state) => {
      const demoUser: User = {
        id: 'demo-user-123',
        email: 'demo@tripandevent.com',
        name: 'Demo User',
        phone: '9876543210',
        avatar: undefined,
        createdAt: new Date().toISOString(),
      };
      state.user = demoUser;
      state.isAuthenticated = true;
      state.isLoading = false;
      // Store demo tokens for session persistence
      localStorage.setItem('accessToken', 'demo-access-token');
      localStorage.setItem('refreshToken', 'demo-refresh-token');
      localStorage.setItem('user', JSON.stringify(demoUser));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.user = action.payload.user ?? null;
          state.isAuthenticated = true;
        }
      })
      .addCase(signup.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.user = action.payload.user ?? null;
          state.isAuthenticated = true;
        }
      })
      .addCase(oauthLogin.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.user = action.payload.user ?? null;
          state.isAuthenticated = true;
        }
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.user = action.payload.user ?? null;
          state.isAuthenticated = true;
        }
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      })
      .addCase(clearAuth.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      })
      .addCase(REHYDRATE, (state, action) => {
        if ((action as { key?: string }).key === 'auth-storage') {
          state.hasHydrated = true;
        }
      })
      .addMatcher(
        isAnyOf(
          login.pending,
          signup.pending,
          forgotPassword.pending,
          resetPassword.pending,
          oauthLogin.pending,
          getCurrentUser.pending
        ),
        (state) => {
          state.isLoading = true;
        }
      )
      .addMatcher(
        isAnyOf(
          login.fulfilled,
          signup.fulfilled,
          forgotPassword.fulfilled,
          resetPassword.fulfilled,
          oauthLogin.fulfilled,
          getCurrentUser.fulfilled,
          login.rejected,
          signup.rejected,
          forgotPassword.rejected,
          resetPassword.rejected,
          oauthLogin.rejected,
          getCurrentUser.rejected
        ),
        (state) => {
          state.isLoading = false;
        }
      );
  },
});

export const { updateProfile, setHasHydrated, demoLogin } = authSlice.actions;
export default authSlice.reducer;
