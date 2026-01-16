import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2, CheckCircle, AlertCircle, KeyRound, ArrowLeft, Compass, Plane, MapPin, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { forgotPassword, login, oauthLogin, signup } from '../store/slices/authSlice';
import styles from './AuthPage.module.css';

// OAuth configuration from environment
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID || '';

// Declare global types for OAuth SDKs
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
    FB?: {
      init: (config: any) => void;
      login: (callback: (response: any) => void, options?: any) => void;
      getLoginStatus: (callback: (response: any) => void) => void;
    };
    fbAsyncInit?: () => void;
  }
}

type AuthType = 'login' | 'signup' | 'forgot';

export function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialType = (searchParams.get('type') as AuthType) || 'login';

  // Get redirect path from query param (defaults to home page)
  const redirectPath = searchParams.get('redirect') || '/';

  const [authType, setAuthType] = useState<AuthType>(initialType);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'facebook' | null>(null);
  const dispatch = useAppDispatch();
  const { isLoading, isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Redirect to intended destination if user is already authenticated
  useEffect(() => {
    const hasTokens =
      Boolean(localStorage.getItem('accessToken')) ||
      Boolean(localStorage.getItem('refreshToken'));
    if (isAuthenticated && user && hasTokens) {
      navigate(redirectPath);
    }
  }, [isAuthenticated, user, navigate, redirectPath]);

  // Update auth type when URL changes
  useEffect(() => {
    const type = searchParams.get('type') as AuthType;
    if (type && ['login', 'signup', 'forgot'].includes(type)) {
      setAuthType(type);
    }
  }, [searchParams]);

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
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState({ level: 0, text: '' });

  // Terms acceptance
  const [acceptedTerms, setAcceptedTerms] = useState(false);

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

  // Load Google OAuth SDK
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE')) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Load Facebook OAuth SDK
  useEffect(() => {
    if (!FACEBOOK_APP_ID || FACEBOOK_APP_ID.includes('YOUR_FACEBOOK')) return;

    window.fbAsyncInit = function() {
      window.FB?.init({
        appId: FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
    };

    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Google OAuth handler
  const handleGoogleLogin = useCallback(async () => {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE')) {
      setLoginError('Google login is not configured. Please set VITE_GOOGLE_CLIENT_ID.');
      return;
    }

    setOauthLoading('google');
    setLoginError('');

    try {
      // Use Google's OAuth 2.0 popup flow
      const client = window.google?.accounts?.id;
      if (!client) {
        throw new Error('Google SDK not loaded');
      }

      // Initialize Google Sign-In
      client.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          if (response.credential) {
            // response.credential is the ID token
            const result = await dispatch(
              oauthLogin({ provider: 'GOOGLE', accessToken: response.credential, idToken: response.credential })
            ).unwrap();
            if (result.success) {
              setLoginSuccess(true);
              setTimeout(() => navigate(redirectPath), 1500);
            } else {
              setLoginError(result.error || 'Google login failed');
            }
          }
          setOauthLoading(null);
        },
      });

      // Trigger the One Tap prompt
      client.prompt();
    } catch (error: any) {
      setLoginError(error.message || 'Google login failed');
      setOauthLoading(null);
    }
  }, [dispatch, navigate, redirectPath]);

  // Facebook OAuth handler
  const handleFacebookLogin = useCallback(async () => {
    if (!FACEBOOK_APP_ID || FACEBOOK_APP_ID.includes('YOUR_FACEBOOK')) {
      setLoginError('Facebook login is not configured. Please set VITE_FACEBOOK_APP_ID.');
      return;
    }

    setOauthLoading('facebook');
    setLoginError('');

    try {
      if (!window.FB) {
        throw new Error('Facebook SDK not loaded');
      }

      window.FB.login(async (response) => {
        if (response.authResponse) {
          const { accessToken } = response.authResponse;
          const result = await dispatch(
            oauthLogin({ provider: 'FACEBOOK', accessToken })
          ).unwrap();
          if (result.success) {
            setLoginSuccess(true);
            setTimeout(() => navigate(redirectPath), 1500);
          } else {
            setLoginError(result.error || 'Facebook login failed');
          }
        } else {
          setLoginError('Facebook login was cancelled');
        }
        setOauthLoading(null);
      }, { scope: 'email,public_profile' });
    } catch (error: any) {
      setLoginError(error.message || 'Facebook login failed');
      setOauthLoading(null);
    }
  }, [dispatch, navigate, redirectPath]);

  // Reset errors and form states when switching auth type
  useEffect(() => {
    setLoginError('');
    setSignupError('');
    setForgotError('');
    setLoginSuccess(false);
    setSignupSuccess(false);
    setForgotSuccess(false);
    setAcceptedTerms(false);
  }, [authType]);

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
        navigate(redirectPath);
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

    // Password validation to match backend requirements
    if (signupForm.password.length < 8) {
      setSignupError('Password must be at least 8 characters');
      return;
    }
    if (!/[a-z]/.test(signupForm.password)) {
      setSignupError('Password must contain at least one lowercase letter');
      return;
    }
    if (!/[A-Z]/.test(signupForm.password)) {
      setSignupError('Password must contain at least one uppercase letter');
      return;
    }
    if (!/[0-9]/.test(signupForm.password)) {
      setSignupError('Password must contain at least one number');
      return;
    }
    if (!/[^a-zA-Z0-9]/.test(signupForm.password)) {
      setSignupError('Password must contain at least one special character (!@#$%^&*)');
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      setSignupError('Passwords do not match');
      return;
    }

    if (!acceptedTerms) {
      setSignupError('You must accept the Privacy Policy & Terms of Service');
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
        navigate(redirectPath);
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
    const result = await dispatch(forgotPassword({ email: forgotEmail })).unwrap();
    setForgotLoading(false);

    if (result.success) {
      setForgotSuccess(true);
    } else {
      // For security, always show success message even if email doesn't exist
      // The backend should return the same message regardless
      setForgotSuccess(true);
    }
  };

  const switchAuthType = (type: AuthType) => {
    setAuthType(type);
    // Preserve redirect param when switching auth types
    const redirectParam = redirectPath !== '/' ? `&redirect=${encodeURIComponent(redirectPath)}` : '';
    navigate(`/auth?type=${type}${redirectParam}`, { replace: true });
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

  return (
    <div className={styles.pageContainer}>
      {/* Left Side - Decorative */}
      <div className={styles.leftPanel}>
        <div className={styles.leftContent}>
          <Link to="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <Compass className="w-8 h-8" />
            </div>
            <div>
              <h1 className={styles.logoText}>Trip & Event</h1>
              <p className={styles.logoSubtext}>World's First CineMatrip Brand</p>
            </div>
          </Link>

          <div className={styles.heroContent}>
            <h2 className={styles.heroTitle}>
              Discover Your Next
              <span className={styles.heroHighlight}> Adventure</span>
            </h2>
            <p className={styles.heroSubtitle}>
              Join thousands of travelers exploring the world's most amazing destinations
            </p>
          </div>

          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <Plane className="w-5 h-5" />
              </div>
              <div>
                <h3>500+ Destinations</h3>
                <p>Explore worldwide locations</p>
              </div>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3>Curated Experiences</h3>
                <p>Handpicked by travel experts</p>
              </div>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <Star className="w-5 h-5" />
              </div>
              <div>
                <h3>Best Price Guarantee</h3>
                <p>Unbeatable deals every day</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className={styles.decorCircle1}></div>
        <div className={styles.decorCircle2}></div>
        <div className={styles.decorCircle3}></div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className={styles.rightPanel}>
        <div className={styles.formContainer}>
          {/* Mobile Logo */}
          <Link to="/" className={styles.mobileLogo}>
            <div className={styles.logoIcon}>
              <Compass className="w-6 h-6" />
            </div>
            <span className={styles.logoText}>Trip & Event</span>
          </Link>

          <AnimatePresence mode="wait">
            {/* Login Form */}
            {authType === 'login' && !loginSuccess && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={styles.formWrapper}
              >
                <div className={styles.formHeader}>
                  <h2 className={styles.formTitle}>Welcome Back!</h2>
                  <p className={styles.formSubtitle}>Sign in to continue your travel journey</p>
                </div>

                <form onSubmit={handleLogin} className={styles.form}>
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

                  <button
                    type="button"
                    onClick={() => switchAuthType('forgot')}
                    className={styles.forgotLink}
                  >
                    Forgot Password?
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={styles.submitButton}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className={`w-5 h-5 ${styles.buttonSpinner}`} />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>

                  <div className={styles.divider}>
                    <div className={styles.dividerLine}></div>
                    <span className={styles.dividerText}>or continue with</span>
                  </div>

                  <div className={styles.socialButtons}>
                    <button
                      type="button"
                      className={styles.socialButton}
                      onClick={handleGoogleLogin}
                      disabled={oauthLoading !== null}
                    >
                      {oauthLoading === 'google' ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <svg className={styles.socialIcon} viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                      )}
                      <span>Google</span>
                    </button>
                    <button
                      type="button"
                      className={styles.socialButton}
                      onClick={handleFacebookLogin}
                      disabled={oauthLoading !== null}
                    >
                      {oauthLoading === 'facebook' ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <svg className={styles.socialIcon} fill="#1877F2" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      )}
                      <span>Facebook</span>
                    </button>
                  </div>

                  <p className={styles.switchText}>
                    Don't have an account?{' '}
                    <button type="button" onClick={() => switchAuthType('signup')} className={styles.switchLink}>
                      Sign Up
                    </button>
                  </p>
                </form>
              </motion.div>
            )}

            {/* Login Success */}
            {authType === 'login' && loginSuccess && (
              <motion.div
                key="login-success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={styles.successView}
              >
                <CheckCircle className={styles.successIcon} />
                <h2 className={styles.successTitle}>Welcome Back!</h2>
                <p className={styles.successText}>Login successful. Redirecting you now...</p>
              </motion.div>
            )}

            {/* Signup Form */}
            {authType === 'signup' && !signupSuccess && (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={styles.formWrapper}
              >
                <div className={styles.formHeader}>
                  <h2 className={styles.formTitle}>Create Account</h2>
                  <p className={styles.formSubtitle}>Join us for amazing travel experiences</p>
                </div>

                <form onSubmit={handleSignup} className={styles.form}>
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

                  <div className={styles.termsWrapper}>
                    <input
                      type="checkbox"
                      id="terms"
                      className={styles.checkbox}
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
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

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={styles.submitButton}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className={`w-5 h-5 ${styles.buttonSpinner}`} />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>

                  <p className={styles.switchText}>
                    Already have an account?{' '}
                    <button type="button" onClick={() => switchAuthType('login')} className={styles.switchLink}>
                      Sign In
                    </button>
                  </p>
                </form>
              </motion.div>
            )}

            {/* Signup Success */}
            {authType === 'signup' && signupSuccess && (
              <motion.div
                key="signup-success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={styles.successView}
              >
                <CheckCircle className={styles.successIcon} />
                <h2 className={styles.successTitle}>Account Created!</h2>
                <p className={styles.successText}>Welcome aboard! Redirecting you now...</p>
              </motion.div>
            )}

            {/* Forgot Password Form */}
            {authType === 'forgot' && !forgotSuccess && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={styles.formWrapper}
              >
                <div className={styles.forgotHeader}>
                  <div className={styles.forgotIconWrapper}>
                    <KeyRound className={styles.forgotIcon} />
                  </div>
                  <h2 className={styles.formTitle}>Forgot Password?</h2>
                  <p className={styles.formSubtitle}>
                    No worries! Enter your email and we'll send you a reset link.
                  </p>
                </div>

                <form onSubmit={handleForgotPassword} className={styles.form}>
                  {forgotError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`${styles.alert} ${styles.alertError}`}
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
                    className={styles.submitButton}
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
                    onClick={() => switchAuthType('login')}
                    className={styles.backButton}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sign In
                  </button>
                </form>
              </motion.div>
            )}

            {/* Forgot Password Success */}
            {authType === 'forgot' && forgotSuccess && (
              <motion.div
                key="forgot-success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={styles.successView}
              >
                <CheckCircle className={styles.successIcon} />
                <h2 className={styles.successTitle}>Check Your Email</h2>
                <p className={styles.successText}>
                  We've sent a password reset link to <strong>{forgotEmail}</strong>.
                  Please check your inbox.
                </p>
                <button
                  type="button"
                  onClick={() => switchAuthType('login')}
                  className={styles.submitButton}
                  style={{ marginTop: '1.5rem' }}
                >
                  Back to Sign In
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
