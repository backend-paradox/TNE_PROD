// ==============================================================================
// Template Service - Handlebars Template Rendering
// ==============================================================================

const Handlebars = require('handlebars');
const prisma = require('../config/prisma');
const logger = require('../utils/logger');

// Register custom Handlebars helpers
Handlebars.registerHelper('formatDate', (date, format) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

Handlebars.registerHelper('formatCurrency', (amount, currency = 'INR') => {
  if (!amount) return '';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
  }).format(amount);
});

Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
  return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
});

class TemplateService {
  constructor() {
    this.compiledTemplates = new Map();
  }

  /**
   * Get or compile a template
   * @param {string} templateName - Template name
   * @param {string} channel - Notification channel
   * @returns {Promise<Object>} - Compiled template
   */
  async getTemplate(templateName, channel) {
    const cacheKey = `${templateName}_${channel}`;

    // Check cache
    if (this.compiledTemplates.has(cacheKey)) {
      return this.compiledTemplates.get(cacheKey);
    }

    // Fetch from database
    const template = await prisma.notificationTemplate.findFirst({
      where: {
        name: templateName,
        channel,
        isActive: true,
      },
    });

    if (!template) {
      // Return default template if not found
      return this.getDefaultTemplate(templateName, channel);
    }

    // Compile and cache
    const compiled = {
      subject: template.subject ? Handlebars.compile(template.subject) : null,
      body: Handlebars.compile(template.body),
      htmlBody: template.htmlBody ? Handlebars.compile(template.htmlBody) : null,
    };

    this.compiledTemplates.set(cacheKey, compiled);
    return compiled;
  }

  /**
   * Render a template with variables
   * @param {string} templateName - Template name
   * @param {string} channel - Notification channel
   * @param {Object} variables - Template variables
   * @returns {Promise<Object>} - Rendered content
   */
  async render(templateName, channel, variables = {}) {
    try {
      const template = await this.getTemplate(templateName, channel);

      const rendered = {
        subject: template.subject ? template.subject(variables) : null,
        body: template.body(variables),
        html: template.htmlBody ? template.htmlBody(variables) : null,
      };

      return rendered;
    } catch (error) {
      logger.error(`Failed to render template ${templateName}:`, error);
      throw error;
    }
  }

  /**
   * Get default templates for common notification types
   */
  getDefaultTemplate(templateName, channel) {
    const defaults = {
      // Welcome Email
      WELCOME: {
        EMAIL: {
          subject: Handlebars.compile('Welcome to Trip & Event, {{name}}!'),
          body: Handlebars.compile('Hi {{name}},\n\nWelcome to Trip & Event! We\'re excited to have you on board.\n\nStart exploring amazing destinations and connect with fellow travellers.\n\nBest,\nTrip & Event Team'),
          htmlBody: Handlebars.compile(`
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #0d9488;">Welcome to Trip & Event!</h1>
              <p>Hi {{name}},</p>
              <p>We're excited to have you on board. Start exploring amazing destinations and connect with fellow travellers.</p>
              <a href="{{appUrl}}" style="display: inline-block; background: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Explore Now</a>
              <p style="color: #666; margin-top: 24px;">Best,<br>Trip & Event Team</p>
            </div>
          `),
        },
        PUSH: {
          subject: null,
          body: Handlebars.compile('Welcome {{name}}! Start exploring amazing trips.'),
          htmlBody: null,
        },
        IN_APP: {
          subject: null,
          body: Handlebars.compile('Welcome to Trip & Event! Start your journey.'),
          htmlBody: null,
        },
      },

      // Email Verification
      EMAIL_VERIFICATION: {
        EMAIL: {
          subject: Handlebars.compile('Verify your email - Trip & Event'),
          body: Handlebars.compile('Hi {{name}},\n\nPlease verify your email by clicking the link below:\n\n{{verificationUrl}}\n\nThis link expires in 24 hours.\n\nBest,\nTrip & Event Team'),
          htmlBody: Handlebars.compile(`
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #0d9488;">Verify Your Email</h2>
              <p>Hi {{name}},</p>
              <p>Please verify your email address by clicking the button below:</p>
              <a href="{{verificationUrl}}" style="display: inline-block; background: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Verify Email</a>
              <p style="color: #666; font-size: 14px; margin-top: 24px;">This link expires in 24 hours.</p>
            </div>
          `),
        },
      },

      // Booking Confirmed
      BOOKING_CONFIRMED: {
        EMAIL: {
          subject: Handlebars.compile('Booking Confirmed - {{bookingNumber}}'),
          body: Handlebars.compile('Hi {{name}},\n\nYour booking has been confirmed!\n\nBooking Number: {{bookingNumber}}\nDestination: {{destination}}\nDate: {{date}}\nTotal: {{total}}\n\nThank you for booking with us!'),
          htmlBody: Handlebars.compile(`
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #0d9488;">Booking Confirmed!</h2>
              <p>Hi {{name}},</p>
              <div style="background: #f0fdfa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Booking Number:</strong> {{bookingNumber}}</p>
                <p><strong>Destination:</strong> {{destination}}</p>
                <p><strong>Date:</strong> {{date}}</p>
                <p><strong>Total:</strong> {{total}}</p>
              </div>
              <p>Thank you for booking with us!</p>
            </div>
          `),
        },
        PUSH: {
          subject: null,
          body: Handlebars.compile('Your booking {{bookingNumber}} is confirmed! Destination: {{destination}}'),
          htmlBody: null,
        },
        SMS: {
          subject: null,
          body: Handlebars.compile('Trip & Event: Booking {{bookingNumber}} confirmed for {{destination}} on {{date}}. Total: {{total}}'),
          htmlBody: null,
        },
      },

      // Group Invitation
      GROUP_INVITATION: {
        EMAIL: {
          subject: Handlebars.compile('{{inviterName}} invited you to join {{groupName}}'),
          body: Handlebars.compile('Hi {{name}},\n\n{{inviterName}} has invited you to join the trip "{{groupName}}".\n\nDestination: {{destination}}\nDates: {{dates}}\n\nClick here to join: {{inviteUrl}}'),
          htmlBody: Handlebars.compile(`
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #0d9488;">You're Invited!</h2>
              <p>Hi {{name}},</p>
              <p><strong>{{inviterName}}</strong> has invited you to join the trip:</p>
              <div style="background: #f0fdfa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>{{groupName}}</h3>
                <p><strong>Destination:</strong> {{destination}}</p>
                <p><strong>Dates:</strong> {{dates}}</p>
              </div>
              <a href="{{inviteUrl}}" style="display: inline-block; background: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Join Trip</a>
            </div>
          `),
        },
        PUSH: {
          subject: null,
          body: Handlebars.compile('{{inviterName}} invited you to {{groupName}}!'),
          htmlBody: null,
        },
        IN_APP: {
          subject: null,
          body: Handlebars.compile('{{inviterName}} invited you to join "{{groupName}}"'),
          htmlBody: null,
        },
      },

      // New Message
      NEW_MESSAGE: {
        PUSH: {
          subject: null,
          body: Handlebars.compile('{{senderName}}: {{messagePreview}}'),
          htmlBody: null,
        },
        IN_APP: {
          subject: null,
          body: Handlebars.compile('New message from {{senderName}} in {{groupName}}'),
          htmlBody: null,
        },
      },

      // Expense Added
      EXPENSE_ADDED: {
        PUSH: {
          subject: null,
          body: Handlebars.compile('{{adderName}} added an expense: {{expenseTitle}} ({{amount}})'),
          htmlBody: null,
        },
        IN_APP: {
          subject: null,
          body: Handlebars.compile('{{adderName}} added "{{expenseTitle}}" expense of {{amount}}'),
          htmlBody: null,
        },
      },
    };

    const typeDefaults = defaults[templateName];
    if (!typeDefaults || !typeDefaults[channel]) {
      // Fallback generic template
      return {
        subject: channel === 'EMAIL' ? Handlebars.compile('Notification from Trip & Event') : null,
        body: Handlebars.compile('{{message}}'),
        htmlBody: null,
      };
    }

    return typeDefaults[channel];
  }

  /**
   * Clear template cache
   */
  clearCache() {
    this.compiledTemplates.clear();
    logger.info('Template cache cleared');
  }

  /**
   * Create or update a template
   */
  async upsertTemplate(data) {
    const template = await prisma.notificationTemplate.upsert({
      where: { name: data.name },
      update: {
        type: data.type,
        channel: data.channel,
        subject: data.subject,
        body: data.body,
        htmlBody: data.htmlBody,
        description: data.description,
        variables: data.variables,
        isActive: data.isActive ?? true,
        version: { increment: 1 },
      },
      create: {
        name: data.name,
        type: data.type,
        channel: data.channel,
        subject: data.subject,
        body: data.body,
        htmlBody: data.htmlBody,
        description: data.description,
        variables: data.variables,
      },
    });

    // Clear cache for this template
    this.compiledTemplates.delete(`${data.name}_${data.channel}`);

    return template;
  }
}

module.exports = new TemplateService();
