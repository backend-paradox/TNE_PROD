import axiosInstance from '../../app/axios';
import { API_ENDPOINTS } from '../../utils/constants';

// ============================================
// NOTIFICATION QUERIES
// ============================================

// Get notification history
export const getNotificationHistoryAPI = async (params = {}) => {
  const { type, status, page = 1, limit = 20 } = params;
  const queryParams = { page, limit };
  if (type) queryParams.type = type;
  if (status) queryParams.status = status;

  const response = await axiosInstance.get(API_ENDPOINTS.NOTIFICATIONS_HISTORY, {
    params: queryParams,
  });
  return response.data.data;
};

// Get unread notifications count
export const getUnreadCountAPI = async () => {
  const response = await axiosInstance.get(`${API_ENDPOINTS.NOTIFICATIONS}/unread-count`);
  return response.data.data;
};

// ============================================
// NOTIFICATION ACTIONS
// ============================================

// Mark notification as read
export const markAsReadAPI = async (notificationId) => {
  const response = await axiosInstance.put(`${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}/read`);
  return response.data;
};

// Mark all notifications as read
export const markAllAsReadAPI = async () => {
  const response = await axiosInstance.put(`${API_ENDPOINTS.NOTIFICATIONS}/read-all`);
  return response.data;
};

// Delete notification
export const deleteNotificationAPI = async (notificationId) => {
  const response = await axiosInstance.delete(`${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}`);
  return response.data;
};

// Clear all notifications
export const clearAllNotificationsAPI = async () => {
  const response = await axiosInstance.delete(`${API_ENDPOINTS.NOTIFICATIONS}/clear-all`);
  return response.data;
};

// ============================================
// PUSH NOTIFICATION MANAGEMENT
// ============================================

// Register push token
export const registerPushTokenAPI = async (tokenData) => {
  const response = await axiosInstance.post(`${API_ENDPOINTS.NOTIFICATIONS_PUSH}/register`, tokenData);
  return response.data.data;
};

// Unregister push token
export const unregisterPushTokenAPI = async (token) => {
  const response = await axiosInstance.delete(`${API_ENDPOINTS.NOTIFICATIONS_PUSH}/unregister`, {
    data: { token },
  });
  return response.data;
};

// Update push notification preferences
export const updatePushPreferencesAPI = async (preferences) => {
  const response = await axiosInstance.put(`${API_ENDPOINTS.NOTIFICATIONS_PUSH}/preferences`, preferences);
  return response.data.data;
};

// Get push notification preferences
export const getPushPreferencesAPI = async () => {
  const response = await axiosInstance.get(`${API_ENDPOINTS.NOTIFICATIONS_PUSH}/preferences`);
  return response.data.data;
};

// ============================================
// EMAIL NOTIFICATION PREFERENCES
// ============================================

// Get email preferences
export const getEmailPreferencesAPI = async () => {
  const response = await axiosInstance.get(`${API_ENDPOINTS.NOTIFICATIONS_EMAIL}/preferences`);
  return response.data.data;
};

// Update email preferences
export const updateEmailPreferencesAPI = async (preferences) => {
  const response = await axiosInstance.put(`${API_ENDPOINTS.NOTIFICATIONS_EMAIL}/preferences`, preferences);
  return response.data.data;
};

// ============================================
// SMS NOTIFICATION PREFERENCES
// ============================================

// Get SMS preferences
export const getSMSPreferencesAPI = async () => {
  const response = await axiosInstance.get(`${API_ENDPOINTS.NOTIFICATIONS_SMS}/preferences`);
  return response.data.data;
};

// Update SMS preferences
export const updateSMSPreferencesAPI = async (preferences) => {
  const response = await axiosInstance.put(`${API_ENDPOINTS.NOTIFICATIONS_SMS}/preferences`, preferences);
  return response.data.data;
};

// ============================================
// NOTIFICATION FILTERS
// ============================================

// Get notifications by type
export const getNotificationsByTypeAPI = async (type, page = 1, limit = 20) => {
  return getNotificationHistoryAPI({ type, page, limit });
};

// Get email notifications
export const getEmailNotificationsAPI = async (page = 1, limit = 20) => {
  return getNotificationHistoryAPI({ type: 'EMAIL', page, limit });
};

// Get SMS notifications
export const getSMSNotificationsAPI = async (page = 1, limit = 20) => {
  return getNotificationHistoryAPI({ type: 'SMS', page, limit });
};

// Get push notifications
export const getPushNotificationsAPI = async (page = 1, limit = 20) => {
  return getNotificationHistoryAPI({ type: 'PUSH', page, limit });
};

// ============================================
// RESEND NOTIFICATIONS (Admin)
// ============================================

// Resend notification
export const resendNotificationAPI = async (notificationId) => {
  const response = await axiosInstance.post(`${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}/resend`);
  return response.data;
};
