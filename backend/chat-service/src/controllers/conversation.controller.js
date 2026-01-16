const conversationService = require('../services/conversation.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * Get all conversations for the authenticated user
 */
const getConversations = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await conversationService.getUserConversations(
      req.user.id,
      parseInt(page),
      parseInt(limit)
    );
    return ApiResponse.paginated(res, result.conversations, result.pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single conversation by ID
 */
const getConversation = async (req, res, next) => {
  try {
    const conversation = await conversationService.getConversationById(
      req.params.conversationId,
      req.user.id
    );
    return ApiResponse.success(res, conversation);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new conversation
 * Supports both authenticated user requests and internal service calls
 */
const createConversation = async (req, res, next) => {
  try {
    // Support both authenticated user requests and internal service calls
    const userId = req.user?.id || (req.headers['x-user-auth-id'] ? parseInt(req.headers['x-user-auth-id']) : null);

    if (!userId) {
      throw ApiError.unauthorized('User ID is required');
    }

    const conversation = await conversationService.createConversation(
      userId,
      req.body,
      req.headers.authorization
    );
    return ApiResponse.created(res, conversation);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a conversation
 */
const updateConversation = async (req, res, next) => {
  try {
    const conversation = await conversationService.updateConversation(
      req.params.conversationId,
      req.user.id,
      req.body
    );
    return ApiResponse.success(res, conversation, 'Conversation updated');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete/leave a conversation
 */
const deleteConversation = async (req, res, next) => {
  try {
    await conversationService.leaveConversation(
      req.params.conversationId,
      req.user.id
    );
    return ApiResponse.success(res, null, 'Left conversation');
  } catch (error) {
    next(error);
  }
};

/**
 * Add a participant to a conversation
 */
const addParticipant = async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    const result = await conversationService.addParticipant(
      req.params.conversationId,
      req.user.id,
      userId,
      role
    );
    return ApiResponse.success(res, result, 'Participant added');
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a participant from a conversation
 */
const removeParticipant = async (req, res, next) => {
  try {
    await conversationService.removeParticipant(
      req.params.conversationId,
      req.user.id,
      parseInt(req.params.userId)
    );
    return ApiResponse.success(res, null, 'Participant removed');
  } catch (error) {
    next(error);
  }
};

/**
 * Mark conversation as read
 */
const markAsRead = async (req, res, next) => {
  try {
    await conversationService.markConversationAsRead(
      req.params.conversationId,
      req.user.id
    );
    return ApiResponse.success(res, null, 'Marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all direct conversations with a user as read
 */
const markDirectAsRead = async (req, res, next) => {
  try {
    const otherUserId = parseInt(req.params.otherUserId, 10);
    if (Number.isNaN(otherUserId)) {
      throw ApiError.badRequest('Invalid user ID');
    }
    await conversationService.markDirectConversationsAsRead(req.user.id, otherUserId);
    return ApiResponse.success(res, null, 'Marked direct conversations as read');
  } catch (error) {
    next(error);
  }
};

/**
 * Mute a conversation
 */
const muteConversation = async (req, res, next) => {
  try {
    const { until } = req.body;
    await conversationService.muteConversation(
      req.params.conversationId,
      req.user.id,
      until
    );
    return ApiResponse.success(res, null, 'Conversation muted');
  } catch (error) {
    next(error);
  }
};

/**
 * Unmute a conversation
 */
const unmuteConversation = async (req, res, next) => {
  try {
    await conversationService.unmuteConversation(
      req.params.conversationId,
      req.user.id
    );
    return ApiResponse.success(res, null, 'Conversation unmuted');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConversations,
  getConversation,
  createConversation,
  updateConversation,
  deleteConversation,
  addParticipant,
  removeParticipant,
  markAsRead,
  markDirectAsRead,
  muteConversation,
  unmuteConversation,
};
