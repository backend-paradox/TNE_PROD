import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import catalogReducer from '../features/catalog/catalogSlice';
import bookingReducer from '../features/booking/bookingSlice';
import userReducer from '../features/user/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    catalog: catalogReducer,
    booking: bookingReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/login/fulfilled', 'auth/register/fulfilled'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
