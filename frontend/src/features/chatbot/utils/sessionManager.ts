// Session management utilities

const SESSION_KEY = 'tne_chatbot_session';
const SESSION_EXPIRY_HOURS = 24;

export interface StoredSession {
  sessionId: string;
  createdAt: string;
  expiresAt: string;
}

/**
 * Get or create a session ID
 */
export function getOrCreateSessionId(): string {
  const stored = getStoredSession();

  if (stored && !isExpired(stored)) {
    return stored.sessionId;
  }

  // Create new session
  const sessionId = generateSessionId();
  storeSession(sessionId);
  return sessionId;
}

/**
 * Get stored session from localStorage
 */
export function getStoredSession(): StoredSession | null {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Store session in localStorage
 */
export function storeSession(sessionId: string): void {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);

  const session: StoredSession = {
    sessionId,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString()
  };

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to store session:', error);
  }
}

/**
 * Clear stored session
 */
export function clearStoredSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Failed to clear session:', error);
  }
}

/**
 * Check if session is expired
 */
function isExpired(session: StoredSession): boolean {
  try {
    const expiresAt = new Date(session.expiresAt);
    return expiresAt < new Date();
  } catch {
    return true;
  }
}

/**
 * Generate a UUID-like session ID
 */
function generateSessionId(): string {
  // Use crypto.randomUUID if available
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback to manual generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
