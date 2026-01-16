const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversation.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createConversationSchema, updateConversationSchema } = require('../validators/conversation.validator');

// All routes require authentication
router.use(authenticate);

// Get all conversations for current user
router.get('/', conversationController.getConversations);

// Get single conversation
router.get('/:conversationId', conversationController.getConversation);

// Create new conversation (direct or group)
router.post('/', validate(createConversationSchema), conversationController.createConversation);

// Update conversation (name, description for group chats)
router.put('/:conversationId', validate(updateConversationSchema), conversationController.updateConversation);

// Delete/leave conversation
router.delete('/:conversationId', conversationController.deleteConversation);

// Participant management
router.post('/:conversationId/participants', conversationController.addParticipant);
router.delete('/:conversationId/participants/:userId', conversationController.removeParticipant);

// Mark all direct conversations with a user as read
router.post('/direct/:otherUserId/read', conversationController.markDirectAsRead);

// Mark conversation as read
router.post('/:conversationId/read', conversationController.markAsRead);

// Mute/unmute conversation
router.post('/:conversationId/mute', conversationController.muteConversation);
router.delete('/:conversationId/mute', conversationController.unmuteConversation);

module.exports = router;
