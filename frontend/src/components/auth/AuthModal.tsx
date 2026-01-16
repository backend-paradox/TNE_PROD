import { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, Loader2, CheckCircle, AlertCircle, KeyRound, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { login, signup } from '../../store/slices/authSlice';
import styles from './AuthModal.module.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'signup';
}

type ViewType = 'login' | 'signup' | 'forgot' | 'forgot-success';

export function AuthModal({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) {
  const [currentView, setCurrentView] = useState<ViewType>(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.auth.isLoading);

  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [forgotEmail, setForgotEmail] = useState('');

  // Error and success states
  const [loginError, setLoginError] = useState('');
  const [signupError, setSignupError] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState({ level: 0, text: '' });

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const levels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    return { level: strength, text: levels[strength] || '' };
  };

  useEffect(() => {
    if (signupForm.password) {
      setPasswordStrength(calculatePasswordStrength(signupForm.password));
    } else {
      setPasswordStrength({ level: 0, text: '' });
    }
  }, [signupForm.password]);

  // Reset form when view changes
  useEffect(() => {
    setLoginError('');
    setSignupError('');
    setForgotError('');
    setLoginSuccess(false);
    setSignupSuccess(false);
  }, [currentView]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setLoginForm({ email: '', password: '' });
      setSignupForm({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
      setForgotEmail('');
      setLoginError('');
      setSignupError('');
      setForgotError('');
      setLoginSuccess(false);
      setSignupSuccess(false);
      setCurrentView(defaultTab);
    }
  }, [isOpen, defaultTab]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginForm.email || !loginForm.password) {
      setLoginError('Please fill in all fields');
      return;
    }

    if (!validateEmail(loginForm.email)) {
      setLoginError('Please enter a valid email address');
      return;
    }

    if (loginForm.password.length < 6) {
      setLoginError('Password must be at least 6 characters');
      return;
    }

    const result = await dispatch(
      login({ email: loginForm.email, password: loginForm.password })
    ).unwrap();
    if (result.success) {
      setLoginSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setLoginError(result.error || 'Invalid credentials. Please try again.');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    if (!signupForm.name || !signupForm.email || !signupForm.phone || !signupForm.password || !signupForm.confirmPassword) {
      setSignupError('Please fill in all fields');
      return;
    }

    if (signupForm.name.length < 2) {
      setSignupError('Name must be at least 2 characters');
      return;
    }

    if (!validateEmail(signupForm.email)) {
      setSignupError('Please enter a valid email address');
      return;
    }

    if (!validatePhone(signupForm.phone)) {
      setSignupError('Please enter a valid 10-digit phone number');
      return;
    }

    if (signupForm.password.length < 6) {
      setSignupError('Password must be at least 6 characters');
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      setSignupError('Passwords do not match');
      return;
    }

    const result = await dispatch(
      signup({
        name: signupForm.name,
        email: signupForm.email,
        phone: signupForm.phone,
        password: signupForm.password,
      })
    ).unwrap();
    if (result.success) {
      setSignupSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setSignupError(result.error || 'Signup failed. Please try again.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (!forgotEmail) {
      setForgotError('Please enter your email address');
      return;
    }

    if (!validateEmail(forgotEmail)) {
      setForgotError('Please enter a valid email address');
      return;
    }

    setForgotLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setForgotLoading(false);
    setCurrentView('forgot-success');
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: 20 },
  };

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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.modalWrapper}>
          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className={styles.modal}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <AnimatePresence mode="wait">
              {/* Login/Signup View */}
              {(currentView === 'login' || currentView === 'signup') && (
                <motion.div
                  key="auth"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Header with gradient */}
                  <div className={styles.header}>
                    <button onClick={onClose} className={`btn btn-icon btn-ghost ${styles.closeButton}`}>
                      <X className="w-5 h-5" />
                    </button>

                    <div className={styles.headerContent}>
                      <h2 className={styles.title}>
                        {currentView === 'login' ? 'Welcome Back!' : 'Create Account'}
                      </h2>
                      <p className={styles.subtitle}>
                        {currentView === 'login'
                          ? 'Sign in to continue your travel journey'
                          : 'Join us for amazing travel experiences'}
                      </p>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className={styles.tabs}>
                    <button
                      onClick={() => setCurrentView('login')}
                      className={`${styles.tab} ${currentView === 'login' ? styles.active : ''}`}
                    >
                      Sign In
                      {currentView === 'login' && (
                        <motion.div layoutId="activeTab" className={styles.tabIndicator} />
                      )}
                    </button>
                    <button
                      onClick={() => setCurrentView('signup')}
                      className={`${styles.tab} ${currentView === 'signup' ? styles.active : ''}`}
                    >
                      Sign Up
                      {currentView === 'signup' && (
                        <motion.div layoutId="activeTab" className={styles.tabIndicator} />
                      )}
                    </button>
                  </div>

                  {/* Form Content */}
                  <div className={styles.formContainer}>
                    <AnimatePresence mode="wait">
                      {currentView === 'login' ? (
                        <motion.form
                          key="login"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2 }}
                          onSubmit={handleLogin}
                          className={styles.form}
                        >
                          {/* Success Message */}
                          {loginSuccess && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`${styles.alert} ${styles.alertSuccess}`}
                            >
                              <CheckCircle className={styles.alertIcon} />
                              <span>Login successful! Redirecting...</span>
                            </motion.div>
                          )}

                          {/* Error Message */}
                          {loginError && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`${styles.alert} ${styles.alertError}`}
                            >
                              <AlertCircle className={styles.alertIcon} />
                              <span>{loginError}</span>
                            </motion.div>
                          )}

                          {/* Email Field */}
                          <div className={styles.fieldGroup}>
                            <label className={styles.label}>Email Address</label>
                            <div className={styles.inputWrapper}>
                              <Mail className={styles.inputIcon} />
                              <input
                                type="email"
                                value={loginForm.email}
                                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                                placeholder="Enter your email"
                                className={styles.input}
                              />
                            </div>
                          </div>

                          {/* Password Field */}
                          <div className={styles.fieldGroup}>
                            <label className={styles.label}>Password</label>
                            <div className={styles.inputWrapper}>
                              <Lock className={styles.inputIcon} />
                              <input
                                type={showPassword ? 'text' : 'password'}
                                value={loginForm.password}
                                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                placeholder="Enter your password"
                                className={`${styles.input} ${styles.inputWithButton}`}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={styles.togglePassword}
                              >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>

                          {/* Forgot Password */}
                          <button
                            type="button"
                            onClick={() => setCurrentView('forgot')}
                            className={styles.forgotLink}
                          >
                            Forgot Password?
                          </button>

                          {/* Submit Button */}
                          <button
                            type="submit"
                            disabled={isLoading || loginSuccess}
                            className={`btn btn-primary btn-block ${styles.submitMargin}`}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className={`w-5 h-5 ${styles.buttonSpinner}`} />
                                Signing in...
                              </>
                            ) : loginSuccess ? (
                              <>
                                <CheckCircle className="w-5 h-5" />
                                Success!
                              </>
                            ) : (
                              'Sign In'
                            )}
                          </button>

                          {/* Social Login */}
                          <div className={styles.divider}>
                            <div className={styles.dividerLine}></div>
                            <span className={styles.dividerText}>or continue with</span>
                          </div>

                          <div className={styles.socialButtons}>
                            <button type="button" className={`btn btn-secondary ${styles.socialButton}`}>
                              <svg className={styles.socialIcon} viewBox="0 0 24 24">
                                <path
                                  fill="#4285F4"
                                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                  fill="#34A853"
                                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                  fill="#FBBC05"
                                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                  fill="#EA4335"
                                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                              </svg>
                              <span>Google</span>
                            </button>
                            <button type="button" className={`btn btn-secondary ${styles.socialButton}`}>
                              <svg className={styles.socialIcon} fill="#1877F2" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                              </svg>
                              <span>Facebook</span>
                            </button>
                          </div>
                        </motion.form>
                      ) : (
                        <motion.form
                          key="signup"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                          onSubmit={handleSignup}
                          className={styles.form}
                        >
                          {/* Success Message */}
                          {signupSuccess && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`${styles.alert} ${styles.alertSuccess}`}
                            >
                              <CheckCircle className={styles.alertIcon} />
                              <span>Account created successfully!</span>
                            </motion.div>
                          )}

                          {/* Error Message */}
                          {signupError && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`${styles.alert} ${styles.alertError}`}
                            >
                              <AlertCircle className={styles.alertIcon} />
                              <span>{signupError}</span>
                            </motion.div>
                          )}

                          {/* Name Field */}
                          <div className={styles.fieldGroup}>
                            <label className={styles.label}>Full Name</label>
                            <div className={styles.inputWrapper}>
                              <User className={styles.inputIcon} />
                              <input
                                type="text"
                                value={signupForm.name}
                                onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                                placeholder="Enter your full name"
                                className={styles.input}
                              />
                            </div>
                          </div>

                          {/* Email Field */}
                          <div className={styles.fieldGroup}>
                            <label className={styles.label}>Email Address</label>
                            <div className={styles.inputWrapper}>
                              <Mail className={styles.inputIcon} />
                              <input
                                type="email"
                                value={signupForm.email}
                                onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                                placeholder="Enter your email"
                                className={styles.input}
                              />
                            </div>
                          </div>

                          {/* Phone Field */}
                          <div className={styles.fieldGroup}>
                            <label className={styles.label}>Phone Number</label>
                            <div className={styles.inputWrapper}>
                              <Phone className={styles.inputIcon} />
                              <input
                                type="tel"
                                value={signupForm.phone}
                                onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                                placeholder="Enter your phone number"
                                className={styles.input}
                              />
                            </div>
                          </div>

                          {/* Password Field */}
                          <div className={styles.fieldGroup}>
                            <label className={styles.label}>Password</label>
                            <div className={styles.inputWrapper}>
                              <Lock className={styles.inputIcon} />
                              <input
                                type={showPassword ? 'text' : 'password'}
                                value={signupForm.password}
                                onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                                placeholder="Create a password"
                                className={`${styles.input} ${styles.inputWithButton}`}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={styles.togglePassword}
                              >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                            {/* Password Strength Indicator */}
                            {signupForm.password && (
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

                          {/* Confirm Password Field */}
                          <div className={styles.fieldGroup}>
                            <label className={styles.label}>Confirm Password</label>
                            <div className={styles.inputWrapper}>
                              <Lock className={styles.inputIcon} />
                              <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={signupForm.confirmPassword}
                                onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                                placeholder="Confirm your password"
                                className={`${styles.input} ${styles.inputWithButton}`}
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className={styles.togglePassword}
                              >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>

                          {/* Terms Checkbox */}
                          <div className={styles.termsWrapper}>
                            <input
                              type="checkbox"
                              id="terms"
                              className={styles.checkbox}
                            />
                            <label htmlFor="terms" className={styles.termsText}>
                              I agree to the{' '}
                              <a
                                href="/terms-and-policy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.termsLink}
                              >
                                Privacy Policy & Terms of Service
                              </a>
                            </label>
                          </div>

                          {/* Submit Button */}
                          <button
                            type="submit"
                            disabled={isLoading || signupSuccess}
                            className={`btn btn-primary btn-block ${styles.submitMargin}`}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className={`w-5 h-5 ${styles.buttonSpinner}`} />
                                Creating account...
                              </>
                            ) : signupSuccess ? (
                              <>
                                <CheckCircle className="w-5 h-5" />
                                Account Created!
                              </>
                            ) : (
                              'Create Account'
                            )}
                          </button>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {/* Forgot Password View */}
              {currentView === 'forgot' && (
                <motion.div
                  key="forgot"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={styles.forgotView}
                >
                  <button onClick={onClose} className={`btn btn-icon btn-ghost ${styles.closeButton}`} style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}>
                    <X className="w-5 h-5" />
                  </button>

                  <div className={styles.forgotHeader}>
                    <div className={styles.forgotIconWrapper}>
                      <KeyRound className={styles.forgotIcon} />
                    </div>
                    <h2 className={styles.forgotTitle}>Forgot Password?</h2>
                    <p className={styles.forgotSubtitle}>
                      No worries! Enter your email address and we'll send you a link to reset your password.
                    </p>
                  </div>

                  <form onSubmit={handleForgotPassword} className={styles.forgotForm}>
                    {/* Error Message */}
                    {forgotError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`${styles.alert} ${styles.alertError}`}
                        style={{ marginBottom: '1rem' }}
                      >
                        <AlertCircle className={styles.alertIcon} />
                        <span>{forgotError}</span>
                      </motion.div>
                    )}

                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>Email Address</label>
                      <div className={styles.inputWrapper}>
                        <Mail className={styles.inputIcon} />
                        <input
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="Enter your email"
                          className={styles.input}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="btn btn-primary btn-block"
                      style={{ marginTop: '1rem' }}
                    >
                      {forgotLoading ? (
                        <>
                          <Loader2 className={`w-5 h-5 ${styles.buttonSpinner}`} />
                          Sending...
                        </>
                      ) : (
                        'Send Reset Link'
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentView('login')}
                      className={`btn btn-ghost ${styles.backButton}`}
                    >
                      <ArrowLeft className={styles.backIcon} />
                      Back to Sign In
                    </button>
                  </form>
                </motion.div>
              )}

              {/* Forgot Password Success View */}
              {currentView === 'forgot-success' && (
                <motion.div
                  key="forgot-success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className={styles.successView}
                >
                  <button onClick={onClose} className={`btn btn-icon btn-ghost ${styles.closeButton}`} style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                    <X className="w-5 h-5" />
                  </button>

                  <CheckCircle className={styles.successIcon} />
                  <h2 className={styles.successTitle}>Check Your Email</h2>
                  <p className={styles.successText}>
                    We've sent a password reset link to <strong>{forgotEmail}</strong>.
                    Please check your inbox and follow the instructions.
                  </p>

                  <button
                    type="button"
                    onClick={() => setCurrentView('login')}
                    className="btn btn-primary btn-block"
                  >
                    Back to Sign In
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
