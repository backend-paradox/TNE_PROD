// API Endpoints
export const API_ENDPOINTS = {
  // Auth Service (port 3001)
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_ME: '/auth/me',
  AUTH_VERIFY_EMAIL: '/auth/verify-email',
  AUTH_RESEND_VERIFICATION: '/auth/resend-verification',
  AUTH_FORGOT_PASSWORD: '/auth/forgot-password',
  AUTH_RESET_PASSWORD: '/auth/reset-password',
  AUTH_CHANGE_PASSWORD: '/auth/change-password',
  AUTH_REVOKE_TOKENS: '/auth/revoke-tokens',
  // OAuth endpoints
  AUTH_OAUTH_LOGIN: '/auth/oauth/login',
  AUTH_OAUTH_PROVIDERS: '/auth/oauth/providers',
  AUTH_OAUTH_LINK: '/auth/oauth/link',
  AUTH_OAUTH_UNLINK: '/auth/oauth/unlink',
  // 2FA endpoints
  AUTH_2FA_STATUS: '/auth/2fa/status',
  AUTH_2FA_ENABLE: '/auth/2fa/enable',
  AUTH_2FA_CONFIRM: '/auth/2fa/confirm',
  AUTH_2FA_DISABLE: '/auth/2fa/disable',
  AUTH_2FA_VERIFY: '/auth/2fa/verify',
  // Phone verification
  AUTH_PHONE_SEND_OTP: '/auth/phone/send-otp',
  AUTH_PHONE_VERIFY_OTP: '/auth/phone/verify-otp',
  // Device & Security
  AUTH_DEVICES: '/auth/devices',
  AUTH_LOGIN_HISTORY: '/auth/login-history',
  AUTH_SECURITY_EVENTS: '/auth/security-events',

  // User Service (port 3002)
  USER_PROFILE: '/users/profile',
  USER_AVATAR: '/users/profile/avatar',
  USER_LOCATION: '/users/location',
  USER_NEARBY: '/users/nearby',
  USER_SEARCH: '/users/search',
  USER_ADDRESSES: '/users/addresses',
  USER_KYC: '/users/kyc',
  USER_KYC_DOCUMENTS: '/users/kyc/documents',
  USER_TRAVEL_PREFERENCES: '/users/travel-preferences',
  USER_TRAVEL_DOCUMENTS: '/users/travel-documents',
  USER_EMERGENCY_CONTACTS: '/users/emergency-contacts',
  USER_BADGES: '/users/badges',
  USER_BLOCKED: '/users/blocked',
  USER_BLOCK: '/users/block',
  USER_CHANGE_PASSWORD: '/users/change-password',

  // Booking Service (port 3004)
  BOOKINGS: '/bookings',
  BOOKINGS_HOTEL: '/bookings/hotels',
  BOOKINGS_FLIGHT: '/bookings/flights',
  BOOKINGS_BUS: '/bookings/buses',
  BOOKINGS_ACTIVITY: '/bookings/activities',
  BOOKINGS_EVENT: '/bookings/events',
  BOOKINGS_PACKAGE: '/bookings/packages',
  BOOKINGS_STATS: '/bookings/stats',

  // Cart (via Booking Service)
  CART: '/cart',

  // Wishlist (via Booking Service)
  WISHLIST: '/wishlist',

  // Payment Service (port 3005)
  PAYMENTS: '/payments',
  PAYMENT_ORDER: '/payments/orders',
  PAYMENT_VERIFY: '/payments/verify',
  PAYMENT_FAILURE: '/payments/failure',
  PAYMENT_REFUND: '/payments/refund',
  PAYMENT_HISTORY: '/payments/history',

  // Notification Service (port 3007)
  NOTIFICATIONS: '/notifications',
  NOTIFICATIONS_EMAIL: '/notifications/email',
  NOTIFICATIONS_SMS: '/notifications/sms',
  NOTIFICATIONS_PUSH: '/notifications/push',
  NOTIFICATIONS_HISTORY: '/notifications/history',

  // Group Service (port 3008)
  GROUPS: '/groups',
  GROUPS_SEARCH: '/groups/search',
  GROUPS_MY: '/groups/my',
  // Dynamic group endpoints (use with groupId)
  // /groups/:groupId
  // /groups/:groupId/members
  // /groups/:groupId/invitations
  // /groups/:groupId/join
  // /groups/:groupId/join-requests
  // /groups/:groupId/itinerary
  // /groups/:groupId/expenses
  // /groups/:groupId/expenses/summary
  // /groups/:groupId/expenses/settlements
  // /groups/:groupId/polls
  // /groups/:groupId/announcements

  // Chat Service (port 3009)
  CONVERSATIONS: '/chat/conversations',
  MESSAGES: '/chat/messages',
  CHAT_SEARCH: '/chat/search',
  // Dynamic chat endpoints
  // /chat/conversations/:conversationId
  // /chat/conversations/:conversationId/messages
  // /chat/conversations/:conversationId/mark-read
  // /chat/conversations/:conversationId/mute
  // /chat/conversations/:conversationId/participants

  // CRM Sync Service (port 3011)
  CRM_DESTINATIONS: '/crm/destinations',
  CRM_PACKAGES: '/crm/packages',
  CRM_ITINERARY: '/crm/itinerary',
  CRM_CINETRIP: '/crm/cinetrip-packages',
  CRM_SYNC: '/crm/sync',

  // Catalog endpoints (via API Gateway)
  CATALOG_HOTELS: '/catalog/hotels',
  CATALOG_FLIGHTS: '/catalog/flights',
  CATALOG_BUSES: '/catalog/buses',
  CATALOG_EVENTS: '/catalog/events',
  CATALOG_PACKAGES: '/catalog/packages',
  CATALOG_DESTINATIONS: '/catalog/destinations',

  // Search endpoints
  SEARCH_ALL: '/search/all',
  SEARCH_HOTELS: '/search/hotels',
  SEARCH_FLIGHTS: '/search/flights',
  SEARCH_BUSES: '/search/buses',
  SEARCH_EVENTS: '/search/events',

  // Reviews
  REVIEWS: '/reviews',

  // Vendor
  VENDOR_REGISTER: '/vendors/register',
  VENDOR_LISTINGS: '/vendors/listings',
  VENDOR_PROFILE: '/vendors/profile',

  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_PAYMENTS: '/admin/payments',
  ADMIN_VENDORS: '/admin/vendors',
};

// Helper function to build dynamic endpoints
export const buildEndpoint = (base, ...parts) => {
  return [base, ...parts].join('/');
};

// Group endpoints builder
export const groupEndpoints = (groupId) => ({
  base: `${API_ENDPOINTS.GROUPS}/${groupId}`,
  members: `${API_ENDPOINTS.GROUPS}/${groupId}/members`,
  invitations: `${API_ENDPOINTS.GROUPS}/${groupId}/invitations`,
  join: `${API_ENDPOINTS.GROUPS}/${groupId}/join`,
  joinRequests: `${API_ENDPOINTS.GROUPS}/${groupId}/join-requests`,
  leave: `${API_ENDPOINTS.GROUPS}/${groupId}/leave`,
  rsvp: `${API_ENDPOINTS.GROUPS}/${groupId}/rsvp`,
  stats: `${API_ENDPOINTS.GROUPS}/${groupId}/stats`,
  itinerary: `${API_ENDPOINTS.GROUPS}/${groupId}/itinerary`,
  expenses: `${API_ENDPOINTS.GROUPS}/${groupId}/expenses`,
  expenseSummary: `${API_ENDPOINTS.GROUPS}/${groupId}/expenses/summary`,
  settlements: `${API_ENDPOINTS.GROUPS}/${groupId}/expenses/settlements`,
  polls: `${API_ENDPOINTS.GROUPS}/${groupId}/polls`,
  announcements: `${API_ENDPOINTS.GROUPS}/${groupId}/announcements`,
});

// Chat endpoints builder
export const chatEndpoints = (conversationId) => ({
  base: `${API_ENDPOINTS.CONVERSATIONS}/${conversationId}`,
  messages: `${API_ENDPOINTS.CONVERSATIONS}/${conversationId}/messages`,
  markRead: `${API_ENDPOINTS.CONVERSATIONS}/${conversationId}/mark-read`,
  mute: `${API_ENDPOINTS.CONVERSATIONS}/${conversationId}/mute`,
  unmute: `${API_ENDPOINTS.CONVERSATIONS}/${conversationId}/unmute`,
  leave: `${API_ENDPOINTS.CONVERSATIONS}/${conversationId}/leave`,
  participants: `${API_ENDPOINTS.CONVERSATIONS}/${conversationId}/participants`,
});

// User Roles
export const USER_ROLES = {
  USER: 'USER',
  VENDOR: 'VENDOR',
  ADMIN: 'ADMIN',
};

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  REFUNDED: 'REFUNDED',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  CREATED: 'CREATED',
  AUTHORIZED: 'AUTHORIZED',
  CAPTURED: 'CAPTURED',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
};

// Booking Types
export const BOOKING_TYPES = {
  HOTEL: 'HOTEL',
  FLIGHT: 'FLIGHT',
  BUS: 'BUS',
  ACTIVITY: 'ACTIVITY',
  EVENT: 'EVENT',
  PACKAGE: 'PACKAGE',
};

// Group Types
export const GROUP_TYPES = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
};

// Member Roles
export const MEMBER_ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
  MEMBER: 'MEMBER',
};

// RSVP Status
export const RSVP_STATUS = {
  GOING: 'GOING',
  MAYBE: 'MAYBE',
  NOT_GOING: 'NOT_GOING',
};

// Expense Categories
export const EXPENSE_CATEGORIES = {
  ACCOMMODATION: 'ACCOMMODATION',
  TRANSPORT: 'TRANSPORT',
  FOOD: 'FOOD',
  ACTIVITIES: 'ACTIVITIES',
  SHOPPING: 'SHOPPING',
  TICKETS: 'TICKETS',
  OTHER: 'OTHER',
};

// Split Types
export const SPLIT_TYPES = {
  EQUAL: 'EQUAL',
  EXACT: 'EXACT',
  PERCENTAGE: 'PERCENTAGE',
  SHARES: 'SHARES',
};

// Poll Types
export const POLL_TYPES = {
  SINGLE_CHOICE: 'SINGLE_CHOICE',
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  DATE_POLL: 'DATE_POLL',
};

// Itinerary Categories
export const ITINERARY_CATEGORIES = {
  TRANSPORT: 'TRANSPORT',
  ACCOMMODATION: 'ACCOMMODATION',
  ACTIVITY: 'ACTIVITY',
  FOOD: 'FOOD',
  SIGHTSEEING: 'SIGHTSEEING',
  OTHER: 'OTHER',
};

// Message Types
export const MESSAGE_TYPES = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  FILE: 'FILE',
  AUDIO: 'AUDIO',
  VIDEO: 'VIDEO',
  LOCATION: 'LOCATION',
  SYSTEM: 'SYSTEM',
};

// Conversation Types
export const CONVERSATION_TYPES = {
  DIRECT: 'DIRECT',
  GROUP: 'GROUP',
  SUPPORT: 'SUPPORT',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  VERIFICATION_EMAIL: 'VERIFICATION_EMAIL',
  PASSWORD_RESET: 'PASSWORD_RESET',
  BOOKING_CONFIRMATION: 'BOOKING_CONFIRMATION',
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  BOOKING_CANCELLATION: 'BOOKING_CANCELLATION',
  REFUND_PROCESSED: 'REFUND_PROCESSED',
  GROUP_INVITE: 'GROUP_INVITE',
  NEW_MESSAGE: 'NEW_MESSAGE',
};

// Search Sort Options
export const SORT_OPTIONS = {
  PRICE_LOW_HIGH: 'price_asc',
  PRICE_HIGH_LOW: 'price_desc',
  RATING: 'rating',
  RELEVANCE: 'relevance',
  NEWEST: 'newest',
  POPULARITY: 'popularity',
};

// KYC Document Types
export const KYC_DOCUMENT_TYPES = {
  AADHAAR: 'AADHAAR',
  PAN: 'PAN',
  PASSPORT: 'PASSPORT',
  DRIVING_LICENSE: 'DRIVING_LICENSE',
  VOTER_ID: 'VOTER_ID',
};

// KYC Status
export const KYC_STATUS = {
  PENDING: 'PENDING',
  SUBMITTED: 'SUBMITTED',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
};

// Travel Document Types
export const TRAVEL_DOCUMENT_TYPES = {
  PASSPORT: 'PASSPORT',
  VISA: 'VISA',
  TRAVEL_INSURANCE: 'TRAVEL_INSURANCE',
  VACCINATION: 'VACCINATION',
};

// Badge Types
export const BADGE_TYPES = {
  FIRST_TRIP: 'FIRST_TRIP',
  EXPLORER: 'EXPLORER',
  GLOBETROTTER: 'GLOBETROTTER',
  VERIFIED: 'VERIFIED',
  TOP_CONTRIBUTOR: 'TOP_CONTRIBUTOR',
  TRIP_PLANNER: 'TRIP_PLANNER',
};

// App Config
export const APP_CONFIG = {
  APP_NAME: import.meta.env.VITE_APP_NAME || 'TripAndEvent',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  ITEMS_PER_PAGE: 20,
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
  RAZORPAY_KEY: import.meta.env.VITE_RAZORPAY_KEY_ID,
  IS_PRODUCTION: import.meta.env.VITE_ENV === 'production',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
};
