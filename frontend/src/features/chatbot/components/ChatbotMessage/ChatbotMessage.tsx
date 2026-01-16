import { Bot, User, Volume2 } from 'lucide-react';
import type { ChatMessage } from '../../types/chatbot.types';
import { PackageCard } from '../PackageCard/PackageCard';
import { QuickReplies } from '../QuickReplies/QuickReplies';
import styles from './ChatbotMessage.module.css';

interface ChatbotMessageProps {
  message: ChatMessage;
  onPackageSelect?: (packageId: string) => void;
  onQuickReply?: (text: string) => void;
  onSpeak?: (text: string) => void;
  isSpeaking?: boolean;
}

export function ChatbotMessage({
  message,
  onPackageSelect,
  onQuickReply,
  onSpeak,
  isSpeaking
}: ChatbotMessageProps) {
  const isUser = message.role === 'user';
  const isError = message.action === 'error';

  const renderContent = () => {
    // Render markdown-like formatting
    const formattedContent = message.content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br />');

    return (
      <div
        className={styles.textContent}
        dangerouslySetInnerHTML={{ __html: formattedContent }}
      />
    );
  };

  const renderPackages = () => {
    if (!message.data?.packages || message.data.packages.length === 0) return null;

    return (
      <div className={styles.packagesContainer}>
        {message.data.packages.map((pkg) => (
          <PackageCard
            key={pkg.package_id}
            package={pkg}
            onSelect={onPackageSelect}
          />
        ))}
      </div>
    );
  };

  const renderDestinations = () => {
    if (!message.data?.destinations || message.data.destinations.length === 0) return null;

    return (
      <div className={styles.destinationsGrid}>
        {message.data.destinations.map((dest) => (
          <div
            key={dest.id}
            className={styles.destinationCard}
            onClick={() => onQuickReply?.(`Show me packages for ${dest.name}`)}
          >
            {dest.image_url && (
              <img
                src={dest.image_url}
                alt={dest.name}
                className={styles.destinationImage}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <div className={styles.destinationInfo}>
              <h4 className={styles.destinationName}>{dest.name}</h4>
              <span className={styles.destinationMeta}>
                {dest.package_count} package{dest.package_count !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderBookingSummary = () => {
    if (!message.data?.booking) return null;
    const booking = message.data.booking;
    const isExpertCallback = message.data?.expert_callback || !message.data?.payment_required;

    return (
      <div className={styles.bookingSummary}>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Package:</span>
          <span className={styles.summaryValue}>{booking.packageTitle}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Destination:</span>
          <span className={styles.summaryValue}>{booking.destination}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Date:</span>
          <span className={styles.summaryValue}>{booking.travelDate}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Travelers:</span>
          <span className={styles.summaryValue}>{booking.travelers.total}</span>
        </div>
        <div className={styles.summaryDivider} />
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Estimated Total:</span>
          <span className={styles.summaryTotal}>₹{booking.totalPrice.toLocaleString()}</span>
        </div>
        {isExpertCallback ? (
          <div className={styles.expertCallback}>
            <p className={styles.callbackNote}>
              Our travel expert will contact you within 24 hours to finalize your booking.
            </p>
            <button
              className={styles.newSearchBtn}
              onClick={() => onQuickReply?.('Show me more destinations')}
            >
              Explore More Destinations
            </button>
          </div>
        ) : (
          <button
            className={styles.confirmBtn}
            onClick={() => onQuickReply?.('Confirm booking')}
          >
            Confirm & Pay
          </button>
        )}
      </div>
    );
  };

  const renderSuggestions = () => {
    // Support both suggestions (simple strings) and quick_replies (objects with text/value)
    const hasQuickReplies = message.data?.quick_replies && message.data.quick_replies.length > 0;
    const hasSuggestions = message.data?.suggestions && message.data.suggestions.length > 0;

    if (!hasQuickReplies && !hasSuggestions) return null;

    return (
      <QuickReplies
        suggestions={hasSuggestions ? message.data.suggestions : undefined}
        quickReplies={hasQuickReplies ? message.data.quick_replies : undefined}
        onSelect={(text) => onQuickReply?.(text)}
      />
    );
  };

  return (
    <div className={`${styles.messageContainer} ${isUser ? styles.user : styles.assistant}`}>
      {!isUser && (
        <div className={styles.avatar}>
          <Bot size={18} />
        </div>
      )}

      <div className={`${styles.messageBubble} ${isError ? styles.error : ''}`}>
        {renderContent()}
        {renderPackages()}
        {renderDestinations()}
        {renderBookingSummary()}
        {renderSuggestions()}
        {!isUser && onSpeak && (
          <button
            className={`${styles.speakBtn} ${isSpeaking ? styles.speaking : ''}`}
            onClick={() => onSpeak(message.content)}
            title="Play message"
          >
            <Volume2 size={14} />
          </button>
        )}
      </div>

      {isUser && (
        <div className={`${styles.avatar} ${styles.userAvatar}`}>
          <User size={18} />
        </div>
      )}
    </div>
  );
}

export default ChatbotMessage;
