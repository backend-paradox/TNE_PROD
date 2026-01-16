import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  isMobileMenuOpen: boolean;
  isLoginModalOpen: boolean;
}

const initialState: UIState = {
  isMobileMenuOpen: false,
  isLoginModalOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    setLoginModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isLoginModalOpen = action.payload;
    },
  },
});

export const { toggleMobileMenu, setLoginModalOpen } = uiSlice.actions;
export default uiSlice.reducer;
