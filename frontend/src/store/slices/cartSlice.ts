import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@/app/axios';

export interface CartItem {
  id: string | number;
  packageId?: string;
  type: 'tour' | 'cinetrip';
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
  duration?: string;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  loading: boolean;
  error: string | null;
  synced: boolean; // Whether cart is synced with backend
}

const CART_STORAGE_KEY = 'tne-cart';

// Helper to get cart from localStorage (for non-logged-in users)
const getLocalCart = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Helper to save cart to localStorage
const saveLocalCart = (items: CartItem[]) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage errors
  }
};

const calculateTotals = (items: CartItem[]) => {
  return {
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
  };
};

// ==================== ASYNC THUNKS ====================

// Fetch cart from backend
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/cart');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

// Add item to cart (backend)
export const addToCartAsync = createAsyncThunk(
  'cart/addToCartAsync',
  async (item: Omit<CartItem, 'quantity' | 'id'>, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/cart', {
        packageId: item.packageId || item.slug,
        type: item.type,
        name: item.name,
        slug: item.slug,
        image: item.image,
        price: item.price,
        duration: item.duration,
        quantity: 1,
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
    }
  }
);

// Update cart item quantity (backend)
export const updateQuantityAsync = createAsyncThunk(
  'cart/updateQuantityAsync',
  async ({ id, quantity }: { id: string | number; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/cart/${id}`, { quantity });
      return { id, quantity, data: response.data.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart');
    }
  }
);

// Remove item from cart (backend)
export const removeFromCartAsync = createAsyncThunk(
  'cart/removeFromCartAsync',
  async (id: string | number, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/cart/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from cart');
    }
  }
);

// Clear cart (backend)
export const clearCartAsync = createAsyncThunk(
  'cart/clearCartAsync',
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.delete('/cart');
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
    }
  }
);

// Sync local cart to backend (after login)
export const syncCartToBackend = createAsyncThunk(
  'cart/syncToBackend',
  async (_, { rejectWithValue }) => {
    try {
      const localCart = getLocalCart();
      if (localCart.length === 0) {
        // Just fetch existing cart from backend
        const response = await axiosInstance.get('/cart');
        return response.data.data;
      }

      // Add local cart items to backend
      for (const item of localCart) {
        await axiosInstance.post('/cart', {
          packageId: item.packageId || item.slug,
          type: item.type,
          name: item.name,
          slug: item.slug,
          image: item.image,
          price: item.price,
          duration: item.duration,
          quantity: item.quantity,
        });
      }

      // Clear local storage after sync
      localStorage.removeItem(CART_STORAGE_KEY);

      // Fetch merged cart
      const response = await axiosInstance.get('/cart');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to sync cart');
    }
  }
);

// ==================== SLICE ====================

const initialState: CartState = {
  items: getLocalCart(),
  ...calculateTotals(getLocalCart()),
  loading: false,
  error: null,
  synced: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Local-only add (for non-logged-in users)
    addToCart: (state, action: PayloadAction<Omit<CartItem, 'quantity'>>) => {
      const existingItem = state.items.find(
        (item) => (item.packageId || item.slug) === (action.payload.packageId || action.payload.slug) && item.type === action.payload.type
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }

      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalPrice = totals.totalPrice;

      // Save to localStorage for non-logged-in users
      if (!state.synced) {
        saveLocalCart(state.items);
      }
    },

    // Local-only remove (for non-logged-in users)
    removeFromCart: (state, action: PayloadAction<{ id: string | number; type: 'tour' | 'cinetrip' }>) => {
      state.items = state.items.filter(
        (item) => !(item.id === action.payload.id && item.type === action.payload.type)
      );

      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalPrice = totals.totalPrice;

      if (!state.synced) {
        saveLocalCart(state.items);
      }
    },

    // Local-only update quantity (for non-logged-in users)
    updateQuantity: (
      state,
      action: PayloadAction<{ id: string | number; type: 'tour' | 'cinetrip'; quantity: number }>
    ) => {
      const item = state.items.find(
        (item) => item.id === action.payload.id && item.type === action.payload.type
      );

      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter(
            (i) => !(i.id === action.payload.id && i.type === action.payload.type)
          );
        } else {
          item.quantity = action.payload.quantity;
        }
      }

      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalPrice = totals.totalPrice;

      if (!state.synced) {
        saveLocalCart(state.items);
      }
    },

    // Local-only clear (for non-logged-in users)
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;

      if (!state.synced) {
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    },

    // Reset synced state (on logout)
    resetCartSync: (state) => {
      state.synced = false;
      state.items = getLocalCart();
      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalPrice = totals.totalPrice;
    },
  },

  extraReducers: (builder) => {
    // Fetch cart
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.totalItems = action.payload.totalItems || 0;
        state.totalPrice = action.payload.totalPrice || 0;
        state.synced = true;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add to cart async
    builder
      .addCase(addToCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        // Find and update existing or add new
        const existingIndex = state.items.findIndex(
          (item) => item.packageId === action.payload.packageId && item.type === action.payload.type
        );
        if (existingIndex >= 0) {
          state.items[existingIndex] = action.payload;
        } else {
          state.items.push(action.payload);
        }
        const totals = calculateTotals(state.items);
        state.totalItems = totals.totalItems;
        state.totalPrice = totals.totalPrice;
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update quantity async
    builder
      .addCase(updateQuantityAsync.fulfilled, (state, action) => {
        if (action.payload.quantity <= 0 || !action.payload.data) {
          state.items = state.items.filter((item) => item.id !== action.payload.id);
        } else {
          const item = state.items.find((item) => item.id === action.payload.id);
          if (item) {
            item.quantity = action.payload.quantity;
          }
        }
        const totals = calculateTotals(state.items);
        state.totalItems = totals.totalItems;
        state.totalPrice = totals.totalPrice;
      });

    // Remove from cart async
    builder.addCase(removeFromCartAsync.fulfilled, (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalPrice = totals.totalPrice;
    });

    // Clear cart async
    builder.addCase(clearCartAsync.fulfilled, (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
    });

    // Sync cart to backend
    builder
      .addCase(syncCartToBackend.pending, (state) => {
        state.loading = true;
      })
      .addCase(syncCartToBackend.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.totalItems = action.payload.totalItems || 0;
        state.totalPrice = action.payload.totalPrice || 0;
        state.synced = true;
      })
      .addCase(syncCartToBackend.rejected, (state) => {
        state.loading = false;
        // Keep local cart on sync failure
      });
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, resetCartSync } = cartSlice.actions;
export default cartSlice.reducer;
