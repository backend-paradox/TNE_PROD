// ==============================================================================
// Email Channel Provider (Nodemailer/SMTP)
// ==============================================================================

const nodemailer = require('nodemailer');
const config = require('../../config/env');
const logger = require('../../utils/logger');

class EmailChannel {
  constructor() {
    this.transporter = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the email transporter
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.secure,
        auth: {
          user: config.email.user,
          pass: config.email.pass,
        },
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
      });

      // Verify connection
      if (config.email.user && config.email.pass) {
        await this.transporter.verify();
        logger.info('Email channel initialized successfully');
      } else {
        logger.warn('Email credentials not configured - email sending disabled');
      }

      this.isInitialized = true;
    } catch (error) {
      logger.error('Failed to initialize email channel:', error);
      throw error;
    }
  }

  /**
   * Send an email
   * @param {Object} options - Email options
   * @returns {Promise<Object>} - Send result
   */
  async send(options) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const { to, subject, text, html, attachments, replyTo } = options;

    try {
      const mailOptions = {
        from: config.email.from,
        to,
        subject,
        text,
        html,
        attachments,
        replyTo,
      };

      const result = await this.transporter.sendMail(mailOptions);

      logger.info(`Email sent successfully to ${to}`, {
        messageId: result.messageId,
        subject,
      });

      return {
        success: true,
        messageId: result.messageId,
        response: result.response,
      };
    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }

  /**
   * Send bulk emails
   * @param {Array} recipients - Array of email options
   * @returns {Promise<Array>} - Array of results
   */
  async sendBulk(recipients) {
    const results = [];
    const batchSize = 10;

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(recipient => this.send(recipient))
      );

      results.push(...batchResults);

      // Rate limiting between batches
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * Close the transporter connection
   */
  async close() {
    if (this.transporter) {
      this.transporter.close();
      this.isInitialized = false;
      logger.info('Email channel closed');
    }
  }
}

module.exports = new EmailChannel();
