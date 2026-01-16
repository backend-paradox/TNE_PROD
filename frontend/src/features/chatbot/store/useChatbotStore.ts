import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { chatbotAPI } from '../api/chatbot.api';
import { getOrCreateSessionId, clearStoredSession, storeSession } from '../utils/sessionManager';
import type {
  ChatMessage,
  ConversationContext,
  ChatbotState,
  ChatbotResponse,
  ACTION_TYPES
} from '../types/chatbot.types';

interface SendMessageOptions {
  isVoiceInput?: boolean;
}

interface ChatbotStore extends ChatbotState {
  // Actions
  initSession: () => Promise<void>;
  sendMessage: (content: string, options?: SendMessageOptions) => Promise<void>;
  toggleOpen: () => void;
  setOpen: (isOpen: boolean) => void;
  clearSession: () => Promise<void>;
  clearError: () => void;
  requestCallback: (phone: string, name?: string, email?: string) => Promise<boolean>;
}

const initialState: ChatbotState = {
  sessionId: null,
  messages: [],
  context: null,
  isOpen: false,
  isLoading: false,
  error: null,
  isInitialized: false
};

export const useChatbotStore = create<ChatbotStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      initSession: async () => {
        const state = get();

        // Skip if already initialized and has messages
        if (state.isInitialized && state.messages.length > 0) {
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const sessionId = getOrCreateSessionId();
          const response = await chatbotAPI.initSession();

          // Store session ID from response
          if (response.session_id) {
            storeSession(response.session_id);
          }

          const assistantMessage: ChatMessage = {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            content: response.message,
            timestamp: response.timestamp || new Date().toISOString(),
            action: response.action,
            data: response.data
          };

          set({
            sessionId: response.session_id || sessionId,
            messages: [assistantMessage],
            context: response.context || null,
            isLoading: false,
            isInitialized: true
          });
        } catch (error: any) {
          console.error('Failed to initialize chatbot:', error);
          set({
            error: 'Failed to start chat. Please try again.',
            isLoading: false
          });
        }
      },

      sendMessage: async (content: string, options?: SendMessageOptions) => {
        const state = get();

        if (!content.trim()) return;

        // Ensure session exists
        let sessionId = state.sessionId;
        if (!sessionId) {
          sessionId = getOrCreateSessionId();
          set({ sessionId });
        }

        // Add user message immediately
        const userMessage: ChatMessage = {
          id: `msg_user_${Date.now()}`,
          role: 'user',
          content: content.trim(),
          timestamp: new Date().toISOString()
        };

        set({
          messages: [...state.messages, userMessage],
          isLoading: true,
          error: null
        });

        try {
          const response = await chatbotAPI.sendMessage(
            sessionId,
            content.trim(),
            state.context || undefined,
            { isVoiceInput: options?.isVoiceInput || false }
          );

          // Update session ID if changed
          if (response.session_id && response.session_id !== sessionId) {
            storeSession(response.session_id);
          }

          // Create assistant message
          const assistantMessage: ChatMessage = {
            id: `msg_bot_${Date.now()}`,
            role: 'assistant',
            content: response.message,
            timestamp: response.timestamp || new Date().toISOString(),
            action: response.action,
            data: response.data
          };

          set({
            sessionId: response.session_id || sessionId,
            messages: [...get().messages, assistantMessage],
            context: response.context || state.context,
            isLoading: false
          });
        } catch (error: any) {
          console.error('Failed to send message:', error);

          // Add friendly error message
          const errorMessage: ChatMessage = {
            id: `msg_error_${Date.now()}`,
            role: 'assistant',
            content: "I'm having a moment! Could you try that again?",
            timestamp: new Date().toISOString(),
            action: 'error'
          };

          set({
            messages: [...get().messages, errorMessage],
            error: null, // Don't show error banner, message is enough
            isLoading: false
          });
        }
      },

      toggleOpen: () => {
        const state = get();
        const newIsOpen = !state.isOpen;

        set({ isOpen: newIsOpen });

        // Initialize session when opening for the first time
        if (newIsOpen && !state.isInitialized) {
          get().initSession();
        }
      },

      setOpen: (isOpen: boolean) => {
        const state = get();
        set({ isOpen });

        // Initialize session when opening for the first time
        if (isOpen && !state.isInitialized) {
          get().initSession();
        }
      },

      clearSession: async () => {
        const state = get();

        if (state.sessionId) {
          try {
            await chatbotAPI.clearSession(state.sessionId);
          } catch (error) {
            console.error('Failed to clear session on server:', error);
          }
        }

        clearStoredSession();

        set({
          ...initialState,
          isOpen: state.isOpen // Keep open state
        });

        // Re-initialize with fresh session
        if (state.isOpen) {
          get().initSession();
        }
      },

      clearError: () => {
        set({ error: null });
      },

      requestCallback: async (phone: string, name?: string, email?: string) => {
        const state = get();
        if (!state.sessionId) return false;

        try {
          const response = await chatbotAPI.requestCallback(state.sessionId, {
            phone,
            name,
            email
          });

          // Add confirmation message
          const confirmMessage: ChatMessage = {
            id: `msg_callback_${Date.now()}`,
            role: 'assistant',
            content: response.message || 'Our travel expert will contact you within 24 hours!',
            timestamp: new Date().toISOString(),
            action: 'callback_confirmed'
          };

          set({
            messages: [...state.messages, confirmMessage]
          });

          return true;
        } catch (error) {
          console.error('Failed to request callback:', error);
          return false;
        }
      }
    }),
    {
      name: 'tne-chatbot-store',
      partialize: (state) => ({
        // Only persist these fields
        isOpen: state.isOpen
        // Don't persist messages - they're loaded from session
      })
    }
  )
);

export default useChatbotStore;
