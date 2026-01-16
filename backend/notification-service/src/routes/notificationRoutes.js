// ==============================================================================
// Notification Routes
// ==============================================================================

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate, serviceAuth, authorize } = require('../middleware/auth');

// Public routes (none)

// Protected routes (require authentication)
router.use(authenticate);

// Get user's notifications
router.get('/', notificationController.getNotifications);

// Get unread count
router.get('/unread-count', notificationController.getUnreadCount);

// Mark single notification as read
router.post('/:id/read', notificationController.markAsRead);

// Mark all notifications as read
router.post('/read-all', notificationController.markAllAsRead);

// Notification preferences
router.get('/preferences', notificationController.getPreferences);
router.put('/preferences', notificationController.updatePreferences);

// Push token management
router.post('/push-token', notificationController.registerPushToken);
router.delete('/push-token', notificationController.removePushToken);

// Service/Admin endpoints
router.post('/send', serviceAuth, notificationController.sendNotification);
router.post('/send-bulk', authorize('ADMIN'), notificationController.sendBulkNotification);

module.exports = router;
