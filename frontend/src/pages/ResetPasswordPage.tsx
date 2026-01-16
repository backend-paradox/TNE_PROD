import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Lock, Eye, EyeOff, ArrowLeft, KeyRound, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { resetPassword } from '../store/slices/authSlice';
import styles from './AuthPage.module.css';

type ResetStatus = 'form' | 'loading' | 'success' | 'error' | 'expired';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.auth.isLoading);

  const [status, setStatus] = useState<ResetStatus>('form');
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ level: 0, text: '' });

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid reset link. No token provided.');
    }
  }, [token]);

  const calculatePasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;

    const levels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    return { level: strength, text: levels[strength] || '' };
  };

  useEffect(() => {
    if (password) {
      setPasswordStrength(calculatePasswordStrength(password));
    } else {
      setPasswordStrength({ level: 0, text: '' });
    }
  }, [password]);

  const getStrengthClass = (index: number) => {
    if (passwordStrength.level === 0) return '';
    if (index < passwordStrength.level) {
      if (passwordStrength.level <= 1) return styles.weak;
      if (passwordStrength.level <= 2) return styles.fair;
      if (passwordStrength.level <= 3) return styles.good;
      return styles.strong;
    }
    return '';
  };

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Password must contain at least one number';
    }
    if (!/[^a-zA-Z0-9]/.test(pwd)) {
      return 'Password must contain at least one special character';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setStatus('loading');
    const result = await dispatch(resetPassword({ token, password })).unwrap();

    if (result.success) {
      setStatus('success');
      setMessage('Your password has been reset successfully!');
    } else {
      const errorMessage = result.error || 'Failed to reset password';
      if (errorMessage.toLowerCase().includes('expired')) {
        setStatus('expired');
        setMessage('Your reset link has expired. Please request a new one.');
      } else {
        setStatus('form');
        setError(errorMessage);
      }
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
            <h2 className={styles.successTitle}>Resetting Password</h2>
            <p className={styles.successText}>
              Please wait while we update your password...
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
            <h2 className={styles.successTitle}>Password Reset!</h2>
            <p className={styles.successText}>{message}</p>
            <button
              onClick={() => navigate('/auth?type=login')}
              className={styles.submitButton}
              style={{ marginTop: '1.5rem' }}
            >
              Sign In with New Password
            </button>
          </motion.div>
        );

      case 'expired':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={styles.successView}
          >
            <XCircle className={styles.expiredIcon} />
            <h2 className={styles.successTitle}>Link Expired</h2>
            <p className={styles.successText}>{message}</p>
            <button
              onClick={() => navigate('/auth?type=forgot')}
              className={styles.submitButton}
              style={{ marginTop: '1.5rem' }}
            >
              Request New Reset Link
            </button>
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
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={styles.successView}
          >
            <XCircle className={styles.errorIcon} />
            <h2 className={styles.successTitle}>Invalid Link</h2>
            <p className={styles.successText}>{message}</p>
            <button
              onClick={() => navigate('/auth?type=forgot')}
              className={styles.submitButton}
              style={{ marginTop: '1.5rem' }}
            >
              Request New Reset Link
            </button>
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

      case 'form':
      default:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={styles.formWrapper}
          >
            <div className={styles.forgotHeader}>
              <div className={styles.forgotIconWrapper}>
                <KeyRound className={styles.forgotIcon} />
              </div>
              <h2 className={styles.formTitle}>Reset Password</h2>
              <p className={styles.formSubtitle}>
                Enter your new password below
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${styles.alert} ${styles.alertError}`}
                >
                  <XCircle className={styles.alertIcon} />
                  <span>{error}</span>
                </motion.div>
              )}

              <div className={styles.fieldGroup}>
                <label className={styles.label}>New Password</label>
                <div className={styles.inputWrapper}>
                  <Lock className={styles.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className={`${styles.input} ${styles.inputWithButton}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.togglePassword}
                  >
                    {showPassword ? <EyeOff className={styles.mediumIcon} /> : <Eye className={styles.mediumIcon} />}
                  </button>
                </div>
                {password && (
                  <div className={styles.passwordStrength}>
                    <div className={styles.strengthBars}>
                      {[0, 1, 2, 3, 4].map((index) => (
                        <div
                          key={index}
                          className={`${styles.strengthBar} ${getStrengthClass(index)}`}
                        />
                      ))}
                    </div>
                    <span className={`${styles.strengthText} ${getStrengthClass(0)}`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Confirm Password</label>
                <div className={styles.inputWrapper}>
                  <Lock className={styles.inputIcon} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className={`${styles.input} ${styles.inputWithButton}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={styles.togglePassword}
                  >
                    {showConfirmPassword ? <EyeOff className={styles.mediumIcon} /> : <Eye className={styles.mediumIcon} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={styles.submitButton}
              >
                {isLoading ? (
                  <>
                    <Loader2 className={`${styles.mediumIcon} ${styles.buttonSpinner}`} />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/auth?type=login')}
                className={styles.backButton}
              >
                <ArrowLeft className={styles.smallIcon} />
                Back to Sign In
              </button>
            </form>
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
              Reset Your
              <span className={styles.heroHighlight}> Password</span>
            </h2>
            <p className={styles.heroSubtitle}>
              Create a strong password to keep your account secure
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

export default ResetPasswordPage;
