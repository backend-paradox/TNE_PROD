const express = require('express');
const chatbotController = require('../controllers/chatbot.controller');
const ttsController = require('../controllers/tts.controller');
const leadService = require('../services/leadService');

const router = express.Router();

/**
 * @route   POST /api/v1/chatbot/message
 * @desc    Process user message and get chatbot response
 * @access  Public
 * @body    { session_id?: string, user_message: string, context?: object, is_voice_input?: boolean }
 */
router.post('/message', chatbotController.processMessage);

/**
 * @route   POST /api/v1/chatbot/init
 * @desc    Initialize a new chat session with greeting
 * @access  Public
 */
router.post('/init', chatbotController.initSession);

/**
 * @route   GET /api/v1/chatbot/session/:sessionId
 * @desc    Get session information and message history
 * @access  Public
 */
router.get('/session/:sessionId', chatbotController.getSession);

/**
 * @route   DELETE /api/v1/chatbot/session/:sessionId
 * @desc    Clear/deactivate a chat session
 * @access  Public
 */
router.delete('/session/:sessionId', chatbotController.clearSession);

/**
 * @route   POST /api/v1/chatbot/callback
 * @desc    Request a callback from travel expert
 * @access  Public
 * @body    { session_id: string, name?: string, phone: string, email?: string }
 */
router.post('/callback', async (req, res) => {
  try {
    const { session_id, name, phone, email } = req.body;

    if (!phone) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide your phone number'
      });
    }

    const lead = await leadService.requestCallback(session_id, { name, phone, email });

    res.json({
      status: 'success',
      message: 'Thank you! Our travel expert will call you within 24 hours.',
      data: { lead_id: lead?.id }
    });
  } catch (error) {
    console.error('Callback request error:', error);
    res.json({
      status: 'success',
      message: 'Thank you! Our travel expert will contact you soon.'
    });
  }
});

/**
 * @route   GET /api/v1/chatbot/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'chatbot-service',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   POST /api/v1/chatbot/tts
 * @desc    Convert text to speech using ElevenLabs
 * @access  Public
 * @body    { text: string }
 */
router.post('/tts', ttsController.synthesize);

/**
 * @route   GET /api/v1/chatbot/tts/voices
 * @desc    Get available TTS voices
 * @access  Public
 */
router.get('/tts/voices', ttsController.getVoices);

/**
 * @route   GET /api/v1/chatbot/tts/status
 * @desc    Check if TTS service is available
 * @access  Public
 */
router.get('/tts/status', ttsController.getStatus);

module.exports = router;
