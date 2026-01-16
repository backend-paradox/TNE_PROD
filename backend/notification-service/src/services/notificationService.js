// ==============================================================================
// Notification Service - Core Business Logic
// ==============================================================================

const prisma = require('../config/prisma');
const logger = require('../utils/logger');
const templateService = require('./templateService');
const { emailChannel, smsChannel, pushChannel } = require('./channels');

class NotificationService {
  /**
   * Send a notification through specified channels
   * @param {Object} options - Notification options
   * @returns {Promise<Object>} - Created notification(s)
   */
  async send(options) {
    const {
      userId,
      type,
      channels = ['IN_APP'],
      priority = 'NORMAL',
      title,
      body,
      data = {},
      actionUrl,
      imageUrl,
      externalId,
      templateVariables = {},
    } = options;

    const results = [];

    // Check user preferences
    const preferences = await this.getUserPreferences(userId);

    for (const channel of channels) {
      // Check if channel is enabled for user
      if (!this.isChannelEnabled(preferences, channel, type)) {
        logger.debug(`Channel ${channel} disabled for user ${userId}`);
        continue;
      }

      // Check quiet hours
      if (this.isQuietHours(preferences)) {
        logger.debug(`Quiet hours active for user ${userId}`);
        continue;
      }

      try {
        // Render template
        const rendered = await templateService.render(type, channel, {
          ...data,
          ...templateVariables,
          title,
          body,
        });

        // Create notification record
        const notification = await prisma.notification.create({
          data: {
            userId,
            type,
            channel,
            priority,
            status: 'PENDING',
            title: rendered.subject || title,
            body: rendered.body || body,
            data,
            actionUrl,
            imageUrl,
            externalId,
          },
        });

        // Send through channel
        const sendResult = await this.sendToChannel(channel, notification, rendered, data);

        // Update notification status
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            status: sendResult.success ? 'SENT' : 'FAILED',
            sentAt: sendResult.success ? new Date() : null,
            failedAt: sendResult.success ? null : new Date(),
            failureReason: sendResult.error,
            emailMessageId: sendResult.messageId,
            smsMessageSid: sendResult.messageSid,
            pushMessageId: sendResult.messageId,
          },
        });

        // Log the event
        await prisma.notificationLog.create({
          data: {
            notificationId: notification.id,
            event: sendResult.success ? 'sent' : 'failed',
            channel,
            metadata: sendResult,
          },
        });

        results.push({
          channel,
          notificationId: notification.id,
          success: sendResult.success,
          error: sendResult.error,
        });
      } catch (error) {
        logger.error(`Failed to send ${channel} notification:`, error);
        results.push({
          channel,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Send notification to specific channel
   */
  async sendToChannel(channel, notification, rendered, data) {
    switch (channel) {
      case 'EMAIL':
        return this.sendEmail(notification, rendered, data);
      case 'SMS':
        return this.sendSMS(notification, rendered, data);
      case 'PUSH':
        return this.sendPush(notification, rendered, data);
      case 'IN_APP':
        // In-app notifications are stored in DB and delivered via WebSocket
        return { success: true };
      default:
        return { success: false, error: `Unknown channel: ${channel}` };
    }
  }

  /**
   * Send email notification
   */
  async sendEmail(notification, rendered, data) {
    try {
      const result = await emailChannel.send({
        to: data.email,
        subject: rendered.subject || notification.title,
        text: rendered.body,
        html: rendered.html,
      });
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Send SMS notification
   */
  async sendSMS(notification, rendered, data) {
    try {
      const result = await smsChannel.send({
        to: data.phone,
        body: rendered.body,
      });
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Send push notification
   */
  async sendPush(notification, rendered, data) {
    try {
      // Get user's push tokens
      const tokens = await prisma.pushToken.findMany({
        where: {
          userId: notification.userId,
          isActive: true,
        },
      });

      if (tokens.length === 0) {
        return { success: false, error: 'No push tokens found' };
      }

      if (tokens.length === 1) {
        const result = await pushChannel.send({
          token: tokens[0].token,
          title: notification.title,
          body: rendered.body,
          data: {
            notificationId: notification.id,
            type: notification.type,
            actionUrl: notification.actionUrl,
            ...data,
          },
          imageUrl: notification.imageUrl,
        });

        // Remove invalid token
        if (result.shouldRemoveToken) {
          await prisma.pushToken.update({
            where: { id: tokens[0].id },
            data: { isActive: false },
          });
        }

        return result;
      }

      // Multicast to multiple devices
      const result = await pushChannel.sendMulticast({
        tokens: tokens.map(t => t.token),
        title: notification.title,
        body: rendered.body,
        data: {
          notificationId: notification.id,
          type: notification.type,
          actionUrl: notification.actionUrl,
        },
        imageUrl: notification.imageUrl,
      });

      // Remove invalid tokens
      if (result.failedTokens?.length > 0) {
        await prisma.pushToken.updateMany({
          where: { token: { in: result.failedTokens } },
          data: { isActive: false },
        });
      }

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's notifications with pagination
   */
  async getUserNotifications(userId, options = {}) {
    const {
      page = 1,
      limit = 20,
      channel,
      type,
      unreadOnly = false,
    } = options;

    const where = {
      userId,
      channel: channel || 'IN_APP',
      ...(type && { type }),
      ...(unreadOnly && { readAt: null }),
    };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      notifications,
      pagination: { page, limit, total },
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    const notification = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
        status: 'READ',
      },
    });

    if (notification.count > 0) {
      await prisma.notificationLog.create({
        data: {
          notificationId,
          event: 'read',
          channel: 'IN_APP',
        },
      });
    }

    return notification.count > 0;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId, channel = 'IN_APP') {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        channel,
        readAt: null,
      },
      data: {
        readAt: new Date(),
        status: 'READ',
      },
    });

    return result.count;
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId, channel = 'IN_APP') {
    return prisma.notification.count({
      where: {
        userId,
        channel,
        readAt: null,
      },
    });
  }

  /**
   * Get user notification preferences
   */
  async getUserPreferences(userId) {
    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // Create default preferences
      preferences = await prisma.notificationPreference.create({
        data: { userId },
      });
    }

    return preferences;
  }

  /**
   * Update user notification preferences
   */
  async updatePreferences(userId, updates) {
    return prisma.notificationPreference.upsert({
      where: { userId },
      update: updates,
      create: { userId, ...updates },
    });
  }

  /**
   * Check if channel is enabled for user
   */
  isChannelEnabled(preferences, channel, type) {
    if (!preferences) return true;

    // Check channel-level preference
    const channelKey = `${channel.toLowerCase()}Enabled`;
    if (preferences[channelKey] === false) return false;

    // Check type-specific preference
    const typePrefs = preferences.typePreferences?.[type];
    if (typePrefs && typePrefs[channel.toLowerCase()] === false) return false;

    return true;
  }

  /**
   * Check if currently in quiet hours
   */
  isQuietHours(preferences) {
    if (!preferences?.quietHoursEnabled) return false;

    const now = new Date();
    const timezone = preferences.timezone || 'Asia/Kolkata';

    // Get current time in user's timezone
    const currentTime = now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone,
    });

    const start = preferences.quietHoursStart;
    const end = preferences.quietHoursEnd;

    if (!start || !end) return false;

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (start > end) {
      return currentTime >= start || currentTime < end;
    }

    return currentTime >= start && currentTime < end;
  }

  /**
   * Register a push token for a user
   */
  async registerPushToken(userId, tokenData) {
    const { token, platform, deviceId, deviceName } = tokenData;

    // Check if token already exists
    const existing = await prisma.pushToken.findUnique({
      where: { token },
    });

    if (existing) {
      // Update existing token
      return prisma.pushToken.update({
        where: { token },
        data: {
          userId,
          platform,
          deviceId,
          deviceName,
          isActive: true,
          lastUsedAt: new Date(),
        },
      });
    }

    // Create new token
    return prisma.pushToken.create({
      data: {
        userId,
        token,
        platform,
        deviceId,
        deviceName,
      },
    });
  }

  /**
   * Remove a push token
   */
  async removePushToken(token) {
    return prisma.pushToken.updateMany({
      where: { token },
      data: { isActive: false },
    });
  }

  /**
   * Delete old notifications
   */
  async cleanupOldNotifications(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        readAt: { not: null },
      },
    });

    logger.info(`Cleaned up ${result.count} old notifications`);
    return result.count;
  }
}

module.exports = new NotificationService();
