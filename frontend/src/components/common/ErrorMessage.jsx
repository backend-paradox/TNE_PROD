import './ErrorMessage.css';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-message-container">
      <div className="error-icon">⚠️</div>
      <h3 className="error-title">Oops! Something went wrong</h3>
      <p className="error-text">{message || 'An unexpected error occurred. Please try again.'}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-primary">
          Try Again
        </button>
      )}
    </div>
  );
}
