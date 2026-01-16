const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { sendMessageSchema, updateMessageSchema } = require('../validators/message.validator');
const { uploadMedia } = require('../middleware/upload');

// All routes require authentication
router.use(authenticate);

// Upload chat media (photo)
router.post('/upload', uploadMedia, messageController.uploadMedia);

// Get messages for a conversation
router.get('/conversation/:conversationId', messageController.getMessages);

// Send a message
router.post('/', validate(sendMessageSchema), messageController.sendMessage);

// Update a message
router.put('/:messageId', validate(updateMessageSchema), messageController.updateMessage);

// Delete a message
router.delete('/:messageId', messageController.deleteMessage);

// React to a message
router.post('/:messageId/reactions', messageController.addReaction);
router.delete('/:messageId/reactions/:emoji', messageController.removeReaction);

// Mark message as read
router.post('/:messageId/read', messageController.markAsRead);

// Search messages
router.get('/search', messageController.searchMessages);

module.exports = router;
