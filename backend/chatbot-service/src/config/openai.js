const OpenAI = require('openai');
const config = require('./env');

let openaiClient = null;

function getOpenAIClient() {
  if (!openaiClient) {
    if (!config.openai.apiKey) {
      console.warn('OpenAI API key not configured. Intent detection will use fallback mode.');
      return null;
    }

    openaiClient = new OpenAI({
      apiKey: config.openai.apiKey
    });
  }

  return openaiClient;
}

module.exports = {
  getOpenAIClient,
  config: config.openai
};
