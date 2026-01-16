const messageService = require('../services/message.service');
const uploadService = require('../services/uploadService');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * Get messages for a conversation
 */
const getMessages = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, before, after } = req.query;
    const result = await messageService.getMessages(
      req.params.conversationId,
      req.user.id,
      { page: parseInt(page), limit: parseInt(limit), before, after }
    );
    return ApiResponse.paginated(res, result.messages, result.pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * Send a new message
 */
const sendMessage = async (req, res, next) => {
  try {
    const message = await messageService.sendMessage(req.user.id, req.body);
    return ApiResponse.created(res, message);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a message
 */
const updateMessage = async (req, res, next) => {
  try {
    const message = await messageService.updateMessage(
      req.params.messageId,
      req.user.id,
      req.body.content
    );
    return ApiResponse.success(res, message, 'Message updated');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a message
 */
const deleteMessage = async (req, res, next) => {
  try {
    await messageService.deleteMessage(req.params.messageId, req.user.id);
    return ApiResponse.success(res, null, 'Message deleted');
  } catch (error) {
    next(error);
  }
};

/**
 * Add reaction to a message
 */
const addReaction = async (req, res, next) => {
  try {
    const { emoji } = req.body;
    const reaction = await messageService.addReaction(
      req.params.messageId,
      req.user.id,
      emoji
    );
    return ApiResponse.created(res, reaction);
  } catch (error) {
    next(error);
  }
};

/**
 * Remove reaction from a message
 */
const removeReaction = async (req, res, next) => {
  try {
    await messageService.removeReaction(
      req.params.messageId,
      req.user.id,
      req.params.emoji
    );
    return ApiResponse.success(res, null, 'Reaction removed');
  } catch (error) {
    next(error);
  }
};

/**
 * Mark message as read
 */
const markAsRead = async (req, res, next) => {
  try {
    await messageService.markAsRead(req.params.messageId, req.user.id);
    return ApiResponse.success(res, null, 'Marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * Search messages
 */
const searchMessages = async (req, res, next) => {
  try {
    const { q, conversationId, page = 1, limit = 20 } = req.query;
    const result = await messageService.searchMessages(
      req.user.id,
      { query: q, conversationId, page: parseInt(page), limit: parseInt(limit) }
    );
    return ApiResponse.paginated(res, result.messages, result.pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * Upload chat media (photo)
 */
const uploadMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      throw ApiError.badRequest('No file provided');
    }

    const result = await uploadService.uploadChatMedia(req.file, req.user.id);

    return ApiResponse.success(res, {
      url: result.url,
      fileName: result.fileName,
      originalName: result.originalName,
      size: result.size,
      mimeType: result.mimeType,
    }, 'File uploaded successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMessages,
  sendMessage,
  updateMessage,
  deleteMessage,
  addReaction,
  removeReaction,
  markAsRead,
  searchMessages,
  uploadMedia,
};
