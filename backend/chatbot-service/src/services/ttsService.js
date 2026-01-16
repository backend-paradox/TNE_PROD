/**
 * Text-to-Speech Service using ElevenLabs API
 */

const axios = require('axios');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // Rachel voice (default)

/**
 * Convert text to speech using ElevenLabs API
 * @param {string} text - The text to convert to speech
 * @param {object} options - Optional settings
 * @returns {Promise<Buffer>} - Audio buffer (MP3)
 */
async function textToSpeech(text, options = {}) {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured');
  }

  const voiceId = options.voiceId || ELEVENLABS_VOICE_ID;

  try {
    const response = await axios({
      method: 'POST',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      data: {
        text: text,
        model_id: options.modelId || 'eleven_turbo_v2_5',
        voice_settings: {
          stability: options.stability || 0.5,
          similarity_boost: options.similarityBoost || 0.75,
        },
      },
      responseType: 'arraybuffer',
    });

    return Buffer.from(response.data);
  } catch (error) {
    console.error('ElevenLabs TTS error:', error.response?.data?.toString() || error.message);
    throw new Error('Failed to generate speech');
  }
}

/**
 * Get available voices from ElevenLabs
 * @returns {Promise<Array>} - List of available voices
 */
async function getVoices() {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured');
  }

  try {
    const response = await axios({
      method: 'GET',
      url: 'https://api.elevenlabs.io/v1/voices',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    });

    return response.data.voices.map(voice => ({
      id: voice.voice_id,
      name: voice.name,
      category: voice.category,
      description: voice.description,
    }));
  } catch (error) {
    console.error('ElevenLabs get voices error:', error.message);
    throw new Error('Failed to fetch voices');
  }
}

/**
 * Check if TTS service is available
 * @returns {boolean}
 */
function isAvailable() {
  return !!ELEVENLABS_API_KEY;
}

module.exports = {
  textToSpeech,
  getVoices,
  isAvailable,
};
