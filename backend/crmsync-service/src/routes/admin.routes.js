const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { asyncHandler } = require('../../../shared/src/middleware/asyncHandler');
const { authenticate, authorize } = require('../../../shared/src/middleware/auth');

// All routes require ADMIN role
router.use(authenticate);
router.use(authorize(['ADMIN']));

// Dashboard & Analytics
router.get('/dashboard', asyncHandler(adminController.getDashboard.bind(adminController)));
router.get('/analytics', asyncHandler(adminController.getAnalytics.bind(adminController)));
router.post('/analytics/snapshot', asyncHandler(adminController.generateSnapshot.bind(adminController)));

// Activity Logs
router.get('/logs', asyncHandler(adminController.getActivityLogs.bind(adminController)));

// System Settings
router.get('/settings', asyncHandler(adminController.getSettings.bind(adminController)));
router.get('/settings/:key', asyncHandler(adminController.getSetting.bind(adminController)));
router.put('/settings/:key', asyncHandler(adminController.updateSetting.bind(adminController)));
router.delete('/settings/:key', asyncHandler(adminController.deleteSetting.bind(adminController)));

// Platform Notifications
router.get('/notifications', asyncHandler(adminController.getNotifications.bind(adminController)));
router.post('/notifications', asyncHandler(adminController.createNotification.bind(adminController)));
router.put('/notifications/:id/read', asyncHandler(adminController.markNotificationRead.bind(adminController)));

// System Health
router.get('/health/system', asyncHandler(adminController.checkHealth.bind(adminController)));

module.exports = router;
