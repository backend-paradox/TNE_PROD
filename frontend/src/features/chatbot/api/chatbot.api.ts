import axios from '../../../app/axios';
import type { ChatbotResponse, ConversationContext } from '../types/chatbot.types';

// Note: axios baseURL is already http://localhost:5000/api/v1, so we only need /chatbot
const API_BASE = '/chatbot';

export interface SendMessageOptions {
  isVoiceInput?: boolean;
}

export const chatbotAPI = {
  /**
   * Send a message to the chatbot
   */
  sendMessage: async (
    sessionId: string,
    message: string,
    context?: Partial<ConversationContext>,
    options?: SendMessageOptions
  ): Promise<ChatbotResponse> => {
    const response = await axios.post(`${API_BASE}/message`, {
      session_id: sessionId,
      user_message: message,
      context: context || {},
      is_voice_input: options?.isVoiceInput || false
    });
    return response.data;
  },

  /**
   * Initialize a new chat session
   */
  initSession: async (): Promise<ChatbotResponse> => {
    const response = await axios.post(`${API_BASE}/init`);
    return response.data;
  },

  /**
   * Get session details and history
   */
  getSession: async (sessionId: string): Promise<{
    sessionId: string;
    context: ConversationContext;
    messages: Array<{
      id: string;
      role: string;
      content: string;
      createdAt: string;
    }>;
  }> => {
    const response = await axios.get(`${API_BASE}/session/${sessionId}`);
    return response.data.data;
  },

  /**
   * Clear/deactivate a session
   */
  clearSession: async (sessionId: string): Promise<void> => {
    await axios.delete(`${API_BASE}/session/${sessionId}`);
  },

  /**
   * Request a callback from travel expert
   */
  requestCallback: async (
    sessionId: string,
    contactInfo: { name?: string; phone: string; email?: string }
  ): Promise<{ status: string; message: string }> => {
    const response = await axios.post(`${API_BASE}/callback`, {
      session_id: sessionId,
      ...contactInfo
    });
    return response.data;
  }
};

export default chatbotAPI;
