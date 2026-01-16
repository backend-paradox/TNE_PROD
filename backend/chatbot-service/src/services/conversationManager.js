const prisma = require('../config/prisma');
const { v4: uuidv4 } = require('uuid');

// Conversation steps (state machine)
const STEPS = {
  GREETING: 'GREETING',
  AWAITING_DESTINATION: 'AWAITING_DESTINATION',
  SHOWING_PACKAGES: 'SHOWING_PACKAGES',
  AWAITING_PACKAGE_SELECTION: 'AWAITING_PACKAGE_SELECTION',
  AWAITING_DATE: 'AWAITING_DATE',
  AWAITING_TRAVELERS: 'AWAITING_TRAVELERS',
  AWAITING_TRIP_TYPE: 'AWAITING_TRIP_TYPE',
  AWAITING_BUDGET: 'AWAITING_BUDGET',
  AWAITING_CONTACT: 'AWAITING_CONTACT',
  CONFIRMING_BOOKING: 'CONFIRMING_BOOKING',
  BOOKING_COMPLETE: 'BOOKING_COMPLETE'
};

// Default context structure
const DEFAULT_CONTEXT = {
  currentStep: STEPS.GREETING,
  destination: null,
  travelDate: null,
  travelers: null,
  tripType: null,
  budget: null,
  selectedPackageId: null,
  selectedPackage: null,
  contact: {
    name: null,
    email: null,
    phone: null
  },
  lastPackages: [], // Store last shown packages for selection
  messageCount: 0
};

class ConversationManager {
  /**
   * Create or get session
   */
  async getOrCreateSession(sessionId, userId = null) {
    if (sessionId) {
      const session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 50 // Limit message history
          }
        }
      });

      if (session && session.isActive) {
        // Update last activity
        await prisma.chatSession.update({
          where: { id: sessionId },
          data: { lastActivityAt: new Date() }
        });
        return session;
      }
    }

    // Create new session
    const newSession = await prisma.chatSession.create({
      data: {
        id: sessionId || uuidv4(),
        userId,
        context: DEFAULT_CONTEXT
      }
    });

    return { ...newSession, messages: [] };
  }

  /**
   * Get session context
   */
  getContext(session) {
    return {
      ...DEFAULT_CONTEXT,
      ...(typeof session.context === 'object' ? session.context : JSON.parse(session.context || '{}'))
    };
  }

  /**
   * Update session context
   */
  async updateContext(sessionId, updates) {
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId }
    });

    const currentContext = this.getContext(session);
    const newContext = {
      ...currentContext,
      ...updates,
      messageCount: (currentContext.messageCount || 0) + 1
    };

    await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        context: newContext,
        lastActivityAt: new Date()
      }
    });

    return newContext;
  }

  /**
   * Save message to session
   */
  async saveMessage(sessionId, role, content, metadata = null) {
    return await prisma.chatMessage.create({
      data: {
        sessionId,
        role,
        content,
        metadata
      }
    });
  }

  /**
   * Get message history for session
   */
  async getMessageHistory(sessionId, limit = 20) {
    return await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  /**
   * Update step in context
   */
  async setStep(sessionId, step) {
    return await this.updateContext(sessionId, { currentStep: step });
  }

  /**
   * Check what info is missing for booking
   */
  getMissingFields(context) {
    const missing = [];

    if (!context.destination) missing.push('destination');
    if (!context.travelDate) missing.push('travel_date');
    if (!context.travelers) missing.push('travelers');
    if (!context.selectedPackageId) missing.push('package_selection');

    // Contact info for final booking - include when:
    // 1. We're explicitly in AWAITING_CONTACT or CONFIRMING_BOOKING step, OR
    // 2. We have all the basic booking info (destination, date, travelers, package)
    const hasAllBookingBasics = context.destination && context.travelDate && context.travelers && context.selectedPackageId;
    const isContactStep = context.currentStep === STEPS.AWAITING_CONTACT || context.currentStep === STEPS.CONFIRMING_BOOKING;

    if (isContactStep || hasAllBookingBasics) {
      if (!context.contact?.name) missing.push('name');
      if (!context.contact?.email) missing.push('email');
      if (!context.contact?.phone) missing.push('phone');
    }

    return missing;
  }

  /**
   * Get next step based on current context
   */
  getNextStep(context) {
    if (!context.destination) return STEPS.AWAITING_DESTINATION;
    if (!context.travelDate) return STEPS.AWAITING_DATE;
    if (!context.travelers) return STEPS.AWAITING_TRAVELERS;
    if (!context.selectedPackageId) return STEPS.AWAITING_PACKAGE_SELECTION;
    if (!context.contact?.name || !context.contact?.email || !context.contact?.phone) {
      return STEPS.AWAITING_CONTACT;
    }
    return STEPS.CONFIRMING_BOOKING;
  }

  /**
   * Reset session to start
   */
  async resetSession(sessionId) {
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        context: DEFAULT_CONTEXT,
        lastActivityAt: new Date()
      }
    });

    return DEFAULT_CONTEXT;
  }

  /**
   * Deactivate session
   */
  async deactivateSession(sessionId) {
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { isActive: false }
    });
  }

  /**
   * Clean up old sessions (can be run as a cron job)
   */
  async cleanupOldSessions(hoursOld = 24) {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hoursOld);

    await prisma.chatSession.updateMany({
      where: {
        lastActivityAt: { lt: cutoffDate },
        isActive: true
      },
      data: { isActive: false }
    });
  }
}

module.exports = {
  ConversationManager,
  STEPS,
  DEFAULT_CONTEXT
};
