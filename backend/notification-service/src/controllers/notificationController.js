// ==============================================================================
// Notification Controller
// ==============================================================================

const notificationService = require('../services/notificationService');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

class NotificationController {
  /**
   * Get user's notifications
   * GET /notifications
   */
  async getNotifications(req, res, next) {
    try {
      const userId = req.user.id;
      const {
        page = 1,
        limit = 20,
        channel = 'IN_APP',
        type,
        unreadOnly,
      } = req.query;

      const result = await notificationService.getUserNotifications(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        channel,
        type,
        unreadOnly: unreadOnly === 'true',
      });

      return ApiResponse.paginated(res, result.notifications, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get unread notification count
   * GET /notifications/unread-count
   */
  async getUnreadCount(req, res, next) {
    try {
      const userId = req.user.id;
      const { channel = 'IN_APP' } = req.query;

      const count = await notificationService.getUnreadCount(userId, channel);

      return ApiResponse.success(res, { count });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark notification as read
   * POST /notifications/:id/read
   */
  async markAsRead(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const success = await notificationService.markAsRead(id, userId);

      if (!success) {
        throw ApiError.notFound('Notification not found or already read');
      }

      return ApiResponse.success(res, null, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark all notifications as read
   * POST /notifications/read-all
   */
  async markAllAsRead(req, res, next) {
    try {
      const userId = req.user.id;
      const { channel = 'IN_APP' } = req.body;

      const count = await notificationService.markAllAsRead(userId, channel);

      return ApiResponse.success(res, { count }, `${count} notifications marked as read`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's notification preferences
   * GET /notifications/preferences
   */
  async getPreferences(req, res, next) {
    try {
      const userId = req.user.id;

      const preferences = await notificationService.getUserPreferences(userId);

      return ApiResponse.success(res, preferences);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user's notification preferences
   * PUT /notifications/preferences
   */
  async updatePreferences(req, res, next) {
    try {
      const userId = req.user.id;
      const updates = req.body;

      // Validate updates
      const allowedFields = [
        'emailEnabled',
        'smsEnabled',
        'pushEnabled',
        'inAppEnabled',
        'typePreferences',
        'quietHoursEnabled',
        'quietHoursStart',
        'quietHoursEnd',
        'timezone',
        'digestEnabled',
        'digestFrequency',
      ];

      const filteredUpdates = {};
      for (const key of allowedFields) {
        if (updates[key] !== undefined) {
          filteredUpdates[key] = updates[key];
        }
      }

      const preferences = await notificationService.updatePreferences(userId, filteredUpdates);

      return ApiResponse.success(res, preferences, 'Preferences updated');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Register push token
   * POST /notifications/push-token
   */
  async registerPushToken(req, res, next) {
    try {
      const userId = req.user.id;
      const { token, platform, deviceId, deviceName } = req.body;

      if (!token || !platform) {
        throw ApiError.badRequest('Token and platform are required');
      }

      const pushToken = await notificationService.registerPushToken(userId, {
        token,
        platform,
        deviceId,
        deviceName,
      });

      return ApiResponse.success(res, pushToken, 'Push token registered');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove push token
   * DELETE /notifications/push-token
   */
  async removePushToken(req, res, next) {
    try {
      const { token } = req.body;

      if (!token) {
        throw ApiError.badRequest('Token is required');
      }

      await notificationService.removePushToken(token);

      return ApiResponse.success(res, null, 'Push token removed');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send notification (internal/service endpoint)
   * POST /notifications/send
   */
  async sendNotification(req, res, next) {
    try {
      // This endpoint should only be called by other services
      if (!req.isServiceCall && req.user?.role !== 'ADMIN') {
        throw ApiError.forbidden('Service authentication required');
      }

      const {
        userId,
        type,
        channels,
        priority,
        title,
        body,
        data,
        actionUrl,
        imageUrl,
        externalId,
      } = req.body;

      if (!userId || !type || !title) {
        throw ApiError.badRequest('userId, type, and title are required');
      }

      const results = await notificationService.send({
        userId,
        type,
        channels,
        priority,
        title,
        body,
        data,
        actionUrl,
        imageUrl,
        externalId,
      });

      return ApiResponse.success(res, results, 'Notification sent');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send bulk notification (admin only)
   * POST /notifications/send-bulk
   */
  async sendBulkNotification(req, res, next) {
    try {
      if (req.user?.role !== 'ADMIN') {
        throw ApiError.forbidden('Admin access required');
      }

      const {
        userIds,
        type,
        channels,
        priority,
        title,
        body,
        data,
        actionUrl,
      } = req.body;

      if (!userIds?.length || !type || !title) {
        throw ApiError.badRequest('userIds, type, and title are required');
      }

      const results = [];
      for (const userId of userIds) {
        const result = await notificationService.send({
          userId,
          type,
          channels,
          priority,
          title,
          body,
          data,
          actionUrl,
        });
        results.push({ userId, result });
      }

      return ApiResponse.success(res, {
        totalSent: results.length,
        results,
      }, 'Bulk notifications sent');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
