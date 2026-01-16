import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail, ArrowLeft, RefreshCw, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import axiosInstance from '../app/axios';
import styles from './AuthPage.module.css';

type VerificationStatus = 'loading' | 'success' | 'error' | 'expired' | 'already_verified';

export function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await axiosInstance.post('/auth/verify-email', { token: verificationToken });
      setStatus('success');
      setMessage(response.data.message || 'Your email has been verified successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Verification failed';

      if (errorMessage.toLowerCase().includes('expired')) {
        setStatus('expired');
        setMessage('Your verification link has expired. Please request a new one.');
      } else if (errorMessage.toLowerCase().includes('already verified')) {
        setStatus('already_verified');
        setMessage('Your email is already verified. You can sign in now.');
      } else {
        setStatus('error');
        setMessage(errorMessage);
      }
    }
  };

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;

    setResendLoading(true);
    try {
      await axiosInstance.post('/auth/resend-verification', { email: resendEmail });
      setResendSuccess(true);
    } catch (error: any) {
      // For security, show success even if email doesn't exist
      setResendSuccess(true);
    } finally {
      setResendLoading(false);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={styles.successView}
          >
            <Loader2 className={styles.loadingIcon} />
            <h2 className={styles.successTitle}>Verifying Your Email</h2>
            <p className={styles.successText}>
              Please wait while we verify your email address...
            </p>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={styles.successView}
          >
            <CheckCircle className={styles.successIcon} />
            <h2 className={styles.successTitle}>Email Verified!</h2>
            <p className={styles.successText}>{message}</p>
            <button
              onClick={() => navigate('/auth?type=login')}
              className={styles.submitButton}
              style={{ marginTop: '1.5rem' }}
            >
              Sign In to Your Account
            </button>
          </motion.div>
        );

      case 'already_verified':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={styles.successView}
          >
            <CheckCircle className={styles.alreadyVerifiedIcon} />
            <h2 className={styles.successTitle}>Already Verified</h2>
            <p className={styles.successText}>{message}</p>
            <button
              onClick={() => navigate('/auth?type=login')}
              className={styles.submitButton}
              style={{ marginTop: '1.5rem' }}
            >
              Sign In Now
            </button>
          </motion.div>
        );

      case 'expired':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={styles.formWrapper}
          >
            <div className={styles.forgotHeader}>
              <div className={styles.forgotIconWrapper} style={{ background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, rgba(251, 191, 36, 0.1) 100%)' }}>
                <RefreshCw className={styles.forgotIcon} style={{ color: '#d97706' }} />
              </div>
              <h2 className={styles.formTitle}>Link Expired</h2>
              <p className={styles.formSubtitle}>{message}</p>
            </div>

            {!resendSuccess ? (
              <form onSubmit={handleResendVerification} className={styles.form}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Email Address</label>
                  <div className={styles.inputWrapper}>
                    <Mail className={styles.inputIcon} />
                    <input
                      type="email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="Enter your email"
                      className={styles.input}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resendLoading}
                  className={styles.submitButton}
                >
                  {resendLoading ? (
                    <>
                      <Loader2 className={`${styles.mediumIcon} ${styles.buttonSpinner}`} />
                      Sending...
                    </>
                  ) : (
                    'Resend Verification Email'
                  )}
                </button>
              </form>
            ) : (
              <div className={styles.centerText}>
                <CheckCircle className={styles.resendSuccessIcon} />
                <p className={styles.successText}>
                  If an account exists with that email, we've sent a new verification link.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => navigate('/auth?type=login')}
              className={styles.backButton}
            >
              <ArrowLeft className={styles.smallIcon} />
              Back to Sign In
            </button>
          </motion.div>
        );

      case 'error':
      default:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={styles.successView}
          >
            <XCircle className={styles.errorIcon} />
            <h2 className={styles.successTitle}>Verification Failed</h2>
            <p className={styles.successText}>{message}</p>
            <div className={styles.buttonActions}>
              <button
                onClick={() => navigate('/auth?type=signup')}
                className={styles.submitButton}
              >
                Create New Account
              </button>
              <button
                type="button"
                onClick={() => navigate('/auth?type=login')}
                className={styles.backButton}
              >
                <ArrowLeft className={styles.smallIcon} />
                Back to Sign In
              </button>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Left Panel - Decorative */}
      <div className={styles.leftPanel}>
        <div className={styles.leftContent}>
          <Link to="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <Compass className={styles.largeIcon} />
            </div>
            <div>
              <h1 className={styles.logoText}>Trip & Event</h1>
              <p className={styles.logoSubtext}>World's First CineMatrip Brand</p>
            </div>
          </Link>

          <div className={styles.heroContent}>
            <h2 className={styles.heroTitle}>
              Email
              <span className={styles.heroHighlight}> Verification</span>
            </h2>
            <p className={styles.heroSubtitle}>
              Confirming your email address to secure your account
            </p>
          </div>
        </div>

        <div className={styles.decorCircle1}></div>
        <div className={styles.decorCircle2}></div>
        <div className={styles.decorCircle3}></div>
      </div>

      {/* Right Panel - Content */}
      <div className={styles.rightPanel}>
        <div className={styles.formContainer}>
          <Link to="/" className={styles.mobileLogo}>
            <div className={styles.logoIcon}>
              <Compass className={styles.mediumLargeIcon} />
            </div>
            <span className={styles.logoText}>Trip & Event</span>
          </Link>

          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default EmailVerificationPage;
