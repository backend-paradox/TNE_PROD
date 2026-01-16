import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, Smartphone, Globe, Clock, Loader2, AlertTriangle, RefreshCw, X } from 'lucide-react';
import { useAppDispatch } from '../../store/hooks';
import { getLoginHistory, logout, revokeAllTokens, revokeSession } from '../../store/slices/authSlice';
import { LoginHistoryItem } from '../../types';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../common/ConfirmModal';
import styles from './ProfileComponents.module.css';

const parseUserAgent = (userAgent: string): { device: string; browser: string; os: string } => {
  let device = 'Desktop';
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';

  // Detect device type
  if (/mobile/i.test(userAgent)) {
    device = 'Mobile';
  } else if (/tablet|ipad/i.test(userAgent)) {
    device = 'Tablet';
  }

  // Detect browser
  if (/chrome/i.test(userAgent) && !/edge|edg/i.test(userAgent)) {
    browser = 'Chrome';
  } else if (/firefox/i.test(userAgent)) {
    browser = 'Firefox';
  } else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) {
    browser = 'Safari';
  } else if (/edge|edg/i.test(userAgent)) {
    browser = 'Edge';
  } else if (/opera|opr/i.test(userAgent)) {
    browser = 'Opera';
  }

  // Detect OS
  if (/windows/i.test(userAgent)) {
    os = 'Windows';
  } else if (/macintosh|mac os/i.test(userAgent)) {
    os = 'macOS';
  } else if (/linux/i.test(userAgent)) {
    os = 'Linux';
  } else if (/android/i.test(userAgent)) {
    os = 'Android';
  } else if (/iphone|ipad|ipod/i.test(userAgent)) {
    os = 'iOS';
  }

  return { device, browser, os };
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function LoginHistory() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [history, setHistory] = useState<LoginHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevoking, setIsRevoking] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [sessionToRevoke, setSessionToRevoke] = useState<number | null>(null);
  const [revokingSessionId, setRevokingSessionId] = useState<number | null>(null);

  const loadHistory = async () => {
    setIsLoading(true);
    const result = await dispatch(getLoginHistory({ page: 1, limit: 10 })).unwrap();
    setHistory(result.history);
    setIsLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleRevokeAll = async () => {
    setIsRevokeModalOpen(false);
    setIsRevoking(true);

    const result = await dispatch(revokeAllTokens()).unwrap();

    if (result.success) {
      await dispatch(logout()).unwrap();
      toast.success('All sessions revoked. Please log in again.');
      // Redirect to auth page with message
      navigate('/auth', { state: { message: 'All sessions revoked. Please log in again.' } });
    } else {
      setIsRevoking(false);
      toast.error(result.error || 'Failed to revoke sessions');
    }
  };

  const handleRevokeSession = async () => {
    if (!sessionToRevoke) return;

    setSessionToRevoke(null); // Close modal
    setRevokingSessionId(sessionToRevoke);

    const result = await dispatch(revokeSession({ sessionId: sessionToRevoke })).unwrap();

    if (result.success) {
      toast.success('Session revoked successfully');
      // Refresh the login history
      await loadHistory();
    } else {
      toast.error(result.error || 'Failed to revoke session');
    }

    setRevokingSessionId(null);
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ margin: '0 auto', color: '#0d9488' }} />
        <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading login history...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem' }}>
            Login History
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Recent login sessions on your account.
          </p>
        </div>
        <button
          onClick={() => setIsRevokeModalOpen(true)}
          disabled={isRevoking}
          className={styles.btnDelete}
          style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
        >
          {isRevoking ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
          Revoke All Sessions
        </button>
      </div>

      {history.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Clock className="w-8 h-8" />
          </div>
          <p className={styles.emptyTitle}>No login history found</p>
          <p className={styles.emptyText}>
            Your login history will appear here. If you just logged in, this session should appear shortly.
          </p>
        </div>
      ) : (
        <div>
          {history.map((item) => {
            const { device, browser, os } = parseUserAgent(item.userAgent);
            const DeviceIcon = device === 'Mobile' || device === 'Tablet' ? Smartphone : Monitor;

            return (
              <div key={item.id} className={styles.historyItem}>
                <div className={styles.historyIcon}>
                  <DeviceIcon className="w-5 h-5" />
                </div>
                <div className={styles.historyInfo}>
                  <p className={styles.historyDevice}>
                    {browser} on {os}
                  </p>
                  <p className={styles.historyDetails}>
                    <Globe className="w-3 h-3" style={{ display: 'inline', marginRight: '0.25rem' }} />
                    {item.ipAddress}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className={styles.historyTime}>
                    {formatDate(item.createdAt)}
                  </div>
                  <button
                    onClick={() => setSessionToRevoke(item.id)}
                    disabled={revokingSessionId === item.id}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '8px',
                      background: revokingSessionId === item.id ? '#f1f5f9' : '#fee2e2',
                      border: 'none',
                      cursor: revokingSessionId === item.id ? 'not-allowed' : 'pointer',
                      color: '#dc2626',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onMouseEnter={(e) => {
                      if (revokingSessionId !== item.id) {
                        e.currentTarget.style.background = '#fecaca';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (revokingSessionId !== item.id) {
                        e.currentTarget.style.background = '#fee2e2';
                      }
                    }}
                    title="Revoke this session"
                  >
                    {revokingSessionId === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}

          <button
            onClick={loadHistory}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              margin: '1rem auto 0',
              padding: '0.5rem 1rem',
              background: 'none',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={isRevokeModalOpen}
        onClose={() => setIsRevokeModalOpen(false)}
        onConfirm={handleRevokeAll}
        title="Revoke All Sessions"
        message="This will log you out from all devices. You'll need to log in again. Are you sure?"
        confirmText="Revoke All Sessions"
        cancelText="Cancel"
        variant="danger"
      />

      <ConfirmModal
        isOpen={sessionToRevoke !== null}
        onClose={() => setSessionToRevoke(null)}
        onConfirm={handleRevokeSession}
        title="Revoke This Session"
        message="This will immediately terminate this login session. Are you sure you want to continue?"
        confirmText="Revoke Session"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}

export default LoginHistory;
