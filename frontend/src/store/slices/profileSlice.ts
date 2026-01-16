import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../app/axios';
import { getErrorMessage } from '../../utils/helpers';
import { API_ENDPOINTS } from '../../utils/constants';
import type {
  Address,
  KYCDocument,
  KYCStatus,
  KYCSubmitData,
  UpdateProfileData,
  UserProfile,
} from '../../types';
import { updateProfile as updateAuthProfile } from './authSlice';

interface ProfileState {
  profile: UserProfile | null;
  addresses: Address[];
  kycStatus: KYCStatus | null;
  kycDocuments: KYCDocument[];
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  addresses: [],
  kycStatus: null,
  kycDocuments: [],
  isLoading: false,
  isUpdating: false,
  error: null,
};

const buildAuthProfileUpdate = (profile: UserProfile) => ({
  name: profile.name,
  phone: profile.phone,
  avatar: profile.profilePicUrl,
});

export const fetchProfile = createAsyncThunk<
  UserProfile | null,
  void,
  { rejectValue: string }
>('profile/fetchProfile', async (_, { dispatch, rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.USER_PROFILE);
    const profile = response.data.data || response.data;

    if (profile) {
      dispatch(updateAuthProfile(buildAuthProfileUpdate(profile)));
    }

    return profile || null;
  } catch (error) {
    if (error?.response?.status === 404) {
      return null;
    }
    const message = getErrorMessage(error, 'Failed to fetch profile');
    return rejectWithValue(message);
  }
});

export const updateProfileAPI = createAsyncThunk<
  UserProfile,
  UpdateProfileData,
  { rejectValue: string }
>('profile/updateProfile', async (data, { dispatch, rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(API_ENDPOINTS.USER_PROFILE, data);
    const profile = response.data.data || response.data;

    if (profile) {
      dispatch(updateAuthProfile(buildAuthProfileUpdate(profile)));
    }

    return profile;
  } catch (error) {
    const message = getErrorMessage(error, 'Failed to update profile');
    return rejectWithValue(message);
  }
});

export const fetchAddresses = createAsyncThunk<Address[], void, { rejectValue: string }>(
  'profile/fetchAddresses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.USER_ADDRESSES);
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      return rejectWithValue('Failed to fetch addresses');
    }
  }
);

export const addAddress = createAsyncThunk<
  Address,
  Omit<Address, 'id'>,
  { rejectValue: string }
>('profile/addAddress', async (address, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.USER_ADDRESSES, address);
    return response.data.data || response.data;
  } catch (error) {
    const message = getErrorMessage(error, 'Failed to add address');
    return rejectWithValue(message);
  }
});

export const updateAddress = createAsyncThunk<
  Address,
  { id: number; data: Partial<Address> },
  { rejectValue: string }
>('profile/updateAddress', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`${API_ENDPOINTS.USER_ADDRESSES}/${id}`, data);
    return response.data.data || response.data;
  } catch (error) {
    const message = getErrorMessage(error, 'Failed to update address');
    return rejectWithValue(message);
  }
});

export const deleteAddress = createAsyncThunk<number, { id: number }, { rejectValue: string }>(
  'profile/deleteAddress',
  async ({ id }, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${API_ENDPOINTS.USER_ADDRESSES}/${id}`);
      return id;
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to delete address');
      return rejectWithValue(message);
    }
  }
);

export const fetchKYCStatus = createAsyncThunk<KYCStatus, void, { rejectValue: string }>(
  'profile/fetchKYCStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.USER_KYC);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Failed to fetch KYC status:', error);
      return rejectWithValue('Failed to fetch KYC status');
    }
  }
);

export const fetchKYCDocuments = createAsyncThunk<
  KYCDocument[],
  void,
  { rejectValue: string }
>('profile/fetchKYCDocuments', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.USER_KYC_DOCUMENTS);
    return response.data.data || response.data || [];
  } catch (error) {
    console.error('Failed to fetch KYC documents:', error);
    return rejectWithValue('Failed to fetch KYC documents');
  }
});

export const submitKYCDocument = createAsyncThunk<
  KYCDocument,
  KYCSubmitData,
  { rejectValue: string }
>('profile/submitKYCDocument', async (data, { dispatch, rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.USER_KYC_DOCUMENTS, data);
    const newDocument = response.data.data || response.data;
    dispatch(fetchKYCStatus());
    return newDocument;
  } catch (error) {
    const message = getErrorMessage(error, 'Failed to submit KYC document');
    return rejectWithValue(message);
  }
});

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.profile = null;
      state.addresses = [];
      state.kycStatus = null;
      state.kycDocuments = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch profile';
      })
      .addCase(updateProfileAPI.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateProfileAPI.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.isUpdating = false;
      })
      .addCase(updateProfileAPI.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload || 'Failed to update profile';
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.addresses = action.payload;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.addresses.push(action.payload);
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.map((addr) =>
          addr.id === action.payload.id ? action.payload : addr
        );
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.filter((addr) => addr.id !== action.payload);
      })
      .addCase(fetchKYCStatus.fulfilled, (state, action) => {
        state.kycStatus = action.payload;
      })
      .addCase(fetchKYCDocuments.fulfilled, (state, action) => {
        state.kycDocuments = action.payload;
      })
      .addCase(submitKYCDocument.fulfilled, (state, action) => {
        state.kycDocuments = [...state.kycDocuments, action.payload];
      });
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
