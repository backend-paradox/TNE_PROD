import axiosInstance from '../../app/axios';
import { API_ENDPOINTS } from '../../utils/constants';

// ============================================
// BOOKING CREATION
// ============================================

// Create hotel booking
export const createHotelBookingAPI = async (bookingData) => {
  const response = await axiosInstance.post(API_ENDPOINTS.BOOKINGS_HOTEL, bookingData);
  return response.data.data;
};

// Create flight booking
export const createFlightBookingAPI = async (bookingData) => {
  const response = await axiosInstance.post(API_ENDPOINTS.BOOKINGS_FLIGHT, bookingData);
  return response.data.data;
};

// Create bus booking
export const createBusBookingAPI = async (bookingData) => {
  const response = await axiosInstance.post(API_ENDPOINTS.BOOKINGS_BUS, bookingData);
  return response.data.data;
};

// Create activity booking
export const createActivityBookingAPI = async (bookingData) => {
  const response = await axiosInstance.post(API_ENDPOINTS.BOOKINGS_ACTIVITY, bookingData);
  return response.data.data;
};

// Create event booking
export const createEventBookingAPI = async (bookingData) => {
  const response = await axiosInstance.post(API_ENDPOINTS.BOOKINGS_EVENT, bookingData);
  return response.data.data;
};

// Create package booking
export const createPackageBookingAPI = async (bookingData) => {
  const response = await axiosInstance.post(API_ENDPOINTS.BOOKINGS_PACKAGE, bookingData);
  return response.data.data;
};

// ============================================
// BOOKING QUERIES
// ============================================

// Get all bookings for user
export const getUserBookingsAPI = async (params = {}) => {
  const response = await axiosInstance.get(API_ENDPOINTS.BOOKINGS, { params });
  return response.data.data;
};

// Get booking by ID
export const getBookingByIdAPI = async (id) => {
  const response = await axiosInstance.get(`${API_ENDPOINTS.BOOKINGS}/${id}`);
  return response.data.data;
};

// Get booking by booking number
export const getBookingByNumberAPI = async (bookingNumber) => {
  const response = await axiosInstance.get(`${API_ENDPOINTS.BOOKINGS}/number/${bookingNumber}`);
  return response.data.data;
};

// Get bookings by status
export const getBookingsByStatusAPI = async (status) => {
  const response = await axiosInstance.get(API_ENDPOINTS.BOOKINGS, {
    params: { status },
  });
  return response.data.data;
};

// Get booking stats
export const getBookingStatsAPI = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.BOOKINGS_STATS);
  return response.data.data;
};

// ============================================
// BOOKING ACTIONS
// ============================================

// Initiate payment for booking (creates Razorpay order)
export const initiateBookingPaymentAPI = async (id) => {
  const response = await axiosInstance.post(`${API_ENDPOINTS.BOOKINGS}/${id}/payment`);
  return response.data.data;
};

// Cancel booking
export const cancelBookingAPI = async (id, reason = '') => {
  const response = await axiosInstance.post(`${API_ENDPOINTS.BOOKINGS}/${id}/cancel`, { reason });
  return response.data.data;
};

// Confirm booking (after payment)
export const confirmBookingAPI = async (id, paymentDetails = {}) => {
  const response = await axiosInstance.post(`${API_ENDPOINTS.BOOKINGS}/${id}/confirm`, paymentDetails);
  return response.data.data;
};

// Update booking details
export const updateBookingAPI = async (id, updateData) => {
  const response = await axiosInstance.put(`${API_ENDPOINTS.BOOKINGS}/${id}`, updateData);
  return response.data.data;
};

// ============================================
// TRAVELLER MANAGEMENT
// ============================================

// Add traveller to booking
export const addTravellerAPI = async (bookingId, travellerData) => {
  const response = await axiosInstance.post(`${API_ENDPOINTS.BOOKINGS}/${bookingId}/travellers`, travellerData);
  return response.data.data;
};

// Update traveller details
export const updateTravellerAPI = async (bookingId, travellerId, travellerData) => {
  const response = await axiosInstance.put(
    `${API_ENDPOINTS.BOOKINGS}/${bookingId}/travellers/${travellerId}`,
    travellerData
  );
  return response.data.data;
};

// Remove traveller from booking
export const removeTravellerAPI = async (bookingId, travellerId) => {
  const response = await axiosInstance.delete(
    `${API_ENDPOINTS.BOOKINGS}/${bookingId}/travellers/${travellerId}`
  );
  return response.data;
};

// ============================================
// BOOKING DOCUMENTS
// ============================================

// Get booking documents (tickets, vouchers, etc.)
export const getBookingDocumentsAPI = async (bookingId) => {
  const response = await axiosInstance.get(`${API_ENDPOINTS.BOOKINGS}/${bookingId}/documents`);
  return response.data.data;
};

// Download booking document
export const downloadBookingDocumentAPI = async (bookingId, documentType) => {
  const response = await axiosInstance.get(
    `${API_ENDPOINTS.BOOKINGS}/${bookingId}/documents/${documentType}`,
    { responseType: 'blob' }
  );
  return response.data;
};

// ============================================
// REVIEWS
// ============================================

// Add review for a booking
export const addBookingReviewAPI = async (bookingId, reviewData) => {
  const response = await axiosInstance.post(`${API_ENDPOINTS.BOOKINGS}/${bookingId}/review`, reviewData);
  return response.data.data;
};

// Get review for a booking
export const getBookingReviewAPI = async (bookingId) => {
  const response = await axiosInstance.get(`${API_ENDPOINTS.BOOKINGS}/${bookingId}/review`);
  return response.data.data;
};

// ============================================
// BOOKING HELPERS
// ============================================

// Calculate booking price
export const calculatePriceAPI = async (bookingType, bookingData) => {
  const endpoint = `${API_ENDPOINTS.BOOKINGS}/calculate-price`;
  const response = await axiosInstance.post(endpoint, { type: bookingType, ...bookingData });
  return response.data.data;
};

// Check availability
export const checkAvailabilityAPI = async (bookingType, searchData) => {
  const endpoint = `${API_ENDPOINTS.BOOKINGS}/check-availability`;
  const response = await axiosInstance.post(endpoint, { type: bookingType, ...searchData });
  return response.data.data;
};

// ============================================
// BOOKING FILTERS & SEARCH
// ============================================

// Search bookings
export const searchBookingsAPI = async (searchParams) => {
  const response = await axiosInstance.get(API_ENDPOINTS.BOOKINGS, {
    params: searchParams,
  });
  return response.data.data;
};

// Get upcoming bookings
export const getUpcomingBookingsAPI = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.BOOKINGS, {
    params: { status: 'CONFIRMED', upcoming: true },
  });
  return response.data.data;
};

// Get past bookings
export const getPastBookingsAPI = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.BOOKINGS, {
    params: { status: 'COMPLETED', past: true },
  });
  return response.data.data;
};

// Get cancelled bookings
export const getCancelledBookingsAPI = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.BOOKINGS, {
    params: { status: 'CANCELLED' },
  });
  return response.data.data;
};
