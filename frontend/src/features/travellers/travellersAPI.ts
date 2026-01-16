import axiosInstance from '@/app/axios';
import type {
  ChatMessage,
  GroupMember,
  Group,
  InviteMember,
  Proposal,
  ProposalFormData,
  Poll,
  CreatePollData,
  Expense,
  ExpenseFormData,
  ExpenseSplit,
  Trip,
  TripFormData,
} from '@/types/travellers';

// ========== CHAT API ==========


// Chat uses conversations - messages are under /chat/messages
// Conversations are managed under /chat/conversations

interface ConversationParticipant {
  userId: number;
  role?: string;
  nickname?: string | null;
}

interface ConversationMessage {
  id?: string;
  type?: string;
  content?: string;
  senderId?: number;
  createdAt?: string;
}

interface ChatAttachment {
  type: 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO';
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
}

interface Conversation {
  id: string;
  groupId?: string | null;
  type: string;
  name?: string | null;
  imageUrl?: string | null;
  lastMessageAt?: string | null;
  participants?: ConversationParticipant[];
  lastMessage?: ConversationMessage | null;
  unreadCount?: number;
}

export const chatAPI = {
  // ============ Conversation Management ============

  /**
   * Get all conversations for current user
   */
  getConversations: async (): Promise<Conversation[]> => {
    const response = await axiosInstance.get('/chat/conversations');
    const payload = response.data.data || response.data || [];
    if (Array.isArray(payload)) {
      return payload;
    }
    return payload.conversations || [];
  },

  /**
   * Get or create a conversation for a group
   */
  getOrCreateGroupConversation: async (groupId: string, groupName: string): Promise<Conversation> => {
    // Fetch group members to build participant list
    const members = await chatAPI.getGroupMembers(groupId);
    const participantIds = Array.from(
      new Set(
        members
          .map((m: any) => Number(m.userId ?? m.id))
          .filter((id: number) => Number.isFinite(id))
      )
    );
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentUserId = Number(payload.id);
        if (Number.isFinite(currentUserId) && !participantIds.includes(currentUserId)) {
          participantIds.push(currentUserId);
        }
      } catch {
        // Ignore token parse errors
      }
    }

    // Create new group conversation
    const response = await axiosInstance.post('/chat/conversations', {
      type: 'GROUP',
      name: groupName,
      groupId: groupId,
      participantIds,
    });
    return response.data.data || response.data;
  },

  /**
   * Get or create a direct conversation with another user
   */
  getOrCreateDirectConversation: async (targetUserId: number): Promise<Conversation> => {
    const response = await axiosInstance.post('/chat/conversations', {
      type: 'DIRECT',
      participantIds: [targetUserId],
    });
    return response.data.data || response.data;
  },

  /**
   * Get a single conversation
   */
  getConversation: async (conversationId: string): Promise<Conversation> => {
    const response = await axiosInstance.get(`/chat/conversations/${conversationId}`);
    return response.data.data || response.data;
  },

  // ============ Messages ============

  /**
   * Get messages for a conversation
   */
  getMessages: async (conversationId: string, page = 1, limit = 50): Promise<{
    messages: ChatMessage[];
    hasMore: boolean;
  }> => {
    const response = await axiosInstance.get(`/chat/messages/conversation/${conversationId}`, {
      params: { page, limit },
    });
    const payload = response.data || {};
    const data = payload.data || payload;
    const messages = Array.isArray(data) ? data : (data.messages || []);
    const pagination = payload.pagination;
    const hasMore = pagination?.hasMore ?? false;
    return { messages, hasMore };
  },

  /**
   * Send a message to a conversation
   */
  sendMessage: async (
    conversationId: string,
    message: {
      content?: string;
      type: ChatMessage['type'];
      replyTo?: string;
      attachments?: ChatAttachment[];
    }
  ): Promise<ChatMessage> => {
    // Map frontend types to backend types (backend expects uppercase)
    const typeMap: Record<string, string> = {
      text: 'TEXT',
      image: 'IMAGE',
      voice: 'AUDIO',
      location: 'LOCATION',
    };
    const backendType = typeMap[message.type?.toLowerCase() || 'text'] || 'TEXT';

    const payload: Record<string, unknown> = {
      conversationId,
      type: backendType,
      replyToId: message.replyTo,
    };
    if (typeof message.content === 'string') {
      payload.content = message.content;
    }
    if (message.attachments && message.attachments.length > 0) {
      payload.attachments = message.attachments;
    }

    const response = await axiosInstance.post('/chat/messages', payload);
    return response.data.data || response.data;
  },

  /**
   * Update a message
   */
  updateMessage: async (messageId: string, content: string): Promise<ChatMessage> => {
    const response = await axiosInstance.put(`/chat/messages/${messageId}`, { content });
    return response.data.data || response.data;
  },

  /**
   * Delete a message
   */
  deleteMessage: async (messageId: string): Promise<void> => {
    await axiosInstance.delete(`/chat/messages/${messageId}`);
  },

  /**
   * Add reaction to a message
   */
  addReaction: async (messageId: string, emoji: string): Promise<void> => {
    await axiosInstance.post(`/chat/messages/${messageId}/reactions`, { emoji });
  },

  /**
   * Remove reaction from a message
   */
  removeReaction: async (messageId: string, emoji: string): Promise<void> => {
    await axiosInstance.delete(`/chat/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`);
  },

  /**
   * Mark message as read
   */
  markAsRead: async (messageId: string): Promise<void> => {
    await axiosInstance.post(`/chat/messages/${messageId}/read`);
  },

  /**
   * Search messages
   */
  searchMessages: async (query: string, conversationId?: string): Promise<ChatMessage[]> => {
    const response = await axiosInstance.get('/chat/messages/search', {
      params: { query, conversationId },
    });
    return response.data.data || response.data;
  },

  // ============ Participants ============

  /**
   * Add participant to conversation
   */
  addParticipant: async (conversationId: string, userId: string): Promise<void> => {
    await axiosInstance.post(`/chat/conversations/${conversationId}/participants`, { userId });
  },

  /**
   * Remove participant from conversation
   */
  removeParticipant: async (conversationId: string, userId: string): Promise<void> => {
    await axiosInstance.delete(`/chat/conversations/${conversationId}/participants/${userId}`);
  },

  /**
   * Mark conversation as read
   */
  markConversationAsRead: async (conversationId: string): Promise<void> => {
    await axiosInstance.post(`/chat/conversations/${conversationId}/read`);
  },

  /**
   * Mark all direct conversations with a user as read
   */
  markDirectConversationsAsRead: async (otherUserId: number): Promise<void> => {
    await axiosInstance.post(`/chat/conversations/direct/${otherUserId}/read`);
  },

  // ============ Group Members (from group service) ============

  /**
   * Get group members (uses group service, not chat service)
   */
  getGroupMembers: async (groupId: string): Promise<GroupMember[]> => {
    const response = await axiosInstance.get(`/groups/${groupId}/members`);
    const data = response.data.data || response.data;
    // API returns { members: [...], pagination: {...} } - extract the members array
    return Array.isArray(data) ? data : (data?.members || []);
  },

  // ============ Media Upload ============

  /**
   * Upload chat media (photo)
   */
  uploadChatMedia: async (
    file: File
  ): Promise<{ url: string; fileName: string; size: number; mimeType?: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post('/chat/messages/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const data = response.data.data || response.data;
    return {
      url: data.url,
      fileName: data.fileName,
      size: data.size,
      mimeType: data.mimeType,
    };
  },
};

// ========== GROUPS API ==========


const GROUPS_API_BASE = '/groups';

export const groupsAPI = {
  /**
   * Get all groups for the current user
   */
  getGroups: async (status?: 'PLANNING' | 'ON_TOUR' | 'COMPLETED'): Promise<Group[]> => {
    const params = status ? { status } : {};
    const response = await axiosInstance.get(GROUPS_API_BASE, { params });
    return response.data.data || response.data;
  },

  /**
   * Get group details with members
   */
  getGroupDetails: async (groupId: string): Promise<Group> => {
    const response = await axiosInstance.get(`${GROUPS_API_BASE}/${groupId}`);
    return response.data.data || response.data;
  },

  /**
   * Get group members
   */
  getGroupMembers: async (groupId: string): Promise<InviteMember[]> => {
    const response = await axiosInstance.get(`${GROUPS_API_BASE}/${groupId}/members`);
    const data = response.data.data || response.data;
    // API returns { members: [...], pagination: {...} } - extract the members array
    return Array.isArray(data) ? data : (data?.members || []);
  },

  /**
   * Create a new group
   */
  createGroup: async (groupData: Omit<Group, 'id' | 'inviteCode' | 'createdBy'>): Promise<Group> => {
    const response = await axiosInstance.post(GROUPS_API_BASE, groupData);
    return response.data.data || response.data;
  },

  /**
   * Update group details
   */
  updateGroup: async (groupId: string, groupData: Partial<Group>): Promise<Group> => {
    const response = await axiosInstance.put(`${GROUPS_API_BASE}/${groupId}`, groupData);
    return response.data.data || response.data;
  },

  /**
   * Delete a group
   */
  deleteGroup: async (groupId: string): Promise<void> => {
    await axiosInstance.delete(`${GROUPS_API_BASE}/${groupId}`);
  },

  /**
   * Invite a member to the group by email (uses /invitations endpoint)
   */
  inviteMember: async (groupId: string, email: string): Promise<InviteMember> => {
    const response = await axiosInstance.post(`${GROUPS_API_BASE}/${groupId}/invitations`, { email });
    return response.data.data || response.data;
  },

  /**
   * Invite a member to the group by userId (for connections)
   */
  inviteMemberByUserId: async (groupId: string, userId: number, message?: string): Promise<InviteMember> => {
    const response = await axiosInstance.post(`${GROUPS_API_BASE}/${groupId}/invitations/user`, {
      userId,
      message,
    });
    return response.data.data || response.data;
  },

  /**
   * Get pending invitations for a group
   */
  getInvitations: async (groupId: string): Promise<InviteMember[]> => {
    const response = await axiosInstance.get(`${GROUPS_API_BASE}/${groupId}/invitations`);
    return response.data.data || response.data;
  },

  /**
   * Cancel an invitation
   */
  cancelInvitation: async (groupId: string, invitationId: string): Promise<void> => {
    await axiosInstance.delete(`${GROUPS_API_BASE}/${groupId}/invitations/${invitationId}`);
  },

  /**
   * Remove a member from the group
   */
  removeMember: async (groupId: string, memberId: string): Promise<void> => {
    await axiosInstance.delete(`${GROUPS_API_BASE}/${groupId}/members/${memberId}`);
  },

  /**
   * Leave a group
   */
  leaveGroup: async (groupId: string): Promise<void> => {
    await axiosInstance.post(`${GROUPS_API_BASE}/${groupId}/leave`);
  },

  /**
   * Request to join a public group
   */
  requestToJoin: async (groupId: string): Promise<void> => {
    await axiosInstance.post(`${GROUPS_API_BASE}/${groupId}/join`);
  },

  /**
   * Preview group by invite code (before joining)
   */
  previewGroupByCode: async (inviteCode: string): Promise<{
    id: string;
    name: string;
    description?: string;
    destination?: string;
    imageUrl?: string;
    startDate?: string;
    endDate?: string;
    memberCount: number;
    spotsLeft: number;
    type: string;
  }> => {
    const response = await axiosInstance.get(`${GROUPS_API_BASE}/preview/${inviteCode}`);
    return response.data.data || response.data;
  },

  /**
   * Join a group using invite code
   */
  joinGroup: async (inviteCode: string): Promise<{ groupId: string }> => {
    const response = await axiosInstance.post(`${GROUPS_API_BASE}/join`, { inviteCode });
    return response.data.data || response.data;
  },

  /**
   * Get group stats
   */
  getGroupStats: async (groupId: string): Promise<unknown> => {
    const response = await axiosInstance.get(`${GROUPS_API_BASE}/${groupId}/stats`);
    return response.data.data || response.data;
  },

  /**
   * Search public groups
   */
  searchGroups: async (query: string, page = 1, limit = 10): Promise<Group[]> => {
    const response = await axiosInstance.get(`${GROUPS_API_BASE}/search`, { params: { q: query, page, limit } });
    return response.data.data || response.data;
  },

  // Join Request Management
  /**
   * Get pending join requests for a group (Admin only)
   */
  getJoinRequests: async (groupId: string, page = 1, limit = 10): Promise<any[]> => {
    const response = await axiosInstance.get(`${GROUPS_API_BASE}/${groupId}/join-requests`, { params: { page, limit } });
    return response.data.data || response.data;
  },

  /**
   * Approve or reject a join request (Admin only)
   */
  handleJoinRequest: async (
    groupId: string,
    requestId: string,
    action: 'approve' | 'reject',
    reason?: string
  ): Promise<any> => {
    const response = await axiosInstance.put(`${GROUPS_API_BASE}/${groupId}/join-requests/${requestId}`, {
      action,
      reason,
    });
    return response.data.data || response.data;
  },

  // Member Management - Advanced
  /**
   * Update member role (Owner only)
   */
  updateMemberRole: async (
    groupId: string,
    memberId: string,
    role: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER'
  ): Promise<any> => {
    const response = await axiosInstance.put(`${GROUPS_API_BASE}/${groupId}/members/${memberId}`, { role });
    return response.data.data || response.data;
  },

  /**
   * Update RSVP status
   */
  updateRSVP: async (
    groupId: string,
    status: 'PENDING' | 'GOING' | 'MAYBE' | 'NOT_GOING'
  ): Promise<any> => {
    const response = await axiosInstance.put(`${GROUPS_API_BASE}/${groupId}/rsvp`, { status });
    return response.data.data || response.data;
  },

  // Proposal/Poll endpoints (using polls backend)
  /**
   * Create a proposal (uses polls endpoint)
   */
  createProposal: async (groupId: string, proposalData: ProposalFormData): Promise<Proposal> => {
    const payload = {
      question: proposalData.title,
      description: proposalData.description,
      type: 'SINGLE_CHOICE',
      options: [
        { text: 'Yes, I approve' },
        { text: 'No, I disagree' },
      ],
      endsAt: proposalData.deadline,
    };
    const response = await axiosInstance.post(`${GROUPS_API_BASE}/${groupId}/polls`, payload);
    return response.data.data || response.data;
  },

  /**
   * Create a poll with options
   */
  createPoll: async (groupId: string, pollData: CreatePollData): Promise<Poll> => {
    // Transform options from strings to objects (backend expects { text: string } format)
    const transformedData = {
      ...pollData,
      options: pollData.options.map((opt) => (typeof opt === 'string' ? { text: opt } : opt)),
    };
    const response = await axiosInstance.post(`${GROUPS_API_BASE}/${groupId}/polls`, transformedData);
    return response.data.data || response.data;
  },

  /**
   * Vote on a poll
   */
  voteOnPoll: async (groupId: string, pollId: string, optionId: string): Promise<Poll> => {
    const response = await axiosInstance.post(`${GROUPS_API_BASE}/${groupId}/polls/${pollId}/vote`, {
      optionIds: [optionId],
    });
    return response.data.data || response.data;
  },

  /**
   * Add a poll option
   */
  addPollOption: async (groupId: string, pollId: string, text: string): Promise<Poll> => {
    const response = await axiosInstance.post(`${GROUPS_API_BASE}/${groupId}/polls/${pollId}/options`, { text });
    return response.data.data || response.data;
  },

  /**
   * Remove a poll option
   */
  removePollOption: async (groupId: string, pollId: string, optionId: string): Promise<Poll> => {
    const response = await axiosInstance.delete(`${GROUPS_API_BASE}/${groupId}/polls/${pollId}/options/${optionId}`);
    return response.data.data || response.data;
  },

  /**
   * Vote on a proposal (legacy)
   */
  voteOnProposal: async (groupId: string, pollId: string, optionId: string): Promise<Proposal> => {
    const response = await axiosInstance.post(`${GROUPS_API_BASE}/${groupId}/polls/${pollId}/vote`, {
      optionIds: [optionId],
    });
    return response.data.data || response.data;
  },

  /**
   * Get polls for a group
   */
  getPolls: async (groupId: string): Promise<Poll[]> => {
    const response = await axiosInstance.get(`${GROUPS_API_BASE}/${groupId}/polls`);
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  },

  /**
   * Get single poll details with results
   */
  getPollDetails: async (groupId: string, pollId: string): Promise<Poll> => {
    const response = await axiosInstance.get(`${GROUPS_API_BASE}/${groupId}/polls/${pollId}`);
    return response.data.data || response.data;
  },

  /**
   * Close a poll manually
   */
  closePoll: async (groupId: string, pollId: string): Promise<Poll> => {
    const response = await axiosInstance.put(`${GROUPS_API_BASE}/${groupId}/polls/${pollId}/close`);
    return response.data.data || response.data;
  },

  /**
   * Delete a poll (Admin only)
   */
  deletePoll: async (groupId: string, pollId: string): Promise<void> => {
    await axiosInstance.delete(`${GROUPS_API_BASE}/${groupId}/polls/${pollId}`);
  },

  /**
   * Update group status (Start Early / End Early / Reset Dates)
   */
  updateGroupStatus: async (
    groupId: string,
    action: 'START_EARLY' | 'END_EARLY' | 'RESET_DATES' | 'EXTEND_TRIP',
    payload?: { extendByDays?: number; newEndDate?: string }
  ): Promise<Group> => {
    const response = await axiosInstance.put(`${GROUPS_API_BASE}/${groupId}/status`, { action, ...payload });
    return response.data.data || response.data;
  },
};

// ========== TRIPS API ==========


const TRIPS_API_BASE = '/trips';

export const tripsAPI = {
  /**
   * Get all trips for the current user
   */
  getTrips: async (): Promise<Trip[]> => {
    const response = await axiosInstance.get(TRIPS_API_BASE);
    return response.data.data || response.data;
  },

  /**
   * Get a single trip by ID
   */
  getTrip: async (tripId: string): Promise<Trip> => {
    const response = await axiosInstance.get(`${TRIPS_API_BASE}/${tripId}`);
    return response.data.data || response.data;
  },

  /**
   * Create a new trip
   */
  createTrip: async (tripData: TripFormData): Promise<Trip> => {
    const response = await axiosInstance.post(TRIPS_API_BASE, tripData);
    return response.data.data || response.data;
  },

  /**
   * Update an existing trip
   */
  updateTrip: async (tripId: string, tripData: Partial<TripFormData>): Promise<Trip> => {
    const response = await axiosInstance.put(`${TRIPS_API_BASE}/${tripId}`, tripData);
    return response.data.data || response.data;
  },

  /**
   * Delete a trip
   */
  deleteTrip: async (tripId: string): Promise<void> => {
    await axiosInstance.delete(`${TRIPS_API_BASE}/${tripId}`);
  },

  /**
   * Join a trip using invite code
   */
  joinTrip: async (inviteCode: string): Promise<Trip> => {
    const response = await axiosInstance.post(`${TRIPS_API_BASE}/join`, { inviteCode });
    return response.data.data || response.data;
  },

  /**
   * Generate a new invite code for a trip
   */
  generateInviteCode: async (tripId: string): Promise<string> => {
    const response = await axiosInstance.post(`${TRIPS_API_BASE}/${tripId}/invite-code`);
    return response.data.data?.inviteCode || response.data.inviteCode;
  },
};

// ========== EXPENSES API ==========


// Per-Split Settlement Types
export interface PendingSplit {
  id: string;
  expenseId: string;
  expenseTitle: string;
  amount: number;
  currency: string;
  groupName: string;
  payerName: string;
  payerAvatar?: string;
  isSettled: boolean;
}

export interface SettlementSummary {
  totalOwed: number;
  totalSettled: number;
  pendingCount: number;
  settledCount: number;
  currency: string;
}

export interface SettlementData {
  method?: string;  // e.g., "Cash", "UPI", "Bank Transfer", "PayPal"
  note?: string;
}

export interface BatchSettleResult {
  settledCount: number;
  splits: string[];
}

// Expenses are nested under groups: /groups/:groupId/expenses
const getExpenseBase = (groupId: string) => `/groups/${groupId}/expenses`;

const mapExpenseCategory = (category: string): string => {
  const normalized = (category || '').trim().toUpperCase();
  switch (normalized) {
    case 'LODGING':
    case 'ACCOMMODATION':
      return 'ACCOMMODATION';
    case 'ATTRACTIONS':
    case 'ACTIVITY':
    case 'ACTIVITIES':
    case 'SIGHTSEEING':
      return 'ACTIVITIES';
    case 'TRANSPORT':
      return 'TRANSPORT';
    case 'FOOD':
      return 'FOOD';
    case 'SHOPPING':
      return 'SHOPPING';
    case 'TIPS':
      return 'TIPS';
    default:
      return 'OTHER';
  }
};

const normalizeExpense = (expense: any): Expense => {
  const paidById = expense.paidBy !== undefined ? String(expense.paidBy) : '';
  const description = expense.description || expense.title || '';
  const splits: ExpenseSplit[] | undefined = Array.isArray(expense.splits)
    ? expense.splits.map((split: any) => ({
        id: split.id,
        userId: split.userId,
        amount: Number(split.amount),
        isSettled: Boolean(split.isSettled),
      }))
    : undefined;

  const settled = splits ? splits.every((s) => s.isSettled) : Boolean(expense.isSettled);

  return {
    id: expense.id,
    title: expense.title,
    description,
    amount: Number(expense.amount),
    category: expense.category,
    paidBy: paidById,
    paidById,
    paidByName: expense.paidByName,
    paidByAvatar: expense.paidByAvatar,
    splitWith: splits ? splits.filter((s) => String(s.userId) !== paidById).map((s) => String(s.userId)) : [],
    splits,
    date: expense.date || expense.createdAt || new Date().toISOString(),
    settled,
  };
};

export const expensesAPI = {
  /**
   * Get all expenses for a group
   */
  getExpenses: async (groupId: string): Promise<Expense[]> => {
    const response = await axiosInstance.get(getExpenseBase(groupId));
    const data = response.data.data || response.data;
    const expenses = Array.isArray(data) ? data : (data?.data || data?.expenses || []);
    return expenses.map(normalizeExpense);
  },

  /**
   * Add a new expense to a group
   */
  addExpense: async (groupId: string, expenseData: ExpenseFormData): Promise<Expense> => {
    const splitType = expenseData.splitType === 'custom' ? 'EXACT' : 'EQUAL';
    const splits =
      splitType === 'EXACT'
        ? expenseData.splits.map((split) => ({
            userId: Number(split.memberId),
            amount: split.amount,
          }))
        : undefined;

    const payload = {
      title: expenseData.description,
      description: expenseData.description,
      amount: expenseData.amount,
      category: mapExpenseCategory(expenseData.category),
      paidBy: Number(expenseData.paidBy),
      splitType,
      ...(splits ? { splits } : {}),
    };

    const response = await axiosInstance.post(getExpenseBase(groupId), payload);
    return normalizeExpense(response.data.data || response.data);
  },

  /**
   * Update an expense
   */
  updateExpense: async (groupId: string, expenseId: string, expenseData: Partial<ExpenseFormData>): Promise<Expense> => {
    const payload: Record<string, unknown> = {};
    if (expenseData.description) {
      payload.title = expenseData.description;
      payload.description = expenseData.description;
    }
    if (expenseData.amount !== undefined) {
      payload.amount = expenseData.amount;
    }
    if (expenseData.category) {
      payload.category = mapExpenseCategory(expenseData.category);
    }

    const response = await axiosInstance.put(`${getExpenseBase(groupId)}/${expenseId}`, payload);
    return normalizeExpense(response.data.data || response.data);
  },

  /**
   * Delete an expense
   */
  deleteExpense: async (groupId: string, expenseId: string): Promise<void> => {
    await axiosInstance.delete(`${getExpenseBase(groupId)}/${expenseId}`);
  },

  /**
   * Mark an expense as settled (uses POST, not PATCH)
   */
  settleExpense: async (
    groupId: string,
    expenseId: string,
    settlement: { userId: number; amount: number }
  ): Promise<Expense> => {
    const response = await axiosInstance.post(`${getExpenseBase(groupId)}/${expenseId}/settle`, settlement);
    return normalizeExpense(response.data.data || response.data);
  },

  /**
   * Get expense summary for a group
   */
  getExpenseSummary: async (groupId: string): Promise<{
    totalExpenses: number;
    expenseCount: number;
    myBalance: { paid: number; owes: number; balance: number };
    memberBalances: Record<string, { paid: number; owes: number; balance: number }>;
  }> => {
    const response = await axiosInstance.get(`${getExpenseBase(groupId)}/summary`);
    return response.data.data || response.data;
  },

  /**
   * Get settlement suggestions for a group
   */
  getSettlementSuggestions: async (groupId: string): Promise<unknown> => {
    const response = await axiosInstance.get(`${getExpenseBase(groupId)}/settlements`);
    return response.data.data || response.data;
  },

  // ============ Per-Split Settlement Methods ============

  /**
   * Get my pending splits (across all groups or specific group)
   * @param groupId - Optional group ID to filter by
   */
  getMyPendingSplits: async (groupId?: string): Promise<PendingSplit[]> => {
    const params = groupId ? { groupId } : {};
    const response = await axiosInstance.get(`/groups/splits/pending`, { params });
    return response.data.data || response.data;
  },

  /**
   * Settle a single split
   * @param splitId - Split ID to settle
   * @param settlementData - Settlement method and note
   */
  settleSplit: async (splitId: string, settlementData?: SettlementData): Promise<void> => {
    await axiosInstance.put(`/groups/splits/${splitId}/settle`, settlementData || {});
  },

  /**
   * Batch settle multiple splits
   * @param splitIds - Array of split IDs to settle
   * @param settlementData - Settlement method and note
   */
  batchSettleSplits: async (
    splitIds: string[],
    settlementData?: SettlementData
  ): Promise<BatchSettleResult> => {
    const response = await axiosInstance.post(`/groups/splits/settle/batch`, {
      splitIds,
      ...settlementData,
    });
    return response.data.data || response.data;
  },

  /**
   * Get settlement summary for a group
   * @param groupId - Group ID to get summary for
   */
  getSettlementSummary: async (groupId: string): Promise<SettlementSummary> => {
    const response = await axiosInstance.get(`/groups/${groupId}/settlement-summary`);
    return response.data.data || response.data;
  },
};

// ========== INVITATIONS API ==========


export interface GroupInvitation {
  id: string;
  groupId: string;
  invitedUserId?: number;
  invitedEmail?: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | 'CANCELLED';
  message?: string;
  expiresAt: string;
  createdAt: string;
  respondedAt?: string;
  group: {
    name: string;
    description?: string;
    destination?: string;
    imageUrl?: string;
    startDate?: string;
    endDate?: string;
    memberCount: number;
  };
  inviter?: {
    name: string;
    profilePicUrl?: string;
  };
}

export const invitationsAPI = {
  /**
   * Invite a user to a group by userId (for connections)
   * @param groupId - Group ID to invite to
   * @param userId - User ID to invite
   * @param message - Optional personal message
   */
  inviteByUserId: async (groupId: string, userId: number, message?: string): Promise<GroupInvitation> => {
    const response = await axiosInstance.post(`/groups/${groupId}/invitations/user`, {
      userId,
      message,
    });
    return response.data.data || response.data;
  },

  /**
   * Invite a user to a group by email
   * @param groupId - Group ID to invite to
   * @param email - Email address to invite
   * @param message - Optional personal message
   */
  inviteByEmail: async (groupId: string, email: string, message?: string): Promise<GroupInvitation> => {
    const response = await axiosInstance.post(`/groups/${groupId}/invitations`, {
      email,
      message,
    });
    return response.data.data || response.data;
  },

  /**
   * Get all invitations for a group (Admin only)
   * @param groupId - Group ID
   */
  getGroupInvitations: async (groupId: string): Promise<GroupInvitation[]> => {
    const response = await axiosInstance.get(`/groups/${groupId}/invitations`);
    return response.data.data || response.data;
  },

  /**
   * Get current user's received invitations
   */
  getMyInvitations: async (): Promise<GroupInvitation[]> => {
    const response = await axiosInstance.get(`/groups/invitations/my`);
    return response.data.data || response.data;
  },

  /**
   * Accept a group invitation
   * @param invitationId - Invitation ID to accept
   */
  acceptInvitation: async (invitationId: string): Promise<{ success: boolean; groupId: string }> => {
    const response = await axiosInstance.post(`/groups/invitations/${invitationId}/accept`);
    return response.data.data || response.data;
  },

  /**
   * Decline a group invitation
   * @param invitationId - Invitation ID to decline
   */
  declineInvitation: async (invitationId: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.post(`/groups/invitations/${invitationId}/decline`);
    return response.data.data || response.data;
  },

  /**
   * Cancel an invitation (by inviter or admin)
   * @param invitationId - Invitation ID to cancel
   */
  cancelInvitation: async (invitationId: string): Promise<{ success: boolean; message: string }> => {
    await axiosInstance.delete(`/groups/invitations/${invitationId}`);
    return { success: true, message: 'Invitation cancelled' };
  },
};

// ========== ITINERARY API ==========


export interface ItineraryItem {
  id: string;
  groupId: string;
  title: string;
  description?: string;
  location?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  date: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  category: 'TRANSPORT' | 'ACCOMMODATION' | 'ACTIVITY' | 'FOOD' | 'SIGHTSEEING' | 'FREE_TIME' | 'OTHER';
  bookingId?: string;
  estimatedCost?: number;
  actualCost?: number;
  isConfirmed: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  voteCount?: number;
  userVoted?: boolean;
}

export interface ItineraryFormData {
  title: string;
  description?: string;
  location?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  date: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  category: 'TRANSPORT' | 'ACCOMMODATION' | 'ACTIVITY' | 'FOOD' | 'SIGHTSEEING' | 'FREE_TIME' | 'OTHER';
  estimatedCost?: number;
}

const ITINERARY_API_BASE = '/groups';

export const itineraryAPI = {
  /**
   * Get itinerary for a group
   */
  getItinerary: async (groupId: string, date?: string): Promise<ItineraryItem[]> => {
    const params = date ? { date } : {};
    const response = await axiosInstance.get(`${ITINERARY_API_BASE}/${groupId}/itinerary`, { params });
    return response.data.data || response.data;
  },

  /**
   * Create itinerary item
   */
  createItineraryItem: async (groupId: string, data: ItineraryFormData): Promise<ItineraryItem> => {
    const response = await axiosInstance.post(`${ITINERARY_API_BASE}/${groupId}/itinerary`, data);
    return response.data.data || response.data;
  },

  /**
   * Update itinerary item
   */
  updateItineraryItem: async (
    groupId: string,
    itemId: string,
    data: Partial<ItineraryFormData>
  ): Promise<ItineraryItem> => {
    const response = await axiosInstance.put(`${ITINERARY_API_BASE}/${groupId}/itinerary/${itemId}`, data);
    return response.data.data || response.data;
  },

  /**
   * Delete itinerary item
   */
  deleteItineraryItem: async (groupId: string, itemId: string): Promise<void> => {
    await axiosInstance.delete(`${ITINERARY_API_BASE}/${groupId}/itinerary/${itemId}`);
  },

  /**
   * Vote on itinerary item
   */
  voteOnItineraryItem: async (
    groupId: string,
    itemId: string,
    vote: 'UP' | 'DOWN'
  ): Promise<any> => {
    const response = await axiosInstance.post(`${ITINERARY_API_BASE}/${groupId}/itinerary/${itemId}/vote`, { vote });
    return response.data.data || response.data;
  },

  /**
   * Confirm itinerary item (Admin only)
   */
  confirmItineraryItem: async (groupId: string, itemId: string): Promise<ItineraryItem> => {
    const response = await axiosInstance.put(`${ITINERARY_API_BASE}/${groupId}/itinerary/${itemId}/confirm`);
    return response.data.data || response.data;
  },
};

// ========== CONNECTIONS API ==========


export interface Connection {
  id: string;
  userId: number;
  name: string;
  profileImage?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface PendingConnectionUser {
  id: number;
  authId?: number;
  name?: string;
  profilePicUrl?: string;
  bio?: string;
  travelStyle?: string;
  interests?: string[];
  isVerified?: boolean;
}

export interface PendingConnectionRequest {
  connectionId: number;
  message?: string | null;
  requestedAt: string;
  user: PendingConnectionUser;
}

export interface ConnectedUser {
  id: number;
  authId?: number;
  name?: string;
  profilePicUrl?: string;
  bio?: string;
  travelStyle?: string;
  isVerified?: boolean;
  currentLocationName?: string;
}

export interface AcceptedConnection {
  connectionId: number;
  connectedAt?: string | null;
  user: ConnectedUser;
}

export interface ConnectionsResponse {
  connections: AcceptedConnection[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PendingRequestsResponse {
  requests: PendingConnectionRequest[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const connectionsAPI = {
  /**
   * Send connection request to another user
   * @param targetUserId - User ID to send connection request to
   * @param message - Optional message with the connection request
   */
  sendConnectionRequest: async (targetUserId: number, message?: string): Promise<void> => {
    await axiosInstance.post(`/users/connections/request`, {
      userId: targetUserId,
      message,
    });
  },

  /**
   * Accept a connection request
   * @param connectionId - ID of the connection request to accept
   */
  acceptConnection: async (connectionId: string): Promise<void> => {
    await axiosInstance.post(`/users/connections/${connectionId}/accept`);
  },

  /**
   * Reject a connection request
   * @param connectionId - ID of the connection request to reject
   */
  rejectConnection: async (connectionId: string): Promise<void> => {
    await axiosInstance.post(`/users/connections/${connectionId}/reject`);
  },

  /**
   * Cancel a sent connection request
   * @param connectionId - ID of the connection request to cancel
   */
  cancelConnectionRequest: async (connectionId: string): Promise<void> => {
    await axiosInstance.delete(`/users/connections/request/${connectionId}`);
  },

  /**
   * Get all connections (accepted friends)
   * @param page - Page number
   * @param limit - Number of connections per page
   */
  getConnections: async (page: number = 1, limit: number = 20): Promise<ConnectionsResponse> => {
    const response = await axiosInstance.get(`/users/connections`, {
      params: { page, limit },
    });
    const payload = response.data.data || response.data || {};
    return {
      connections: payload.connections || [],
      pagination: payload.pagination,
    };
  },

  /**
   * Get pending connection requests (received)
   */
  getPendingRequests: async (): Promise<PendingRequestsResponse> => {
    const response = await axiosInstance.get(`/users/connections/pending`);
    const payload = response.data.data || response.data || {};
    return {
      requests: payload.requests || [],
      pagination: payload.pagination,
    };
  },

  /**
   * Get sent connection requests
   */
  getSentRequests: async (): Promise<PendingRequestsResponse> => {
    const response = await axiosInstance.get(`/users/connections/sent`);
    const payload = response.data.data || response.data || {};
    return {
      requests: payload.requests || [],
      pagination: payload.pagination,
    };
  },

  /**
   * Get connection status with a specific user
   * @param userId - User ID to check connection status with
   */
  getConnectionStatus: async (userId: number): Promise<{ status: 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED' }> => {
    const response = await axiosInstance.get(`/users/connections/${userId}/status`);
    return response.data.data || response.data;
  },

  /**
   * Remove a connection (unfriend)
   * @param userId - User ID to remove connection with
   */
  removeConnection: async (userId: number): Promise<void> => {
    await axiosInstance.delete(`/users/connections/${userId}`);
  },
};

// ========== TRAVELLERS API ==========


export interface NearbyTraveller {
  id: string;
  userId: number;
  name: string;
  age?: number;
  profileImage: string;
  isNew: boolean;
  currentLocation: string;
  destination: string;
  whyConnect: string[];
  interests: string[];
  languages: string[];
  travelDates: string;
  groupName: string;
  groupId: string;
  status: 'PLANNING' | 'ON_TOUR' | 'COMPLETED';
  connectionStatus: 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'BLOCKED';
  connectionId?: number | null;
}

export interface ConnectionRequestResult {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'BLOCKED';
}

export interface TravellersNearbyStats {
  total: number;
  destinations: string[];
}

export interface TravellersNearbyResponse {
  travellers: NearbyTraveller[];
  stats: TravellersNearbyStats;
}

export interface NearbyGroup {
  id: string;
  name: string;
  imageUrl?: string | null;
  destination: string;
  travelDates: string;
  startDate?: string | null;
  endDate?: string | null;
  memberCount: number;
  maxMembers: number;
  spotsLeft: number;
  status: 'PLANNING';
  joinStatus: 'NONE' | 'PENDING' | 'REJECTED' | 'APPROVED';
}

export interface NearbyGroupsStats {
  total: number;
  destinations: string[];
}

export interface NearbyGroupsResponse {
  groups: NearbyGroup[];
  stats: NearbyGroupsStats;
}

export interface NearbyInboxItem {
  conversationId: string;
  userId: number;
  name: string;
  profileImage?: string | null;
  destination?: string | null;
  travelDates?: string | null;
  lastMessage?: {
    id?: string;
    content?: string;
    type?: string;
    createdAt?: string;
  } | null;
  unreadCount: number;
  lastMessageAt?: string | null;
}

export interface NearbyInboxStats {
  total: number;
  unread: number;
  destinations: string[];
}

export interface NearbyInboxResponse {
  conversations: NearbyInboxItem[];
  stats: NearbyInboxStats;
}

export const travellersAPI = {
  /**
   * Get all public group destinations
   */
  getDestinations: async (): Promise<string[]> => {
    const response = await axiosInstance.get(`/groups/destinations`);
    const payload = response.data.data || response.data || {};
    if (Array.isArray(payload)) {
      return payload;
    }
    return payload.destinations || [];
  },

  /**
   * Get interest suggestions
   */
  getInterestSuggestions: async (query: string, limit: number = 8): Promise<string[]> => {
    const params: any = {};
    if (query) params.q = query;
    if (limit) params.limit = limit;
    const response = await axiosInstance.get(`/users/interests/suggestions`, { params });
    const payload = response.data.data || response.data || {};
    if (Array.isArray(payload)) {
      return payload;
    }
    return payload.suggestions || [];
  },

  /**
   * Get travelers nearby (same destination with date overlap, ON_TOUR only)
   * @param destination - Optional specific destination to filter by
   */
  getTravellersNearby: async (
    destination?: string,
    manual?: boolean,
    startDate?: string,
    endDate?: string,
    feed?: boolean
  ): Promise<TravellersNearbyResponse> => {
    const params: any = {};
    if (destination) params.destination = destination;
    if (manual) params.manual = true;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (feed) params.feed = true;

    const response = await axiosInstance.get(`/groups/travelers-by-destination`, { params });
    return response.data.data || response.data;
  },

  /**
   * Get nearby public planning groups
   * @param destination - Optional destination to filter by
   */
  getNearbyGroups: async (
    destination?: string,
    startDate?: string,
    endDate?: string,
    feed?: boolean
  ): Promise<NearbyGroupsResponse> => {
    const params: any = {};
    if (destination) params.destination = destination;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (feed) params.feed = true;
    const response = await axiosInstance.get(`/groups/nearby-groups`, { params });
    return response.data.data || response.data;
  },

  /**
   * Get nearby inbox conversations (direct chats with nearby travellers)
   * @param destination - Optional destination to filter by
   */
  getNearbyInbox: async (
    destination?: string,
    startDate?: string,
    endDate?: string
  ): Promise<NearbyInboxResponse> => {
    const params: any = {};
    if (destination) params.destination = destination;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await axiosInstance.get(`/groups/nearby-inbox`, { params });
    return response.data.data || response.data;
  },

  /**
   * Send connection request to another traveller
   * @param targetUserId - User ID to send connection request to
   */
  sendConnectionRequest: async (targetUserId: number): Promise<ConnectionRequestResult | null> => {
    const response = await axiosInstance.post(`/users/connections/request`, { userId: targetUserId });
    return response.data.data || response.data;
  },

  /**
   * Cancel a sent connection request
   * @param connectionId - Connection ID to cancel
   */
  cancelConnectionRequest: async (connectionId: string): Promise<void> => {
    await axiosInstance.delete(`/users/connections/request/${connectionId}`);
  },
};
