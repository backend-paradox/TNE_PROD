// ==============================================================================
// Push Notification Channel Provider (Firebase Cloud Messaging)
// ==============================================================================

const config = require('../../config/env');
const logger = require('../../utils/logger');

class PushChannel {
  constructor() {
    this.admin = null;
    this.messaging = null;
    this.isInitialized = false;
  }

  /**
   * Initialize Firebase Admin SDK
   */
  async initialize() {
    if (this.isInitialized) return;

    if (!config.firebase.enabled) {
      logger.warn('Firebase not configured - Push notifications disabled');
      return;
    }

    try {
      const admin = require('firebase-admin');

      // Initialize Firebase Admin
      if (!admin.apps.length) {
        this.admin = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: config.firebase.projectId,
            privateKey: config.firebase.privateKey,
            clientEmail: config.firebase.clientEmail,
          }),
        });
      } else {
        this.admin = admin.apps[0];
      }

      this.messaging = admin.messaging();
      this.isInitialized = true;
      logger.info('Push channel (Firebase) initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Push channel:', error);
      throw error;
    }
  }

  /**
   * Send push notification to a single device
   * @param {Object} options - Push notification options
   * @returns {Promise<Object>} - Send result
   */
  async send(options) {
    if (!config.firebase.enabled) {
      logger.warn('Push notifications disabled - Firebase not configured');
      return { success: false, error: 'Push not configured' };
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    const { token, title, body, data, imageUrl, badge, sound } = options;

    try {
      const message = {
        token,
        notification: {
          title,
          body,
          ...(imageUrl && { imageUrl }),
        },
        data: data ? this.stringifyData(data) : undefined,
        android: {
          priority: 'high',
          notification: {
            sound: sound || 'default',
            channelId: 'tne_notifications',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: sound || 'default',
              badge: badge || 1,
            },
          },
        },
        webpush: {
          notification: {
            icon: '/logo.png',
            badge: '/badge.png',
          },
        },
      };

      const response = await this.messaging.send(message);

      logger.info('Push notification sent successfully', {
        messageId: response,
        title,
      });

      return {
        success: true,
        messageId: response,
      };
    } catch (error) {
      logger.error('Failed to send push notification:', error);

      // Handle invalid token
      if (error.code === 'messaging/invalid-registration-token' ||
          error.code === 'messaging/registration-token-not-registered') {
        return {
          success: false,
          error: 'invalid_token',
          shouldRemoveToken: true,
        };
      }

      throw error;
    }
  }

  /**
   * Send push notification to multiple devices
   * @param {Object} options - Multicast options
   * @returns {Promise<Object>} - Send result
   */
  async sendMulticast(options) {
    if (!config.firebase.enabled) {
      return { success: false, error: 'Push not configured' };
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    const { tokens, title, body, data, imageUrl } = options;

    try {
      const message = {
        notification: {
          title,
          body,
          ...(imageUrl && { imageUrl }),
        },
        data: data ? this.stringifyData(data) : undefined,
        android: {
          priority: 'high',
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
            },
          },
        },
      };

      const response = await this.messaging.sendEachForMulticast({
        tokens,
        ...message,
      });

      // Collect failed tokens for cleanup
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          if (resp.error?.code === 'messaging/invalid-registration-token' ||
              resp.error?.code === 'messaging/registration-token-not-registered') {
            failedTokens.push(tokens[idx]);
          }
        }
      });

      logger.info('Multicast push notification sent', {
        successCount: response.successCount,
        failureCount: response.failureCount,
      });

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        failedTokens,
      };
    } catch (error) {
      logger.error('Failed to send multicast push notification:', error);
      throw error;
    }
  }

  /**
   * Subscribe tokens to a topic
   * @param {Array} tokens - Device tokens
   * @param {string} topic - Topic name
   */
  async subscribeToTopic(tokens, topic) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      await this.messaging.subscribeToTopic(tokens, topic);
      logger.info(`Subscribed ${tokens.length} tokens to topic: ${topic}`);
    } catch (error) {
      logger.error(`Failed to subscribe to topic ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Send push notification to a topic
   * @param {Object} options - Topic notification options
   */
  async sendToTopic(options) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const { topic, title, body, data } = options;

    try {
      const message = {
        topic,
        notification: { title, body },
        data: data ? this.stringifyData(data) : undefined,
      };

      const response = await this.messaging.send(message);
      logger.info(`Push notification sent to topic: ${topic}`, { messageId: response });

      return { success: true, messageId: response };
    } catch (error) {
      logger.error(`Failed to send to topic ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Stringify data object (FCM requires string values)
   */
  stringifyData(data) {
    const result = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = typeof value === 'string' ? value : JSON.stringify(value);
    }
    return result;
  }
}

module.exports = new PushChannel();
