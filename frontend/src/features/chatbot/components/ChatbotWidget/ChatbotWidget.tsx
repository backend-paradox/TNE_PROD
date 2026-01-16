import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import ChatbotWindow from '../ChatbotWindow/ChatbotWindow';
import { RobotAvatar } from '../RobotAvatar/RobotAvatar';
import styles from './ChatbotWidget.module.css';

const GREETING_DISMISSED_KEY = 'te-chatbot-greeting-dismissed';
const GREETING_RESET_DAYS = 7;

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);

  useEffect(() => {
    // Check if greeting was previously dismissed
    const checkGreetingStatus = () => {
      try {
        const dismissedTime = localStorage.getItem(GREETING_DISMISSED_KEY);
        if (dismissedTime) {
          const dismissedDate = new Date(parseInt(dismissedTime, 10));
          const now = new Date();
          const daysSinceDismissed = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);

          // If dismissed more than GREETING_RESET_DAYS ago, show again
          if (daysSinceDismissed > GREETING_RESET_DAYS) {
            localStorage.removeItem(GREETING_DISMISSED_KEY);
            return false; // Not dismissed (expired)
          }
          return true; // Still dismissed
        }
        return false; // Never dismissed
      } catch (error) {
        console.error('Error checking greeting status:', error);
        return false;
      }
    };

    const isDismissed = checkGreetingStatus();

    // Show greeting bubble after 3 seconds if widget hasn't been opened and greeting wasn't dismissed
    if (!isDismissed) {
      const timer = setTimeout(() => {
        if (!isOpen) {
          setShowGreeting(true);
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasUnread(false);
      setShowGreeting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const dismissGreeting = () => {
    setShowGreeting(false);
    // Store dismissal time in localStorage
    try {
      localStorage.setItem(GREETING_DISMISSED_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error saving greeting dismissal:', error);
    }
  };

  return (
    <div className={styles.widgetContainer}>
      {/* Greeting Bubble */}
      {showGreeting && !isOpen && (
        <div className={styles.greetingBubble}>
          <button
            className={styles.greetingClose}
            onClick={dismissGreeting}
            aria-label="Dismiss greeting"
          >
            <X size={14} />
          </button>
          <p className={styles.greetingText}>
            Looking for your next adventure? I can help you find the perfect trip!
          </p>
          <button
            className={styles.greetingCta}
            onClick={handleToggle}
          >
            Start Planning
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={styles.windowWrapper}>
          <ChatbotWindow onClose={handleClose} />
        </div>
      )}

      {/* Robot Avatar Button - Always visible */}
      <button
        className={styles.toggleButton}
        onClick={handleToggle}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        type="button"
      >
        <RobotAvatar size={70} isOpen={isOpen} />
        {hasUnread && !isOpen && <span className={styles.unreadBadge} />}
      </button>
    </div>
  );
};

export default ChatbotWidget;
