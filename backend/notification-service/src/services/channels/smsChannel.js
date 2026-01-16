// ==============================================================================
// SMS Channel Provider (Twilio)
// ==============================================================================

const config = require('../../config/env');
const logger = require('../../utils/logger');

class SMSChannel {
  constructor() {
    this.client = null;
    this.isInitialized = false;
  }

  /**
   * Initialize Twilio client
   */
  async initialize() {
    if (this.isInitialized) return;

    if (!config.twilio.enabled) {
      logger.warn('Twilio not configured - SMS sending disabled');
      return;
    }

    try {
      const twilio = require('twilio');
      this.client = twilio(config.twilio.accountSid, config.twilio.authToken);
      this.isInitialized = true;
      logger.info('SMS channel (Twilio) initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize SMS channel:', error);
      throw error;
    }
  }

  /**
   * Send an SMS
   * @param {Object} options - SMS options
   * @returns {Promise<Object>} - Send result
   */
  async send(options) {
    if (!config.twilio.enabled) {
      logger.warn('SMS sending disabled - Twilio not configured');
      return { success: false, error: 'SMS not configured' };
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    const { to, body, mediaUrl } = options;

    try {
      // Ensure phone number has country code
      const formattedTo = to.startsWith('+') ? to : `+91${to}`;

      const messageOptions = {
        body,
        from: config.twilio.phoneNumber,
        to: formattedTo,
      };

      // Add media if provided (MMS)
      if (mediaUrl) {
        messageOptions.mediaUrl = [mediaUrl];
      }

      const message = await this.client.messages.create(messageOptions);

      logger.info(`SMS sent successfully to ${formattedTo}`, {
        messageSid: message.sid,
        status: message.status,
      });

      return {
        success: true,
        messageSid: message.sid,
        status: message.status,
      };
    } catch (error) {
      logger.error(`Failed to send SMS to ${to}:`, error);
      throw error;
    }
  }

  /**
   * Send bulk SMS
   * @param {Array} recipients - Array of SMS options
   * @returns {Promise<Array>} - Array of results
   */
  async sendBulk(recipients) {
    const results = [];
    const batchSize = 5;

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(recipient => this.send(recipient))
      );

      results.push(...batchResults);

      // Rate limiting between batches
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return results;
  }

  /**
   * Get message status
   * @param {string} messageSid - Twilio message SID
   * @returns {Promise<Object>} - Message status
   */
  async getStatus(messageSid) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const message = await this.client.messages(messageSid).fetch();
      return {
        status: message.status,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage,
      };
    } catch (error) {
      logger.error(`Failed to get SMS status for ${messageSid}:`, error);
      throw error;
    }
  }
}

module.exports = new SMSChannel();
