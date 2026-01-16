import axiosInstance from '../../app/axios';
import { API_ENDPOINTS } from '../../utils/constants';

// ============================================
// PROFILE MANAGEMENT
// ============================================

// Get user profile
export const getUserProfileAPI = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.USER_PROFILE);
  return response.data.data;
};

// Update user profile
export const updateUserProfileAPI = async (userData) => {
  const response = await axiosInstance.put(API_ENDPOINTS.USER_PROFILE, userData);
  return response.data.data;
};

// Upload avatar
export const uploadAvatarAPI = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  const response = await axiosInstance.put(API_ENDPOINTS.USER_AVATAR, formData);
  return response.data.data;
};

// Delete avatar
export const deleteAvatarAPI = async () => {
  const response = await axiosInstance.delete(API_ENDPOINTS.USER_AVATAR);
  return response.data;
};

// Delete account (soft delete)
export const deleteAccountAPI = async () => {
  const response = await axiosInstance.delete(API_ENDPOINTS.USER_PROFILE);
  return response.data;
};

// Search users
export const searchUsersAPI = async (params = {}) => {
  const response = await axiosInstance.get(API_ENDPOINTS.USER_SEARCH, { params });
  return response.data.data;
};

// ============================================
// LOCATION & NEARBY
// ============================================

// Update current location
export const updateLocationAPI = async (locationData) => {
  const response = await axiosInstance.put(API_ENDPOINTS.USER_LOCATION, locationData);
  return response.data.data;
};

// Get nearby travellers
export const getNearbyTravellersAPI = async (radius = 50) => {
  const response = await axiosInstance.get(API_ENDPOINTS.USER_NEARBY, {
    params: { radius },
  });
  return response.data.data;
};

// ============================================
// ADDRESSES
// ============================================

// Get all addresses
export const getAddressesAPI = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.USER_ADDRESSES);
  return response.data.data;
};

// Add address
export const addAddressAPI = async (addressData) => {
  const response = await axiosInstance.post(API_ENDPOINTS.USER_ADDRESSES, addressData);
  return response.data.data;
};

// Update address
export const updateAddressAPI = async (addressId, addressData) => {
  const response = await axiosInstance.put(`${API_ENDPOINTS.USER_ADDRESSES}/${addressId}`, addressData);
  return response.data.data;
};

// Delete address
export const deleteAddressAPI = async (addressId) => {
  const response = await axiosInstance.delete(`${API_ENDPOINTS.USER_ADDRESSES}/${addressId}`);
  return response.data;
};

// Set default address
export const setDefaultAddressAPI = async (addressId) => {
  const response = await axiosInstance.put(`${API_ENDPOINTS.USER_ADDRESSES}/${addressId}/default`);
  return response.data.data;
};

// ============================================
// KYC MANAGEMENT
// ============================================

// Get KYC status
export const getKYCStatusAPI = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.USER_KYC);
  return response.data.data;
};

// Get KYC documents
export const getKYCDocumentsAPI = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.USER_KYC_DOCUMENTS);
  return response.data.data;
};

// Get specific KYC document
export const getKYCDocumentAPI = async (documentId) => {
  const response = await axiosInstance.get(`${API_ENDPOINTS.USER_KYC_DOCUMENTS}/${documentId}`);
  return response.data.data;
};

// Submit KYC document
export const submitKYCDocumentAPI = async (documentData) => {
  const formData = new FormData();
  formData.append('documentType', documentData.documentType);
  formData.append('documentNumber', documentData.documentNumber);
  if (documentData.frontImage) formData.append('frontImage', documentData.frontImage);
  if (documentData.backImage) formData.append('backImage', documentData.backImage);

  const response = await axiosInstance.post(API_ENDPOINTS.USER_KYC_DOCUMENTS, formData);
  return response.data.data;
};

// ============================================
// TRAVEL PREFERENCES
// ============================================

// Get travel preferences
export const getTravelPreferencesAPI = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.USER_TRAVEL_PREFERENCES);
  return response.data.data;
};

// Update travel preferences
export const updateTravelPreferencesAPI = async (preferencesData) => {
  const response = await axiosInstance.put(API_ENDPOINTS.USER_TRAVEL_PREFERENCES, preferencesData);
  return response.data.data;
};

// Delete travel preferences
export const deleteTravelPreferencesAPI = async () => {
  const response = await axiosInstance.delete(API_ENDPOINTS.USER_TRAVEL_PREFERENCES);
  return response.data;
};

// ============================================
// TRAVEL DOCUMENTS
// ============================================

// Get all travel documents
export const getTravelDocumentsAPI = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.USER_TRAVEL_DOCUMENTS);
  return response.data.data;
};

// Get expiring documents
export const getExpiringDocumentsAPI = async (days = 90) => {
  const response = await axiosInstance.get(`${API_ENDPOINTS.USER_TRAVEL_DOCUMENTS}/expiring`, {
    params: { days },
  });
  return response.data.data;
};

// Add travel document
export const addTravelDocumentAPI = async (documentData) => {
  const response = await axiosInstance.post(API_ENDPOINTS.USER_TRAVEL_DOCUMENTS, documentData);
  return response.data.data;
};

// Update travel document
export const updateTravelDocumentAPI = async (documentId, documentData) => {
  const response = await axiosInstance.put(`${API_ENDPOINTS.USER_TRAVEL_DOCUMENTS}/${documentId}`, documentData);
  return response.data.data;
};

// Delete travel document
export const deleteTravelDocumentAPI = async (documentId) => {
  const response = await axiosInstance.delete(`${API_ENDPOINTS.USER_TRAVEL_DOCUMENTS}/${documentId}`);
  return response.data;
};

// ============================================
// EMERGENCY CONTACTS
// ============================================

// Get emergency contacts
export const getEmergencyContactsAPI = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.USER_EMERGENCY_CONTACTS);
  return response.data.data;
};

// Add emergency contact
export const addEmergencyContactAPI = async (contactData) => {
  const response = await axiosInstance.post(API_ENDPOINTS.USER_EMERGENCY_CONTACTS, contactData);
  return response.data.data;
};

// Update emergency contact
export const updateEmergencyContactAPI = async (contactId, contactData) => {
  const response = await axiosInstance.put(`${API_ENDPOINTS.USER_EMERGENCY_CONTACTS}/${contactId}`, contactData);
  return response.data.data;
};

// Delete emergency contact
export const deleteEmergencyContactAPI = async (contactId) => {
  const response = await axiosInstance.delete(`${API_ENDPOINTS.USER_EMERGENCY_CONTACTS}/${contactId}`);
  return response.data;
};

// ============================================
// BADGES
// ============================================

// Get user badges
export const getUserBadgesAPI = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.USER_BADGES);
  return response.data.data;
};

// Add badge (self-award for certain achievements)
export const addBadgeAPI = async (badgeData) => {
  const response = await axiosInstance.post(API_ENDPOINTS.USER_BADGES, badgeData);
  return response.data.data;
};

// ============================================
// BLOCK MANAGEMENT
// ============================================

// Get blocked users
export const getBlockedUsersAPI = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.USER_BLOCKED);
  return response.data.data;
};

// Block user
export const blockUserAPI = async (userId, reason = '') => {
  const response = await axiosInstance.post(API_ENDPOINTS.USER_BLOCK, { userId, reason });
  return response.data.data;
};

// Unblock user
export const unblockUserAPI = async (userId) => {
  const response = await axiosInstance.delete(`${API_ENDPOINTS.USER_BLOCK}/${userId}`);
  return response.data;
};

// Check block status
export const checkBlockStatusAPI = async (userId) => {
  const response = await axiosInstance.get(`${API_ENDPOINTS.USER_BLOCK}/${userId}/status`);
  return response.data.data;
};

// ============================================
// PASSWORD MANAGEMENT
// ============================================

// Change password
export const changePasswordAPI = async (passwordData) => {
  const response = await axiosInstance.put(API_ENDPOINTS.USER_CHANGE_PASSWORD, passwordData);
  return response.data;
};

// ============================================
// PUBLIC PROFILE
// ============================================

// Get user by ID (public profile)
export const getUserByIdAPI = async (userId) => {
  const response = await axiosInstance.get(`/users/${userId}`);
  return response.data.data;
};
