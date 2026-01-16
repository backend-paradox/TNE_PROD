const chatbotService = require('../services/chatbotService');
const leadService = require('../services/leadService');
const { v4: uuidv4 } = require('uuid');

class ChatbotController {
  /**
   * POST /api/v1/chatbot/message
   * Process a user message
   */
  async processMessage(req, res, next) {
    try {
      const { session_id, user_message, context, is_voice_input } = req.body;

      // Validate input
      if (!user_message || typeof user_message !== 'string' || user_message.trim().length === 0) {
        return res.status(400).json({
          status: 'error',
          code: 'INVALID_MESSAGE',
          message: 'Please type or speak your message'
        });
      }

      // Generate session ID if not provided
      const sessionId = session_id || uuidv4();

      // Get user ID if authenticated (from JWT)
      const userId = req.user?.id || null;

      // Process message with voice flag
      const response = await chatbotService.processMessage(
        sessionId,
        user_message.trim(),
        context || {},
        userId,
        { isVoiceInput: is_voice_input || false }
      );

      // Add session ID to response
      response.session_id = sessionId;

      res.json(response);
    } catch (error) {
      // Log error but return user-friendly message
      console.error('ChatbotController.processMessage error:', error);
      res.json({
        status: 'error',
        action: 'error',
        message: "I'm having a moment! Could you try that again?",
        retry: true,
        session_id: req.body.session_id || uuidv4(),
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * GET /api/v1/chatbot/session/:sessionId
   * Get session info and history
   */
  async getSession(req, res, next) {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({
          status: 'error',
          code: 'INVALID_SESSION_ID',
          message: 'sessionId is required'
        });
      }

      const session = await chatbotService.getSession(sessionId);

      res.json({
        status: 'success',
        data: session
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/chatbot/session/:sessionId
   * Clear/deactivate a session
   */
  async clearSession(req, res, next) {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({
          status: 'error',
          code: 'INVALID_SESSION_ID',
          message: 'sessionId is required'
        });
      }

      const result = await chatbotService.clearSession(sessionId);

      res.json({
        status: 'success',
        message: 'Session cleared successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/chatbot/init
   * Initialize a new chat session and get greeting
   */
  async initSession(req, res, next) {
    try {
      const sessionId = uuidv4();
      const userId = req.user?.id || null;

      // Process empty message to get greeting
      const response = await chatbotService.processMessage(
        sessionId,
        'hi',
        {},
        userId
      );

      response.session_id = sessionId;

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ChatbotController();
