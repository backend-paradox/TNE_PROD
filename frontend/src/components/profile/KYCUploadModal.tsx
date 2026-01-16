import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  FileCheck,
  Loader2,
  Check,
  Trash2,
  CreditCard,
  FileText,
  Car,
  Vote,
} from 'lucide-react';
import { useAppDispatch } from '../../store/hooks';
import { submitKYCDocument } from '../../store/slices/profileSlice';
import { KYCDocumentType, KYCSubmitData } from '../../types';
import toast from 'react-hot-toast';
import styles from './ProfileComponents.module.css';

interface KYCUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  documentType: KYCDocumentType | '';
  documentNumber: string;
  documentName: string;
  frontImageUrl: string;
  backImageUrl: string;
  expiryDate: string;
}

const documentTypes = [
  { value: 'AADHAAR', label: 'Aadhaar Card', icon: CreditCard, requiresBack: true, requiresExpiry: false },
  { value: 'PAN', label: 'PAN Card', icon: FileText, requiresBack: false, requiresExpiry: false },
  { value: 'PASSPORT', label: 'Passport', icon: FileCheck, requiresBack: true, requiresExpiry: true },
  { value: 'DRIVING_LICENSE', label: 'Driving License', icon: Car, requiresBack: true, requiresExpiry: true },
  { value: 'VOTER_ID', label: 'Voter ID', icon: Vote, requiresBack: true, requiresExpiry: false },
] as const;

const initialFormData: FormData = {
  documentType: '',
  documentNumber: '',
  documentName: '',
  frontImageUrl: '',
  backImageUrl: '',
  expiryDate: '',
};

export function KYCUploadModal({ isOpen, onClose }: KYCUploadModalProps) {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);

  const selectedDocType = documentTypes.find((d) => d.value === formData.documentType);

  const handleClose = () => {
    setFormData(initialFormData);
    setErrors({});
    setFrontPreview(null);
    setBackPreview(null);
    onClose();
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.documentType) {
      newErrors.documentType = 'Please select a document type';
    }
    if (!formData.documentNumber.trim()) {
      newErrors.documentNumber = 'Document number is required';
    }
    if (!formData.frontImageUrl && !frontPreview) {
      newErrors.frontImageUrl = 'Front image is required';
    }
    if (selectedDocType?.requiresExpiry && !formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required for this document';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = async (file: File, side: 'front' | 'back') => {
    // For now, we'll create a local preview
    // In production, you would upload to a cloud storage service
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (side === 'front') {
        setFrontPreview(base64);
        setFormData((prev) => ({ ...prev, frontImageUrl: base64 }));
      } else {
        setBackPreview(base64);
        setFormData((prev) => ({ ...prev, backImageUrl: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPG, PNG, and WebP files are allowed');
      return;
    }

    handleImageUpload(file, side);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const submitData: KYCSubmitData = {
      documentType: formData.documentType as KYCDocumentType,
      documentNumber: formData.documentNumber,
      documentName: formData.documentName || undefined,
      frontImageUrl: formData.frontImageUrl,
      backImageUrl: formData.backImageUrl || undefined,
      expiryDate: formData.expiryDate || undefined,
    };

    try {
      await dispatch(submitKYCDocument(submitData)).unwrap();
      toast.success('Document submitted for verification!');
      handleClose();
    } catch (error) {
      const message = typeof error === 'string' ? error : 'Failed to submit document';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.modalBackdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className={styles.modalContent}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Upload KYC Document</h2>
              <button onClick={handleClose} className={styles.closeButton}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalBody}>
              {/* Document Type */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Document Type *</label>
                <select
                  value={formData.documentType}
                  onChange={(e) => handleChange('documentType', e.target.value)}
                  className={`${styles.formSelect} ${errors.documentType ? styles.inputError : ''}`}
                >
                  <option value="">Select document type</option>
                  {documentTypes.map((doc) => (
                    <option key={doc.value} value={doc.value}>
                      {doc.label}
                    </option>
                  ))}
                </select>
                {errors.documentType && <span className={styles.errorText}>{errors.documentType}</span>}
              </div>

              {/* Document Number */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Document Number *</label>
                <input
                  type="text"
                  value={formData.documentNumber}
                  onChange={(e) => handleChange('documentNumber', e.target.value)}
                  className={`${styles.formInput} ${errors.documentNumber ? styles.inputError : ''}`}
                  placeholder="Enter document number"
                />
                {errors.documentNumber && <span className={styles.errorText}>{errors.documentNumber}</span>}
              </div>

              {/* Document Name (Optional) */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Name on Document <span className={styles.optional}>(optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.documentName}
                  onChange={(e) => handleChange('documentName', e.target.value)}
                  className={styles.formInput}
                  placeholder="Name as printed on document"
                />
              </div>

              {/* Expiry Date (if required) */}
              {selectedDocType?.requiresExpiry && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Expiry Date *</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => handleChange('expiryDate', e.target.value)}
                    className={`${styles.formInput} ${errors.expiryDate ? styles.inputError : ''}`}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.expiryDate && <span className={styles.errorText}>{errors.expiryDate}</span>}
                </div>
              )}

              {/* Front Image Upload */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Front Side Image *</label>
                {frontPreview ? (
                  <div className={styles.uploadPreview}>
                    <img src={frontPreview} alt="Front preview" />
                    <button
                      type="button"
                      onClick={() => {
                        setFrontPreview(null);
                        setFormData((prev) => ({ ...prev, frontImageUrl: '' }));
                      }}
                      className={styles.uploadRemove}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className={`${styles.uploadArea} ${errors.frontImageUrl ? styles.inputError : ''}`}>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handleFileChange(e, 'front')}
                      style={{ display: 'none' }}
                    />
                    <div className={styles.uploadIcon}>
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className={styles.uploadText}>
                      <span className={styles.uploadTextHighlight}>Click to upload</span> or drag and drop
                    </p>
                    <p className={styles.uploadText}>JPG, PNG or WebP (max. 5MB)</p>
                  </label>
                )}
                {errors.frontImageUrl && <span className={styles.errorText}>{errors.frontImageUrl}</span>}
              </div>

              {/* Back Image Upload (if required) */}
              {selectedDocType?.requiresBack && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Back Side Image <span className={styles.optional}>(optional)</span>
                  </label>
                  {backPreview ? (
                    <div className={styles.uploadPreview}>
                      <img src={backPreview} alt="Back preview" />
                      <button
                        type="button"
                        onClick={() => {
                          setBackPreview(null);
                          setFormData((prev) => ({ ...prev, backImageUrl: '' }));
                        }}
                        className={styles.uploadRemove}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className={styles.uploadArea}>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => handleFileChange(e, 'back')}
                        style={{ display: 'none' }}
                      />
                      <div className={styles.uploadIcon}>
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className={styles.uploadText}>
                        <span className={styles.uploadTextHighlight}>Click to upload</span> back side
                      </p>
                    </label>
                  )}
                </div>
              )}

              <div className={styles.modalActions}>
                <button type="button" onClick={handleClose} className={styles.btnCancel}>
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className={styles.btnSave}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Submit Document
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

export default KYCUploadModal;
