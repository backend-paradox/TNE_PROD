import axiosInstance from '../../app/axios';
import { API_ENDPOINTS, groupEndpoints } from '../../utils/constants';

// ============================================
// GROUP CRUD OPERATIONS
// ============================================

// Get user's groups
export const getMyGroupsAPI = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.GROUPS);
  return response.data.data;
};

// Search public groups
export const searchGroupsAPI = async (params = {}) => {
  const response = await axiosInstance.get(API_ENDPOINTS.GROUPS_SEARCH, { params });
  return response.data.data;
};

// Create a new group
export const createGroupAPI = async (groupData) => {
  const response = await axiosInstance.post(API_ENDPOINTS.GROUPS, groupData);
  return response.data.data;
};

// Get single group by ID
export const getGroupByIdAPI = async (groupId) => {
  const endpoints = groupEndpoints(groupId);
  const response = await axiosInstance.get(endpoints.base);
  return response.data.data;
};

// Update group
export const updateGroupAPI = async (groupId, groupData) => {
  const endpoints = groupEndpoints(groupId);
  const response = await axiosInstance.put(endpoints.base, groupData);
  return response.data.data;
};

// Delete group
export const deleteGroupAPI = async (groupId) => {
  const endpoints = groupEndpoints(groupId);
  const response = await axiosInstance.delete(endpoints.base);
  return response.data;
};

// Get group stats
export const getGroupStatsAPI = async (groupId) => {
  const endpoints = groupEndpoints(groupId);
  const response = await axiosInstance.get(endpoints.stats);
  return response.data.data;
};

// ============================================
// MEMBER MANAGEMENT
// ============================================

// Get group members
export const getGroupMembersAPI = async (groupId) => {
  const endpoints = groupEndpoints(groupId);
  const response = await axiosInstance.get(endpoints.members);
  return response.data.data;
};

// Update member role
export const updateMemberRoleAPI = async (groupId, memberId, role) => {
  const endpoints = groupEndpoints(groupId);
  const response = await axiosInstance.put(`${endpoints.members}/${memberId}`, { role });
  return response.data.data;
};

// Remove member
export const removeMemberAPI = async (groupId, memberId) => {
  const endpoints = groupEndpoints(groupId);
  const response = await axiosInstance.delete(`${endpoints.members}/${memberId}`);
  return response.data;
};

// Leave group
export const leaveGroupAPI = async (groupId) => {
  const endpoints = groupEndpoints(groupId);
  const response = await axiosInstance.post(endpoints.leave);
  return response.data;
};

// Update RSVP status
export const updateRSVPAPI = async (groupId, status) => {
  const endpoints = groupEndpoints(groupId);
  const response = await axiosInstance.put(endpoints.rsvp, { status });
  return response.data.data;
};

// ============================================
// INVITATIONS
// ============================================

// Get invitations for a group
export const getGroupInvitationsAPI = async (groupId) => {
  const endpoints = groupEndpoints(groupId);
  const response = await axiosInstance.get(endpoints.invitations);
  return response.data.data;
};

// Send invitation
export const sendInvitationAPI = async (groupId, invitationData) => {
  const endpoints = groupEndpoints(groupId);
  const response = await axiosInstance.post(endpoints.invitations, invitationData);
  return response.data.data;
};

// Cancel invitation
export const cancelInvitationAPI = async (groupId, invitationId) => {
  const endpoints = groupEndpoints(groupId);
  const response = await axiosInstance.delete(`${endpoints.invitations}/${invitationId}`);
  return response.data;
};

// Accept invitation by token
export const acceptInvitationAPI = async (token) => {
  const response = await axiosInstance.post(`/invitations/${token}/accept`);
  return response.data.data;
};

// Decline invitation by token
export const declineInvitationAPI = async (token) => {
  const response = await axiosInstance.post(`/invitations/${token}/decline`);
  return response.data;
};

// ============================================
// JOIN REQUESTS
// ============================================

// Request to join group
export const requestToJoinAPI = async (groupId, message = '') => {
  const endpoints = groupEndpoints(groupId);
  const response = await axiosInstance.post(endpoints.join, { message });
  return response.data.data;
};

// Get join requests (admin only)
export const getJoinRequestsAPI = async (groupId) => {
  const endpoints = groupEndpoints(groupId);
  const response = await axiosInstance.get(endpoints.joinRequests);
  return response.data.data;
};

// Handle join request (approve/reject)
export const handleJoinRequestAPI = async (groupId, requestId, action, rejectionReason = '') => {
  const endpoints = groupEndpoints(groupId);
  const response = await axiosInstance.put(`${endpoints.joinRequests}/${requestId}`, {
    action,
    rejectionReason,
  });
  return response.data.data;
};

// ============================================
// ITINERARY
// ============================================

// Get group itinerary
export const getGroupItineraryAPI = async (groupId, date = null) => {
  const endpoints = groupEndpoints(groupId);
  const params = date ? { date } : {};
  const response = await axiosInstance.get(endpoints.itinerary, { params });
  return response.data.data;
};

// Add itinerary item
export const addItineraryItemAPI = async (groupId, itemData) => {
  const endpoints = groupEndpoints(groupId);
  const response = await axiosInstance.post(endpoints.itinerary, itemData);
  return response.data.data;
};

// Update itinerary item
export const updateItineraryItemAPI = async (groupId, itemId, itemData) => {
  const endpoints = groupEndpoints(groupId);
  const response = await axiosInstance.put(`${endpoints.itinerary}/${itemId}`, itemData);
  return response.data.data;
};

// Delete itinerary item
export const deleteItineraryItemAPI = async (groupId, itemId) => {
  const endpoints = groupEndpoints(groupId);
  const response = await axiosInstance.delete(`${endpoints.itinerary}/${itemId}`);
  return response.data;
};

// Vote on itinerary item
export const voteOnItineraryItemAPI = async (groupId, itemId, vote) => {
  const endpoints = groupEndpoints(groupId);
  const response = await axiosInstance.post(`${endpoints.itinerary}/${itemId}/vote`, { vote });
  return response.data.data;
};

// Confirm itinerary item (admin only)
export const confirmItineraryItemAPI = async (groupId, itemId) => {
  const endpoints = groupEndpoints(groupId);
  const response = await axiosInstance.put(`${endpoints.itinerary}/${itemId}/confirm`);
  return response.data.data;
};

// ============================================
// EXPENSES
// ============================================

// Get group expenses
export const getGroupExpensesAPI = async (groupId, params = {}) => {
  const endpoints = groupEndpoints(groupId);
  const response = await axiosInstance.get(endpoints.expenses, { params });
  return response.data.data;
};

// Get expense summary
export const getExpenseSummaryAPI = async (groupId) => {
  const endpoints = groupEndpoints(groupId);
  const response = await axiosInstance.get(endpoints.expenseSummary);
  return response.data.data;
};

// Get settlement suggestions
export const getSettlementSuggestionsAPI = async (groupId) => {
  const endpoints = groupEndpoints(groupId);
  const response = await axiosInstance.get(endpoints.settlements);
  return response.data.data;
};

// Add expense
export const addExpenseAPI = async (groupId, expenseData) => {
  const endpoints = groupEndpoints(groupId);
  const response = await axiosInstance.post(endpoints.expenses, expenseData);
  return response.data.data;
};

// Update expense
export const updateExpenseAPI = async (groupId, expenseId, expenseData) => {
  const endpoints = groupEndpoints(groupId);
  const response = await axiosInstance.put(`${endpoints.expenses}/${expenseId}`, expenseData);
  return response.data.data;
};

// Delete expense
export const deleteExpenseAPI = async (groupId, expenseId) => {
  const endpoints = groupEndpoints(groupId);
  const response = await axiosInstance.delete(`${endpoints.expenses}/${expenseId}`);
  return response.data;
};

// Settle expense
export const settleExpenseAPI = async (groupId, expenseId, settlementData) => {
  const endpoints = groupEndpoints(groupId);
  const response = await axiosInstance.post(`${endpoints.expenses}/${expenseId}/settle`, settlementData);
  return response.data.data;
};

// ============================================
// POLLS
// ============================================

// Get group polls
export const getGroupPollsAPI = async (groupId, activeOnly = false) => {
  const endpoints = groupEndpoints(groupId);
  const params = { activeOnly };
  const response = await axiosInstance.get(endpoints.polls, { params });
  return response.data.data;
};

// Get single poll
export const getPollByIdAPI = async (groupId, pollId) => {
  const endpoints = groupEndpoints(groupId);
  const response = await axiosInstance.get(`${endpoints.polls}/${pollId}`);
  return response.data.data;
};

// Create poll
export const createPollAPI = async (groupId, pollData) => {
  const endpoints = groupEndpoints(groupId);
  const response = await axiosInstance.post(endpoints.polls, pollData);
  return response.data.data;
};

// Vote on poll
export const voteOnPollAPI = async (groupId, pollId, optionIds) => {
  const endpoints = groupEndpoints(groupId);
  const response = await axiosInstance.post(`${endpoints.polls}/${pollId}/vote`, { optionIds });
  return response.data.data;
};

// Close poll
export const closePollAPI = async (groupId, pollId) => {
  const endpoints = groupEndpoints(groupId);
  const response = await axiosInstance.put(`${endpoints.polls}/${pollId}/close`);
  return response.data.data;
};

// Delete poll
export const deletePollAPI = async (groupId, pollId) => {
  const endpoints = groupEndpoints(groupId);
  const response = await axiosInstance.delete(`${endpoints.polls}/${pollId}`);
  return response.data;
};

// ============================================
// ANNOUNCEMENTS
// ============================================

// Get group announcements
export const getGroupAnnouncementsAPI = async (groupId) => {
  const endpoints = groupEndpoints(groupId);
  const response = await axiosInstance.get(endpoints.announcements);
  return response.data.data;
};

// Create announcement
export const createAnnouncementAPI = async (groupId, announcementData) => {
  const endpoints = groupEndpoints(groupId);
  const response = await axiosInstance.post(endpoints.announcements, announcementData);
  return response.data.data;
};

// Update announcement
export const updateAnnouncementAPI = async (groupId, announcementId, announcementData) => {
  const endpoints = groupEndpoints(groupId);
  const response = await axiosInstance.put(`${endpoints.announcements}/${announcementId}`, announcementData);
  return response.data.data;
};

// Delete announcement
export const deleteAnnouncementAPI = async (groupId, announcementId) => {
  const endpoints = groupEndpoints(groupId);
  const response = await axiosInstance.delete(`${endpoints.announcements}/${announcementId}`);
  return response.data;
};
