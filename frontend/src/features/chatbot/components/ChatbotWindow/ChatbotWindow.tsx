import { useState, useRef, useEffect } from 'react';
import { X, Send, RotateCcw, Loader2, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import { useChatbotStore } from '../../store/useChatbotStore';
import { ChatbotMessage } from '../ChatbotMessage/ChatbotMessage';
import { useVoice } from '../../hooks/useVoice';
import styles from './ChatbotWindow.module.css';

interface ChatbotWindowProps {
  onClose: () => void;
}

export function ChatbotWindow({ onClose }: ChatbotWindowProps) {
  const [inputValue, setInputValue] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [showAutoplayPrompt, setShowAutoplayPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastBotMessageRef = useRef<string>('');
  const autoplayPromptDismissedRef = useRef(false);

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearSession,
    clearError
  } = useChatbotStore();

  // Track if last message was sent via voice
  const usedVoiceInputRef = useRef(false);

  // Voice functionality
  const {
    isListening,
    startListening,
    stopListening,
    transcript,
    sttSupported,
    isSpeaking,
    speak,
    stopSpeaking,
    ttsAvailable,
    serverTtsAvailable,
  } = useVoice({
    onTranscript: (text) => {
      if (text.trim()) {
        usedVoiceInputRef.current = true; // Mark that voice was used
        sendMessage(text, { isVoiceInput: true }); // Pass voice flag
      }
    },
    onError: (err) => {
      console.error('Voice error:', err);

      // Handle autoplay blocking specifically
      if (err.includes('autoplay blocked') && !autoplayPromptDismissedRef.current) {
        setShowAutoplayPrompt(true);
      } else {
        setVoiceError(err);
        setTimeout(() => setVoiceError(null), 3000); // Clear after 3 seconds
      }
    },
  });

  // Auto-scroll to bottom when messages change or when listening/loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isListening, isLoading]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Update input when transcript changes
  useEffect(() => {
    if (transcript) {
      setInputValue(transcript);
    }
  }, [transcript]);

  // Auto-speak bot responses when voice is enabled OR when user used voice input
  useEffect(() => {
    if (!ttsAvailable) return;

    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage &&
      lastMessage.role === 'assistant' &&
      lastMessage.content !== lastBotMessageRef.current
    ) {
      lastBotMessageRef.current = lastMessage.content;

      // Speak if voice is enabled OR if user sent message via voice
      if (voiceEnabled || usedVoiceInputRef.current) {
        speak(lastMessage.content);
        usedVoiceInputRef.current = false; // Reset after speaking
      }
    }
  }, [messages, voiceEnabled, ttsAvailable, speak]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    sendMessage(inputValue);
    setInputValue('');
  };

  const handlePackageSelect = (packageId: string) => {
    sendMessage(`I want to select package ${packageId}`);
  };

  const handleQuickReply = (text: string) => {
    sendMessage(text);
  };

  const handleReset = async () => {
    await clearSession();
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const toggleVoice = () => {
    if (voiceEnabled) {
      stopSpeaking();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const handleEnableSound = () => {
    // Dismiss the prompt
    setShowAutoplayPrompt(false);
    autoplayPromptDismissedRef.current = true;

    // Enable voice and try to play a short silent audio to unlock autoplay
    setVoiceEnabled(true);

    // Create and play a silent audio to unlock autoplay policy
    const audio = new Audio('data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV');
    audio.volume = 0.01;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.error('Failed to unlock autoplay:', err);
      });
    }
  };

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <div className={styles.logo}>
            <img
              src="/assets/images/logo/logo-main.svg"
              alt="Trip & Event"
              className={styles.logoImage}
            />
          </div>
          <div className={styles.headerText}>
            <h3 className={styles.title}>Trip & Event</h3>
            <span className={styles.subtitle}>Travel Assistant</span>
          </div>
        </div>
        <div className={styles.headerActions}>
          {ttsAvailable && (
            <button
              className={`${styles.headerBtn} ${voiceEnabled ? styles.active : ''}`}
              onClick={toggleVoice}
              title={
                voiceEnabled
                  ? `Mute voice (${serverTtsAvailable ? 'Premium' : 'Browser'})`
                  : `Enable voice (${serverTtsAvailable ? 'Premium' : 'Browser'})`
              }
            >
              {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          )}
          <button
            className={styles.headerBtn}
            onClick={handleReset}
            title="Start over"
          >
            <RotateCcw size={16} />
          </button>
          <button
            className={styles.headerBtn}
            onClick={onClose}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Autoplay Prompt Banner */}
      {showAutoplayPrompt && (
        <div className={styles.autoplayBanner}>
          <span>🔊 Enable voice responses</span>
          <div className={styles.autoplayActions}>
            <button onClick={handleEnableSound} className={styles.autoplayEnableBtn}>
              Enable Sound
            </button>
            <button
              onClick={() => {
                setShowAutoplayPrompt(false);
                autoplayPromptDismissedRef.current = true;
              }}
              className={styles.autoplayDismissBtn}
            >
              Not now
            </button>
          </div>
        </div>
      )}

      {/* Voice Error Toast */}
      {voiceError && (
        <div className={styles.voiceError}>
          <span>{voiceError}</span>
          <button onClick={() => setVoiceError(null)} aria-label="Dismiss error">×</button>
        </div>
      )}

      {/* Messages */}
      <div className={styles.messagesContainer}>
        <div className={styles.messagesInner}>
          {messages.map((message) => (
            <ChatbotMessage
              key={message.id}
              message={message}
              onPackageSelect={handlePackageSelect}
              onQuickReply={handleQuickReply}
              onSpeak={ttsAvailable ? speak : undefined}
              isSpeaking={isSpeaking}
            />
          ))}

          {/* Listening indicator - shows user we're waiting for them to finish speaking */}
          {isListening && (
            <div className={styles.listeningIndicator}>
              <Mic size={18} className={styles.micIcon} />
              <div className={styles.listeningText}>
                <strong>Listening...</strong>
                <span>Speak now. I'll wait until you finish.</span>
                {transcript && (
                  <div className={styles.transcriptPreview}>
                    "{transcript}"
                  </div>
                )}
              </div>
            </div>
          )}

          {isLoading && (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingContent}>
                <div className={styles.loadingDots}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className={styles.loadingText}>Thinking...</span>
              </div>
            </div>
          )}

          {error && (
            <div className={styles.errorMessage}>
              <span>{error}</span>
              <button onClick={clearError}>Dismiss</button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <form className={styles.inputContainer} onSubmit={handleSubmit}>
        {sttSupported && (
          <button
            type="button"
            className={`${styles.micBtn} ${isListening ? styles.listening : ''}`}
            onClick={handleMicClick}
            disabled={isLoading}
            title={isListening ? 'Stop listening' : 'Start voice input'}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        )}
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder={isListening ? 'Voice input active - speak now...' : 'Type your message...'}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isLoading || isListening}
          aria-label={isListening ? 'Input disabled - voice recording in progress' : 'Type your message'}
          title={isListening ? 'Voice input is active. Speak your message.' : ''}
        />
        <button
          type="submit"
          className={styles.sendBtn}
          disabled={!inputValue.trim() || isLoading}
        >
          {isLoading ? (
            <Loader2 size={18} className={styles.spinner} />
          ) : (
            <Send size={18} />
          )}
        </button>
      </form>

      {/* Footer */}
      <div className={styles.footer}>
        <span>Powered by Trip & Event AI</span>
      </div>
    </motion.div>
  );
}

export default ChatbotWindow;
