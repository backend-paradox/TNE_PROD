import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Loader2, Check, AlertCircle } from 'lucide-react';
import { useAppDispatch } from '../../store/hooks';
import { changePassword } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';
import styles from './ProfileComponents.module.css';

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function ChangePassword() {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState<Partial<PasswordForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getPasswordStrength = (password: string): { level: number; text: string } => {
    if (!password) return { level: 0, text: '' };
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { level: 1, text: 'Weak' };
    if (strength === 3) return { level: 2, text: 'Fair' };
    if (strength === 4) return { level: 3, text: 'Good' };
    return { level: 4, text: 'Strong' };
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PasswordForm> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const result = await dispatch(
      changePassword({ currentPassword: formData.currentPassword, newPassword: formData.newPassword })
    ).unwrap();
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Password changed successfully!');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      toast.error(result.error || 'Failed to change password');
    }
  };

  const handleChange = (field: keyof PasswordForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const strength = getPasswordStrength(formData.newPassword);
  const strengthClasses = ['', styles.strengthFillWeak, styles.strengthFillFair, styles.strengthFillGood, styles.strengthFillStrong];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem' }}>
          Change Password
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
          Ensure your account is using a strong password for security.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Current Password */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Current Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPasswords.current ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={(e) => handleChange('currentPassword', e.target.value)}
              className={`${styles.formInput} ${errors.currentPassword ? styles.inputError : ''}`}
              placeholder="Enter current password"
              style={{ paddingRight: '3rem' }}
            />
            <button
              type="button"
              onClick={() => setShowPasswords((p) => ({ ...p, current: !p.current }))}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
              }}
            >
              {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.currentPassword && <span className={styles.errorText}>{errors.currentPassword}</span>}
        </div>

        {/* New Password */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>New Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPasswords.new ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={(e) => handleChange('newPassword', e.target.value)}
              className={`${styles.formInput} ${errors.newPassword ? styles.inputError : ''}`}
              placeholder="Enter new password"
              style={{ paddingRight: '3rem' }}
            />
            <button
              type="button"
              onClick={() => setShowPasswords((p) => ({ ...p, new: !p.new }))}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
              }}
            >
              {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {formData.newPassword && (
            <div className={styles.passwordStrength}>
              <div className={styles.strengthBar}>
                <div
                  className={`${styles.strengthFill} ${strengthClasses[strength.level]}`}
                  style={{ width: `${(strength.level / 4) * 100}%` }}
                />
              </div>
              <span className={styles.strengthText}>Password strength: {strength.text}</span>
            </div>
          )}
          {errors.newPassword && <span className={styles.errorText}>{errors.newPassword}</span>}
        </div>

        {/* Confirm Password */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Confirm New Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPasswords.confirm ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className={`${styles.formInput} ${errors.confirmPassword ? styles.inputError : ''}`}
              placeholder="Confirm new password"
              style={{ paddingRight: '3rem' }}
            />
            <button
              type="button"
              onClick={() => setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
              }}
            >
              {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
        </div>

        <div className={styles.modalActions}>
          <button type="submit" disabled={isSubmitting} className={styles.btnSave}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Update Password
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChangePassword;
