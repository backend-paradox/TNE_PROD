import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import authReducer from './slices/authSlice';
import bookingReducer from './slices/bookingSlice';
import searchReducer from './slices/searchSlice';
import uiReducer from './slices/uiSlice';
import profileReducer from './slices/profileSlice';
import travellerReducer from './slices/travellerSlice';
import cartReducer from './slices/cartSlice';

const authPersistConfig = {
  key: 'auth-storage',
  storage,
  keyPrefix: '',
  whitelist: ['user', 'isAuthenticated'],
};

const travellerPersistConfig = {
  key: 'traveller-storage',
  storage,
  keyPrefix: '',
  whitelist: ['isSidebarOpen'],
};

const cartPersistConfig = {
  key: 'cart-storage',
  storage,
  keyPrefix: '',
  whitelist: ['items', 'totalItems', 'totalPrice'],
};

const bookingPersistConfig = {
  key: 'booking-storage',
  storage,
  keyPrefix: '',
  whitelist: ['currentBooking'],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  booking: persistReducer(bookingPersistConfig, bookingReducer),
  search: searchReducer,
  ui: uiReducer,
  profile: profileReducer,
  traveller: persistReducer(travellerPersistConfig, travellerReducer),
  cart: persistReducer(cartPersistConfig, cartReducer),
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
