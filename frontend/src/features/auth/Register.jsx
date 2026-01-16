import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { register as registerUser, clearError } from './authSlice';
import './Register.css';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    role: z.enum(['USER', 'VENDOR'], { required_error: 'Please select a role' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'USER',
    },
  });

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  const onSubmit = async (data) => {
    // eslint-disable-next-line no-unused-vars
    const { confirmPassword, ...userData } = data;
    const result = await dispatch(registerUser(userData));
    if (registerUser.fulfilled.match(result)) {
      setSuccessMessage('Registration successful! Please check your email to verify your account.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Create Account</h1>
          <p>Join TripAndEvent today</p>
        </div>

        {successMessage && (
          <div className="alert alert-success">
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="register-form">
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Enter your full name"
              {...register('name')}
            />
            {errors.name && <span className="form-error">{errors.name.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="Enter your email"
              {...register('email')}
            />
            {errors.email && <span className="form-error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              className={`form-input ${errors.phone ? 'error' : ''}`}
              placeholder="10-digit phone number"
              {...register('phone')}
            />
            {errors.phone && <span className="form-error">{errors.phone.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Create a password"
              {...register('password')}
            />
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Confirm your password"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <span className="form-error">{errors.confirmPassword.message}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Account Type</label>
            <div className="role-selection">
              <label className="role-option">
                <input type="radio" value="USER" {...register('role')} />
                <div className="role-card">
                  <div className="role-title">Customer</div>
                  <div className="role-description">Book hotels, flights, and events</div>
                </div>
              </label>
              <label className="role-option">
                <input type="radio" value="VENDOR" {...register('role')} />
                <div className="role-card">
                  <div className="role-title">Vendor</div>
                  <div className="role-description">List and manage your properties</div>
                </div>
              </label>
            </div>
            {errors.role && <span className="form-error">{errors.role.message}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Creating account...</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
