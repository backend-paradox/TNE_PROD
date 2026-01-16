import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  MapPin,
  Phone,
  FileText,
  Shield,
  Settings,
  Package,
  Heart,
  Bell,
  HelpCircle,
  LogOut,
  Camera,
  ChevronRight,
  X,
  Check,
  Loader2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { fetchProfile } from '../../store/slices/profileSlice';
import { useWishlist } from '../../hooks';
import axiosInstance from '../../app/axios';
import toast from 'react-hot-toast';
import styles from './ProfileSidebar.module.css';

type TabType = 'profile' | 'addresses' | 'emergency' | 'kyc' | 'security' | 'preferences';

interface ProfileSidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  userName: string;
  userEmail: string;
  profilePicUrl?: string;
  onAvatarClick?: () => void;
}

const navItems: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Personal Info', icon: User },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'emergency', label: 'Emergency Contact', icon: Phone },
  { id: 'kyc', label: 'Documents', icon: FileText },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'preferences', label: 'Preferences', icon: Settings },
];

export function ProfileSidebar({
  activeTab,
  onTabChange,
  userName,
  userEmail,
  profilePicUrl,
}: ProfileSidebarProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const bookingHistory = useAppSelector((state) => state.booking.bookingHistory);
  const { wishlist } = useWishlist();

  // Avatar upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const handleLogout = async () => {
    await dispatch(logout()).unwrap();
    navigate('/');
  };

  const upcomingBookings = bookingHistory?.filter(
    (booking) => new Date(booking.travelDate) > new Date()
  ).length || 0;

  const quickLinks = [
    { label: 'My Bookings', icon: Package, badge: upcomingBookings, path: '/bookings' },
    { label: 'Wishlist', icon: Heart, badge: wishlist?.length || 0, path: '/wishlist' },
    { label: 'Notifications', icon: Bell, badge: 0, path: '/notifications' },
    { label: 'Help Center', icon: HelpCircle, badge: null, path: '/help' },
  ];

  // Avatar upload handlers
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

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

  const handleUploadAvatar = async () => {
    if (!fileInputRef.current?.files?.[0]) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', fileInputRef.current.files[0]);

    try {
      const response = await axiosInstance.put('/users/profile/avatar', formData);

      if (response.data.success) {
        toast.success('Profile picture updated!');
        await dispatch(fetchProfile());
      }
    } catch (error: any) {
      console.error('Failed to upload avatar:', error);
      toast.error(error.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
      setShowPreviewModal(false);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCancelUpload = () => {
    setShowPreviewModal(false);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <aside className={styles.sidebar}>
      {/* User Profile Section */}
      <div className={styles.userSection}>
        <div className={styles.avatarWrapper} onClick={handleAvatarClick}>
          <div className={styles.avatar}>
            {profilePicUrl ? (
              <img src={profilePicUrl} alt={userName} />
            ) : (
              <span>{userName?.charAt(0)?.toUpperCase() || 'U'}</span>
            )}
          </div>
          <button className={styles.avatarOverlay} type="button" disabled={isUploading}>
            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <h3 className={styles.userName}>{userName || 'User'}</h3>
        <p className={styles.userEmail}>{userEmail || 'email@example.com'}</p>
      </div>

      <div className={styles.divider} />

      {/* Navigation Menu */}
      <nav className={styles.nav}>
        <p className={styles.navLabel}>Account Settings</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              <span className={styles.navIcon}>
                <Icon size={18} />
              </span>
              <span className={styles.navText}>{item.label}</span>
              {isActive && <span className={styles.activeIndicator} />}
            </button>
          );
        })}
      </nav>

      <div className={styles.divider} />

      {/* Quick Links */}
      <nav className={styles.nav}>
        <p className={styles.navLabel}>Quick Links</p>
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.label}
              onClick={() => navigate(link.path)}
              className={styles.quickLink}
            >
              <span className={styles.quickLinkIcon}>
                <Icon size={18} />
              </span>
              <span className={styles.navText}>{link.label}</span>
              {link.badge !== null && link.badge > 0 && (
                <span className={styles.badge}>{link.badge}</span>
              )}
              <ChevronRight size={16} className={styles.chevron} />
            </button>
          );
        })}
      </nav>

      <div className={styles.divider} />

      {/* Logout Button */}
      <button onClick={handleLogout} className={styles.logoutBtn}>
        <LogOut size={18} />
        <span>Logout</span>
      </button>

      {/* Avatar Preview Modal */}
      {createPortal(
        <AnimatePresence>
          {showPreviewModal && previewUrl && (
            <motion.div
              className={styles.modalBackdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancelUpload}
            >
              <motion.div
                className={styles.previewModal}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={handleCancelUpload} className={styles.modalCloseBtn}>
                  <X size={20} />
                </button>

                <div className={styles.previewContent}>
                  <div className={styles.previewImage}>
                    <img src={previewUrl} alt="Preview" />
                  </div>
                  <h3 className={styles.previewTitle}>Update Profile Picture?</h3>
                  <p className={styles.previewDescription}>
                    This will be visible on your profile.
                  </p>
                </div>

                <div className={styles.previewActions}>
                  <button
                    onClick={handleCancelUpload}
                    disabled={isUploading}
                    className={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUploadAvatar}
                    disabled={isUploading}
                    className={styles.saveBtn}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        Save
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </aside>
  );
}

export default ProfileSidebar;
