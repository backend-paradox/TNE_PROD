import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Home,
  Briefcase,
  MapPin,
  Loader2,
  Check,
} from 'lucide-react';
import { Address } from '../../types';
import styles from './ProfileComponents.module.css';

interface AddressFormData {
  type: 'HOME' | 'WORK' | 'OTHER';
  label?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  isDefault: boolean;
}

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: AddressFormData) => Promise<{ success: boolean; error?: string }>;
  editAddress?: Address | null;
}

const initialFormData: AddressFormData = {
  type: 'HOME',
  label: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  country: 'India',
  pincode: '',
  isDefault: false,
};

export function AddressModal({ isOpen, onClose, onSave, editAddress }: AddressModalProps) {
  const [formData, setFormData] = useState<AddressFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof AddressFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editAddress) {
      setFormData({
        type: editAddress.type,
        label: editAddress.label || '',
        addressLine1: editAddress.addressLine1,
        addressLine2: editAddress.addressLine2 || '',
        city: editAddress.city,
        state: editAddress.state,
        country: editAddress.country,
        pincode: editAddress.pincode,
        isDefault: editAddress.isDefault,
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [editAddress, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AddressFormData, string>> = {};

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address line 1 is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const result = await onSave(formData);
    setIsSubmitting(false);

    if (result.success) {
      onClose();
    }
  };

  const handleChange = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const addressTypes = [
    { value: 'HOME', label: 'Home', icon: Home },
    { value: 'WORK', label: 'Work', icon: Briefcase },
    { value: 'OTHER', label: 'Other', icon: MapPin },
  ] as const;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.modalBackdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.modalContent}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editAddress ? 'Edit Address' : 'Add New Address'}
              </h2>
              <button onClick={onClose} className={styles.closeButton}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className={styles.modalBody}>
              {/* Address Type */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Address Type</label>
                <div className={styles.typeSelector}>
                  {addressTypes.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleChange('type', value)}
                      className={`${styles.typeButton} ${formData.type === value ? styles.typeButtonActive : ''}`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Label (Optional) */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Label <span className={styles.optional}>(optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => handleChange('label', e.target.value)}
                  className={styles.formInput}
                  placeholder="e.g., My Apartment, Office"
                  maxLength={50}
                />
              </div>

              {/* Address Line 1 */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Address Line 1 *</label>
                <input
                  type="text"
                  value={formData.addressLine1}
                  onChange={(e) => handleChange('addressLine1', e.target.value)}
                  className={`${styles.formInput} ${errors.addressLine1 ? styles.inputError : ''}`}
                  placeholder="House/Flat No., Building Name, Street"
                />
                {errors.addressLine1 && (
                  <span className={styles.errorText}>{errors.addressLine1}</span>
                )}
              </div>

              {/* Address Line 2 */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Address Line 2 <span className={styles.optional}>(optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.addressLine2}
                  onChange={(e) => handleChange('addressLine2', e.target.value)}
                  className={styles.formInput}
                  placeholder="Locality, Landmark"
                />
              </div>

              {/* City and State */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className={`${styles.formInput} ${errors.city ? styles.inputError : ''}`}
                    placeholder="City"
                  />
                  {errors.city && <span className={styles.errorText}>{errors.city}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>State *</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className={`${styles.formInput} ${errors.state ? styles.inputError : ''}`}
                    placeholder="State"
                  />
                  {errors.state && <span className={styles.errorText}>{errors.state}</span>}
                </div>
              </div>

              {/* Country and Pincode */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Country *</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    className={`${styles.formInput} ${errors.country ? styles.inputError : ''}`}
                    placeholder="Country"
                  />
                  {errors.country && <span className={styles.errorText}>{errors.country}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Pincode *</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => handleChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className={`${styles.formInput} ${errors.pincode ? styles.inputError : ''}`}
                    placeholder="6-digit pincode"
                    maxLength={6}
                  />
                  {errors.pincode && <span className={styles.errorText}>{errors.pincode}</span>}
                </div>
              </div>

              {/* Default Address */}
              <div className={styles.checkboxGroup}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => handleChange('isDefault', e.target.checked)}
                  />
                  <span className={styles.checkmark}></span>
                  Set as default address
                </label>
              </div>

              {/* Actions */}
              <div className={styles.modalActions}>
                <button type="button" onClick={onClose} className={styles.btnCancel}>
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className={styles.btnSave}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {editAddress ? 'Update Address' : 'Add Address'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default AddressModal;
