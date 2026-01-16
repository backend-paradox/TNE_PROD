const adminService = require('../services/adminService');
const { ApiResponse, ApiError } = require('../../../shared/src/utils');

class AdminController {
  /**
   * Get dashboard statistics
   */
  async getDashboard(req, res) {
    try {
      const stats = await adminService.getDashboardStats();
      res.json(ApiResponse.success(stats, 'Dashboard statistics retrieved'));
    } catch (error) {
      throw ApiError.internal(error.message);
    }
  }

  /**
   * Get analytics data
   */
  async getAnalytics(req, res) {
    try {
      const { startDate, endDate, groupBy = 'day' } = req.query;

      if (!startDate || !endDate) {
        throw ApiError.badRequest('startDate and endDate are required');
      }

      const analytics = await adminService.getAnalytics(startDate, endDate, groupBy);
      res.json(ApiResponse.success(analytics, 'Analytics data retrieved'));
    } catch (error) {
      throw ApiError.internal(error.message);
    }
  }

  /**
   * Generate analytics snapshot
   */
  async generateSnapshot(req, res) {
    try {
      const { date } = req.body;
      const snapshot = await adminService.generateSnapshot(date);
      res.json(ApiResponse.success(snapshot, 'Analytics snapshot generated'));
    } catch (error) {
      throw ApiError.internal(error.message);
    }
  }

  /**
   * Get activity logs
   */
  async getActivityLogs(req, res) {
    try {
      const logs = await adminService.getActivityLogs(req.query);
      res.json(ApiResponse.success(logs, 'Activity logs retrieved'));
    } catch (error) {
      throw ApiError.internal(error.message);
    }
  }

  /**
   * Get all system settings
   */
  async getSettings(req, res) {
    try {
      const settings = await adminService.getSettings();
      res.json(ApiResponse.success(settings, 'System settings retrieved'));
    } catch (error) {
      throw ApiError.internal(error.message);
    }
  }

  /**
   * Get single setting
   */
  async getSetting(req, res) {
    try {
      const { key } = req.params;
      const setting = await adminService.getSetting(key);

      if (!setting) {
        throw ApiError.notFound('Setting not found');
      }

      res.json(ApiResponse.success(setting, 'Setting retrieved'));
    } catch (error) {
      throw ApiError.internal(error.message);
    }
  }

  /**
   * Update system setting
   */
  async updateSetting(req, res) {
    try {
      const { key } = req.params;
      const { value, description } = req.body;
      const adminId = req.user.id;

      const setting = await adminService.updateSetting(key, value, description, adminId);

      // Log action
      await adminService.logAction(adminId, 'UPDATE', 'SETTING', setting.id, { key, value }, req);

      res.json(ApiResponse.success(setting, 'Setting updated successfully'));
    } catch (error) {
      throw ApiError.internal(error.message);
    }
  }

  /**
   * Delete system setting
   */
  async deleteSetting(req, res) {
    try {
      const { key } = req.params;
      const adminId = req.user.id;

      await adminService.deleteSetting(key);

      // Log action
      await adminService.logAction(adminId, 'DELETE', 'SETTING', 0, { key }, req);

      res.json(ApiResponse.success(null, 'Setting deleted successfully'));
    } catch (error) {
      throw ApiError.internal(error.message);
    }
  }

  /**
   * Get platform notifications
   */
  async getNotifications(req, res) {
    try {
      const notifications = await adminService.getNotifications(req.query);
      res.json(ApiResponse.success(notifications, 'Notifications retrieved'));
    } catch (error) {
      throw ApiError.internal(error.message);
    }
  }

  /**
   * Create platform notification
   */
  async createNotification(req, res) {
    try {
      const { type, title, message, severity } = req.body;
      const adminId = req.user.id;

      const notification = await adminService.createNotification(type, title, message, severity);

      // Log action
      await adminService.logAction(adminId, 'CREATE', 'NOTIFICATION', notification.id, { title }, req);

      res.status(201).json(ApiResponse.success(notification, 'Notification created'));
    } catch (error) {
      throw ApiError.internal(error.message);
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;

      const notification = await adminService.markNotificationAsRead(id, adminId);
      res.json(ApiResponse.success(notification, 'Notification marked as read'));
    } catch (error) {
      throw ApiError.internal(error.message);
    }
  }

  /**
   * System health check
   */
  async checkHealth(req, res) {
    try {
      const health = await adminService.checkSystemHealth();
      const allUp = health.every(s => s.status === 'UP');

      res.status(allUp ? 200 : 503).json(
        ApiResponse.success(
          { services: health, overall: allUp ? 'HEALTHY' : 'DEGRADED' },
          'System health check completed'
        )
      );
    } catch (error) {
      throw ApiError.internal(error.message);
    }
  }
}

module.exports = new AdminController();
