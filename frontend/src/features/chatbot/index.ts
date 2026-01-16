// Components
export { default as ChatbotWidget } from './components/ChatbotWidget/ChatbotWidget';
export { default as ChatbotWindow } from './components/ChatbotWindow/ChatbotWindow';
export { default as ChatbotMessage } from './components/ChatbotMessage/ChatbotMessage';
export { default as PackageCard } from './components/PackageCard/PackageCard';
export { default as QuickReplies } from './components/QuickReplies/QuickReplies';
export { RobotAvatar } from './components/RobotAvatar/RobotAvatar';

// Store
export { useChatbotStore } from './store/useChatbotStore';

// Hooks
export { useVoice } from './hooks/useVoice';

// Types
export type {
  ChatMessage,
  ChatSession,
  Package,
  Destination,
  QuickReply,
  ChatbotState,
  SendMessageRequest,
  ChatbotResponse,
} from './types/chatbot.types';

// API
export { chatbotAPI } from './api/chatbot.api';

// Utils
export {
  getOrCreateSessionId,
  getStoredSession,
  storeSession,
  clearStoredSession
} from './utils/sessionManager';
