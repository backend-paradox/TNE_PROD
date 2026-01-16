import axiosInstance from '../../app/axios';
import { API_ENDPOINTS, chatEndpoints } from '../../utils/constants';

// ============================================
// CONVERSATIONS
// ============================================

// Get user's conversations
export const getConversationsAPI = async (page = 1, limit = 20) => {
  const response = await axiosInstance.get(API_ENDPOINTS.CONVERSATIONS, {
    params: { page, limit },
  });
  return response.data.data;
};

// Get single conversation
export const getConversationByIdAPI = async (conversationId) => {
  const endpoints = chatEndpoints(conversationId);
  const response = await axiosInstance.get(endpoints.base);
  return response.data.data;
};

// Create new conversation
export const createConversationAPI = async (conversationData) => {
  const response = await axiosInstance.post(API_ENDPOINTS.CONVERSATIONS, conversationData);
  return response.data.data;
};

// Update conversation (name, description, image)
export const updateConversationAPI = async (conversationId, data) => {
  const endpoints = chatEndpoints(conversationId);
  const response = await axiosInstance.put(endpoints.base, data);
  return response.data.data;
};

// Leave conversation
export const leaveConversationAPI = async (conversationId) => {
  const endpoints = chatEndpoints(conversationId);
  const response = await axiosInstance.post(endpoints.leave);
  return response.data;
};

// Mark conversation as read
export const markConversationAsReadAPI = async (conversationId) => {
  const endpoints = chatEndpoints(conversationId);
  const response = await axiosInstance.post(endpoints.markRead);
  return response.data;
};

// Mute conversation
export const muteConversationAPI = async (conversationId, until = null) => {
  const endpoints = chatEndpoints(conversationId);
  const response = await axiosInstance.post(endpoints.mute, { until });
  return response.data.data;
};

// Unmute conversation
export const unmuteConversationAPI = async (conversationId) => {
  const endpoints = chatEndpoints(conversationId);
  const response = await axiosInstance.post(endpoints.unmute);
  return response.data;
};

// ============================================
// PARTICIPANTS
// ============================================

// Add participant to conversation
export const addParticipantAPI = async (conversationId, userId, role = 'MEMBER') => {
  const endpoints = chatEndpoints(conversationId);
  const response = await axiosInstance.post(endpoints.participants, { userId, role });
  return response.data.data;
};

// Remove participant from conversation
export const removeParticipantAPI = async (conversationId, userId) => {
  const endpoints = chatEndpoints(conversationId);
  const response = await axiosInstance.delete(`${endpoints.participants}/${userId}`);
  return response.data;
};

// ============================================
// MESSAGES
// ============================================

// Get messages for a conversation
export const getMessagesAPI = async (conversationId, options = {}) => {
  const endpoints = chatEndpoints(conversationId);
  const { before, after, limit = 50 } = options;
  const params = { limit };
  if (before) params.before = before;
  if (after) params.after = after;

  const response = await axiosInstance.get(endpoints.messages, { params });
  return response.data.data;
};

// Send a message
export const sendMessageAPI = async (conversationId, messageData) => {
  const endpoints = chatEndpoints(conversationId);
  const response = await axiosInstance.post(endpoints.messages, messageData);
  return response.data.data;
};

// Update a message
export const updateMessageAPI = async (messageId, content) => {
  const response = await axiosInstance.put(`${API_ENDPOINTS.MESSAGES}/${messageId}`, { content });
  return response.data.data;
};

// Delete a message
export const deleteMessageAPI = async (messageId) => {
  const response = await axiosInstance.delete(`${API_ENDPOINTS.MESSAGES}/${messageId}`);
  return response.data;
};

// ============================================
// REACTIONS
// ============================================

// Add reaction to message
export const addReactionAPI = async (messageId, emoji) => {
  const response = await axiosInstance.post(`${API_ENDPOINTS.MESSAGES}/${messageId}/reactions`, { emoji });
  return response.data.data;
};

// Remove reaction from message
export const removeReactionAPI = async (messageId, emoji) => {
  const response = await axiosInstance.delete(`${API_ENDPOINTS.MESSAGES}/${messageId}/reactions`, {
    data: { emoji },
  });
  return response.data.data;
};

// ============================================
// READ RECEIPTS
// ============================================

// Mark message as read
export const markMessageAsReadAPI = async (messageId) => {
  const response = await axiosInstance.post(`${API_ENDPOINTS.MESSAGES}/${messageId}/read`);
  return response.data;
};

// ============================================
// SEARCH
// ============================================

// Search messages
export const searchMessagesAPI = async (query, conversationId = null, page = 1, limit = 20) => {
  const params = { query, page, limit };
  if (conversationId) params.conversationId = conversationId;

  const response = await axiosInstance.get(API_ENDPOINTS.CHAT_SEARCH, { params });
  return response.data.data;
};

// ============================================
// TYPING INDICATOR (for Socket.IO integration)
// ============================================

// These are typically handled via WebSocket, but we provide API endpoints as fallback

// Set typing status
export const setTypingStatusAPI = async (conversationId, isTyping) => {
  const endpoints = chatEndpoints(conversationId);
  const response = await axiosInstance.post(`${endpoints.base}/typing`, { isTyping });
  return response.data;
};

// ============================================
// FILE UPLOAD
// ============================================

// Upload attachment
export const uploadAttachmentAPI = async (file, conversationId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('conversationId', conversationId);

  const response = await axiosInstance.post(`${API_ENDPOINTS.MESSAGES}/upload`, formData);
  return response.data.data;
};

// ============================================
// DIRECT MESSAGE HELPERS
// ============================================

// Start or get direct conversation with a user
export const getOrCreateDirectConversationAPI = async (userId) => {
  const response = await axiosInstance.post(API_ENDPOINTS.CONVERSATIONS, {
    type: 'DIRECT',
    participantIds: [userId],
  });
  return response.data.data;
};

// ============================================
// GROUP CHAT HELPERS
// ============================================

// Create group chat linked to a travel group
export const createGroupChatAPI = async (groupId, name, participantIds = []) => {
  const response = await axiosInstance.post(API_ENDPOINTS.CONVERSATIONS, {
    type: 'GROUP',
    groupId,
    name,
    participantIds,
  });
  return response.data.data;
};
