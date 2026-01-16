import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Camera, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch } from '../../store/hooks';
import { fetchProfile } from '../../store/slices/profileSlice';
import axiosInstance from '../../app/axios';
import toast from 'react-hot-toast';
import styles from './ProfileComponents.module.css';

interface ProfilePictureUploadProps {
  currentImageUrl?: string;
  userName: string;
}

export function ProfilePictureUpload({ currentImageUrl, userName }: ProfilePictureUploadProps) {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Please select a JPG, PNG, or WebP image');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
      setShowPreviewModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) return;

    setIsUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('avatar', fileInputRef.current.files[0]);

      // Upload to backend - supports both local and S3 storage based on env
      // IMPORTANT: Do NOT set Content-Type header - axios/browser will set it with correct boundary
      const response = await axiosInstance.put('/users/profile/avatar', formData);

      if (response.data.success) {
        toast.success('Profile picture updated!');
        // Refresh profile to get new avatar URL
        await dispatch(fetchProfile());
      }
    } catch (error: any) {
      console.error('Failed to upload avatar:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile picture');
    } finally {
      setIsUploading(false);
      setShowPreviewModal(false);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCancel = () => {
    setShowPreviewModal(false);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayImage = currentImageUrl || previewUrl;

  return (
    <>
      <div className={styles.avatarUpload}>
        <div className={styles.avatarPreview}>
          {displayImage ? (
            <img src={displayImage} alt={userName} />
          ) : (
            userName.charAt(0).toUpperCase()
          )}
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={styles.avatarUploadButton}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {/* Preview Modal - Using Portal to render at body level */}
      {createPortal(
        <AnimatePresence>
          {showPreviewModal && previewUrl && (
            <motion.div
              className={styles.modalBackdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancel}
            >
              <motion.div
                className={styles.confirmDialog}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '360px', minHeight: 'auto' }}
              >
                <button onClick={handleCancel} className={styles.closeButtonSmall}>
                  <X className="w-4 h-4" />
                </button>

                <div style={{ marginBottom: '1rem' }}>
                  <div
                    style={{
                      width: '150px',
                      height: '150px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      margin: '0 auto',
                      boxShadow: '0 0 0 4px white, 0 4px 20px rgba(0,0,0,0.15)',
                    }}
                  >
                    <img
                      src={previewUrl}
                      alt="Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                </div>

                <h3 className={styles.confirmTitle}>Update Profile Picture?</h3>
                <p className={styles.confirmDescription}>
                  This will be visible to other users.
                </p>

                <div className={styles.confirmActions}>
                  <button onClick={handleCancel} className={styles.btnCancel} disabled={isUploading}>
                    Cancel
                  </button>
                  <button onClick={handleUpload} className={styles.btnSave} disabled={isUploading}>
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Save'
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

export default ProfilePictureUpload;
