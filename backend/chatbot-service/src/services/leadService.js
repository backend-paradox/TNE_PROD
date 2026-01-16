/**
 * Lead Service - Handles travel lead capture and persistence
 *
 * Uses the dedicated ChatbotLead table for proper lead management.
 * Supports both logged-in users and guest sessions.
 */

const prisma = require('../config/prisma');

class LeadService {
  /**
   * Create or update a lead from conversation context
   * @param {string} sessionId - Chat session ID
   * @param {object} context - Conversation context
   * @param {number|null} userId - User ID (null for guests)
   * @param {object} options - Additional options
   */
  async captureLeadFromContext(sessionId, context, userId = null, options = {}) {
    try {
      // Calculate lead scoring
      const confidenceScore = this.calculateConfidenceScore(context, options);
      const qualificationLevel = this.getQualificationLevel(confidenceScore);
      const isQualified = this.isQualifiedLead(context, options);
      const priority = this.calculatePriority(context, options);

      const leadData = {
        sessionId,
        userId,
        name: context.contact?.name || null,
        email: context.contact?.email || null,
        phone: context.contact?.phone || null,
        destination: context.destination || null,
        packageId: context.selectedPackageId || null,
        packageTitle: context.selectedPackage?.title || null,
        travelDate: context.travelDate || null,
        travelers: context.travelers || null,
        tripType: context.tripType || null,
        budget: context.budget || null,
        bookingIntent: options.bookingIntent || false,
        callbackRequested: options.callbackRequested || false,
        source: options.source || 'chatbot',
        priority,
        confidenceScore,
        qualificationLevel,
        isQualified,
        notes: options.notes || null,
        status: 'NEW'
      };

      // Check if lead already exists for this session
      const existingLead = await prisma.chatbotLead.findFirst({
        where: { sessionId }
      });

      let lead;
      if (existingLead) {
        // Update existing lead with new data
        lead = await prisma.chatbotLead.update({
          where: { id: existingLead.id },
          data: {
            ...leadData,
            updatedAt: new Date()
          }
        });
        console.log(`Lead updated for session ${sessionId}: ${priority} priority`);
      } else {
        // Create new lead
        lead = await prisma.chatbotLead.create({
          data: leadData
        });
        console.log(`Lead created for session ${sessionId}: ${priority} priority`);
      }

      // Update session context with lead info
      const session = await prisma.chatSession.findUnique({
        where: { id: sessionId }
      });

      if (session) {
        const currentContext = typeof session.context === 'object'
          ? session.context
          : JSON.parse(session.context || '{}');

        await prisma.chatSession.update({
          where: { id: sessionId },
          data: {
            context: {
              ...currentContext,
              leadCaptured: true,
              leadId: lead.id,
              leadCapturedAt: new Date().toISOString(),
              leadPriority: priority
            }
          }
        });
      }

      return lead;
    } catch (error) {
      console.error('LeadService.captureLeadFromContext error:', error);
      // Don't throw - lead capture shouldn't break the conversation
      return null;
    }
  }

  /**
   * Calculate lead priority based on context
   */
  calculatePriority(context, options) {
    // Callback requested = URGENT priority
    if (options.callbackRequested) {
      return 'URGENT';
    }

    // Booking intent = HIGH priority
    if (options.bookingIntent) {
      return 'HIGH';
    }

    // Has all key details = HIGH priority
    const hasContact = context.contact?.name || context.contact?.email || context.contact?.phone;
    const hasPackage = context.selectedPackageId;
    const hasDate = context.travelDate;

    if (hasContact && hasPackage && hasDate) {
      return 'HIGH';
    }

    // Has package selected = MEDIUM priority
    if (hasPackage || context.destination) {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  /**
   * Calculate lead confidence score (0-100)
   * Based on completeness of data and user engagement
   */
  calculateConfidenceScore(context, options = {}) {
    let score = 0;

    // Contact information (max 30 points)
    if (context.contact?.name) score += 10;
    if (context.contact?.email) score += 10;
    if (context.contact?.phone) score += 10;

    // Travel preferences (max 25 points)
    if (context.destination) score += 10;
    if (context.travelDate) score += 5;
    if (context.travelers) score += 5;
    if (context.tripType) score += 5;

    // Package selection (max 20 points)
    if (context.selectedPackageId) score += 15;
    if (context.budget) score += 5;

    // Intent signals (max 25 points)
    if (options.bookingIntent) score += 15;
    if (options.callbackRequested) score += 10;

    // Engagement bonus
    const messageCount = context.messageCount || 0;
    if (messageCount >= 5) score += 5; // Engaged conversation
    if (messageCount >= 10) score += 5; // Very engaged

    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Get lead qualification level based on confidence score
   */
  getQualificationLevel(confidenceScore) {
    if (confidenceScore >= 80) return 'HOT';
    if (confidenceScore >= 60) return 'WARM';
    if (confidenceScore >= 40) return 'QUALIFIED';
    if (confidenceScore >= 20) return 'INTERESTED';
    return 'COLD';
  }

  /**
   * Check if lead is qualified for handoff to sales
   */
  isQualifiedLead(context, options = {}) {
    const hasPackage = !!context.selectedPackageId;
    const hasBookingIntent = options.bookingIntent || false;
    const hasAvailabilityCheck = options.availabilityCheck || false;
    const hasContact = !!(context.contact?.email || context.contact?.phone);

    return hasPackage && (hasBookingIntent || hasAvailabilityCheck || hasContact);
  }

  /**
   * Mark lead as callback requested
   */
  async requestCallback(sessionId, contactInfo) {
    try {
      // Find existing lead or create new one
      let lead = await prisma.chatbotLead.findFirst({
        where: { sessionId }
      });

      if (lead) {
        lead = await prisma.chatbotLead.update({
          where: { id: lead.id },
          data: {
            ...contactInfo,
            callbackRequested: true,
            priority: 'URGENT',
            updatedAt: new Date()
          }
        });
      } else {
        lead = await prisma.chatbotLead.create({
          data: {
            sessionId,
            ...contactInfo,
            callbackRequested: true,
            priority: 'URGENT',
            source: 'chatbot'
          }
        });
      }

      // Update session context
      const session = await prisma.chatSession.findUnique({
        where: { id: sessionId }
      });

      if (session) {
        const currentContext = typeof session.context === 'object'
          ? session.context
          : JSON.parse(session.context || '{}');

        await prisma.chatSession.update({
          where: { id: sessionId },
          data: {
            context: {
              ...currentContext,
              callbackRequested: true,
              callbackRequestedAt: new Date().toISOString(),
              contact: {
                ...currentContext.contact,
                ...contactInfo
              }
            }
          }
        });
      }

      console.log(`Callback requested for session ${sessionId}`);
      return lead;
    } catch (error) {
      console.error('LeadService.requestCallback error:', error);
      return null;
    }
  }

  /**
   * Get lead by session ID
   */
  async getLeadBySession(sessionId) {
    try {
      const lead = await prisma.chatbotLead.findFirst({
        where: { sessionId },
        orderBy: { createdAt: 'desc' }
      });
      return lead;
    } catch (error) {
      console.error('LeadService.getLeadBySession error:', error);
      return null;
    }
  }

  /**
   * Get lead by ID
   */
  async getLeadById(leadId) {
    try {
      const lead = await prisma.chatbotLead.findUnique({
        where: { id: leadId },
        include: {
          session: {
            select: {
              userId: true,
              createdAt: true,
              usedVoiceInput: true,
              context: true
            }
          }
        }
      });
      return lead;
    } catch (error) {
      console.error('LeadService.getLeadById error:', error);
      return null;
    }
  }

  /**
   * Get all leads with filters (for admin/CRM)
   */
  async getLeads(filters = {}) {
    try {
      const where = {};

      if (filters.priority) {
        where.priority = filters.priority;
      }
      if (filters.status) {
        where.status = filters.status;
      }
      if (filters.isQualified !== undefined) {
        where.isQualified = filters.isQualified;
      }
      if (filters.destination) {
        where.destination = { contains: filters.destination, mode: 'insensitive' };
      }

      const leads = await prisma.chatbotLead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 50,
        skip: filters.offset || 0,
        include: {
          session: {
            select: {
              userId: true,
              createdAt: true,
              usedVoiceInput: true
            }
          }
        }
      });

      const total = await prisma.chatbotLead.count({ where });

      return { leads, total };
    } catch (error) {
      console.error('LeadService.getLeads error:', error);
      return { leads: [], total: 0 };
    }
  }

  /**
   * Update lead status
   */
  async updateLeadStatus(leadId, status, notes = null) {
    try {
      const lead = await prisma.chatbotLead.update({
        where: { id: leadId },
        data: {
          status,
          notes: notes || undefined,
          updatedAt: new Date()
        }
      });
      return lead;
    } catch (error) {
      console.error('LeadService.updateLeadStatus error:', error);
      return null;
    }
  }

  /**
   * Check if contact info is complete for booking
   */
  isContactComplete(context) {
    return !!(
      context.contact?.name &&
      context.contact?.email &&
      context.contact?.phone
    );
  }

  /**
   * Get missing contact fields
   */
  getMissingContactFields(context) {
    const missing = [];
    if (!context.contact?.name) missing.push('name');
    if (!context.contact?.email) missing.push('email');
    if (!context.contact?.phone) missing.push('phone');
    return missing;
  }

  /**
   * Get lead statistics (for dashboard)
   */
  async getLeadStats() {
    try {
      const [total, byPriority, byStatus, qualified] = await Promise.all([
        prisma.chatbotLead.count(),
        prisma.chatbotLead.groupBy({
          by: ['priority'],
          _count: { id: true }
        }),
        prisma.chatbotLead.groupBy({
          by: ['status'],
          _count: { id: true }
        }),
        prisma.chatbotLead.count({ where: { isQualified: true } })
      ]);

      return {
        total,
        qualified,
        byPriority: byPriority.reduce((acc, item) => {
          acc[item.priority] = item._count.id;
          return acc;
        }, {}),
        byStatus: byStatus.reduce((acc, item) => {
          acc[item.status] = item._count.id;
          return acc;
        }, {})
      };
    } catch (error) {
      console.error('LeadService.getLeadStats error:', error);
      return { total: 0, qualified: 0, byPriority: {}, byStatus: {} };
    }
  }
}

module.exports = new LeadService();
