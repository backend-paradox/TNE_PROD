/**
 * TNE API Module
 * Centralized API exports for the frontend application
 */

// Axios instance
export { default as axiosInstance } from '../app/axios';

// Auth APIs
export * from '../features/auth/authAPI';

// User APIs
export * from '../features/user/userAPI';

// Booking APIs
export * from '../features/booking/bookingAPI';

// Payment APIs
export * from '../features/payment/paymentAPI';

// Groups APIs
export * from '../features/groups/groupsAPI';

// Chat APIs
export * from '../features/chat/chatAPI';

// Notifications APIs
export * from '../features/notifications/notificationsAPI';

// Catalog APIs (if exists)
export * from '../features/catalog/catalogAPI';

// Constants
export {
  API_ENDPOINTS,
  groupEndpoints,
  chatEndpoints,
  buildEndpoint,
  APP_CONFIG,
  USER_ROLES,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  BOOKING_TYPES,
  GROUP_TYPES,
  MEMBER_ROLES,
  RSVP_STATUS,
  EXPENSE_CATEGORIES,
  SPLIT_TYPES,
  POLL_TYPES,
  ITINERARY_CATEGORIES,
  MESSAGE_TYPES,
  CONVERSATION_TYPES,
  NOTIFICATION_TYPES,
  SORT_OPTIONS,
  KYC_DOCUMENT_TYPES,
  KYC_STATUS,
  TRAVEL_DOCUMENT_TYPES,
  BADGE_TYPES,
} from '../utils/constants';
