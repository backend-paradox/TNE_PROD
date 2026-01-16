/**
 * TTS Controller - Text-to-Speech endpoints
 */

const ttsService = require('../services/ttsService');

/**
 * Convert text to speech
 * POST /api/v1/chatbot/tts
 */
exports.synthesize = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Text is required',
      });
    }

    // Limit text length to prevent abuse
    if (text.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Text too long. Maximum 1000 characters.',
      });
    }

    const audioBuffer = await ttsService.textToSpeech(text);

    // Set appropriate headers for audio response
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
      'Cache-Control': 'no-cache',
    });

    res.send(audioBuffer);
  } catch (error) {
    console.error('TTS synthesis error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to synthesize speech',
    });
  }
};

/**
 * Get available voices
 * GET /api/v1/chatbot/tts/voices
 */
exports.getVoices = async (req, res) => {
  try {
    const voices = await ttsService.getVoices();
    res.json({
      success: true,
      voices,
    });
  } catch (error) {
    console.error('Get voices error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch voices',
    });
  }
};

/**
 * Check TTS service status
 * GET /api/v1/chatbot/tts/status
 */
exports.getStatus = (req, res) => {
  res.json({
    success: true,
    available: ttsService.isAvailable(),
    provider: 'elevenlabs',
  });
};
