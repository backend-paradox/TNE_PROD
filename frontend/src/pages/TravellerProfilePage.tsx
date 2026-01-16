import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Edit,
  AtSign,
  Globe,
  Camera,
  Plus,
  MapPin,
  Loader2,
  X,
  Check,
  Map,
  Flag,
  Building2,
  Users,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProfile, updateProfileAPI } from '@/store/slices/profileSlice';
import axiosInstance from '@/app/axios';
import toast from 'react-hot-toast';
import styles from './TravellerProfilePage.module.css';

export function TravellerProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { profile, isLoading, isUpdating } = useAppSelector((state) => state.profile);

  // Avatar upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<{
    name: string;
    bio: string;
    interests: string[];
    languages: string[];
  }>({
    name: '',
    bio: '',
    interests: [],
    languages: [],
  });
  const [pendingInterest, setPendingInterest] = useState('');
  const [pendingLanguage, setPendingLanguage] = useState('');

  // Fetch profile data on mount
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Get user info from profile or auth store
  const userName = profile?.name || user?.name || 'Traveller';
  const userEmail = profile?.email || user?.email || '';
  const userPhone = profile?.phone || user?.phone || '';
  const userBio = profile?.bio || 'Travel Enthusiast';
  const avatarUrl = profile?.profilePicUrl || user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`;

  const interests = Array.isArray(profile?.interests) ? profile?.interests : [];
  const languages = Array.isArray(profile?.languages) ? profile?.languages : [];
  const cities = Array.isArray(profile?.visitedCities) ? profile?.visitedCities : [];

  // Stats from profile
  const totalTrips = profile?.totalTrips || 0;
  const totalCountries = profile?.totalCountries || 0;
  const totalCities = profile?.totalCities || 0;
  const groupTrips = 0; // TODO: Get from API when available

  // Avatar upload handlers
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
      // Note: Don't manually set Content-Type for FormData - axios will set it with proper boundary
      const response = await axiosInstance.put('/users/profile/avatar', formData);

      if (response.data.success) {
        toast.success('Profile picture updated!');
        // Refresh profile to get new avatar URL
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

  const openEditModal = () => {
    setEditForm({
      name: profile?.name || user?.name || '',
      bio: profile?.bio || '',
      interests: [...interests],
      languages: [...languages],
    });
    setPendingInterest('');
    setPendingLanguage('');
    setIsEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
  };

  const addListItem = (key: 'interests' | 'languages', value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    setEditForm((prev) => {
      const current = prev[key];
      if (current.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
        return prev;
      }
      return { ...prev, [key]: [...current, trimmed] };
    });

    if (key === 'interests') {
      setPendingInterest('');
    } else {
      setPendingLanguage('');
    }
  };

  const removeListItem = (key: 'interests' | 'languages', value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [key]: prev[key].filter((item) => item !== value),
    }));
  };

  const handleSaveProfile = async () => {
    const trimmedName = editForm.name.trim();
    const trimmedBio = editForm.bio.trim();

    const payload = {
      name: trimmedName || undefined,
      bio: trimmedBio.length > 0 ? trimmedBio : null,
      interests: editForm.interests,
      languages: editForm.languages,
    };

    try {
      await dispatch(updateProfileAPI(payload)).unwrap();
      toast.success('Profile updated');
      setIsEditModalOpen(false);
    } catch (error) {
      const message = typeof error === 'string' ? error : 'Failed to update profile';
      toast.error(message);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (isLoading && !profile) {
    return (
      <div className={styles.skeletonContainer}>
        {/* Skeleton Profile Card with Cover */}
        <div className={styles.skeletonCard}>
          <div className={styles.skeletonCover} />
          <div className={styles.skeletonHeader}>
            <div className={styles.skeletonProfileInfo}>
              <div className={styles.skeletonAvatar} />
              <div className={styles.skeletonNameSection}>
                <div className={styles.skeletonName} />
                <div className={styles.skeletonBio} />
                <div className={styles.skeletonSocialLinks}>
                  <div className={styles.skeletonSocialBtn} />
                  <div className={styles.skeletonSocialBtn} />
                </div>
              </div>
            </div>
            <div className={styles.skeletonEditBtn} />
          </div>
        </div>

        {/* Skeleton Stats Grid */}
        <div className={styles.skeletonStatsGrid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.skeletonStatCard} />
          ))}
        </div>

        {/* Skeleton Two Column */}
        <div className={styles.skeletonTwoColumn}>
          <div className={styles.skeletonSection}>
            <div className={styles.skeletonSectionTitle} />
            <div className={styles.skeletonTagsGrid}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={styles.skeletonTag} />
              ))}
            </div>
          </div>
          <div className={styles.skeletonSection}>
            <div className={styles.skeletonSectionTitle} />
            <div className={styles.skeletonTagsGrid}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.skeletonTag} />
              ))}
            </div>
          </div>
        </div>

        {/* Skeleton Cities Section */}
        <div className={styles.skeletonCitiesSection}>
          <div className={styles.skeletonSectionTitle} />
          <div className={styles.skeletonCitiesGrid}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={styles.skeletonCityCard} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.container}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Profile Card with Cover */}
      <motion.div className={styles.profileCard} variants={itemVariants}>
        {/* Cover Section */}
        <div className={styles.coverSection}>
          <div className={styles.coverPattern} />
        </div>

        {/* Profile Header */}
        <div className={styles.profileHeader}>
          <div className={styles.profileInfo}>
            <div className={styles.avatarSection}>
              <div className={styles.avatar}>
                <img
                  src={avatarUrl}
                  alt={userName}
                />
                <div className={styles.onlineIndicator} />
              </div>
              <Button
                className={styles.editAvatarBtn}
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>
            <div className={styles.nameSection}>
              <h1 className={styles.name}>{userName}</h1>
              <p className={styles.bio}>{userBio}</p>
              <div className={styles.socialLinks}>
                {userEmail && (
                  <Button variant="outline" size="sm" className={styles.socialBtn}>
                    <AtSign size={14} />
                    {userEmail}
                  </Button>
                )}
                {profile?.website && (
                  <Button variant="outline" size="sm" className={styles.socialBtn}>
                    <Globe size={14} />
                    Website
                  </Button>
                )}
              </div>
            </div>
          </div>
          <Button className={styles.editProfileBtn} onClick={openEditModal}>
            <Edit size={18} />
            Edit Profile
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div className={styles.statsGrid} variants={containerVariants}>
        <motion.div className={`${styles.statCard} ${styles.tripsCard}`} variants={itemVariants}>
          <div className={styles.statIcon}>
            <Map size={22} />
          </div>
          <div className={styles.statValue}>{totalTrips}</div>
          <div className={styles.statLabel}>Trips Completed</div>
        </motion.div>
        <motion.div className={`${styles.statCard} ${styles.countriesCard}`} variants={itemVariants}>
          <div className={styles.statIcon}>
            <Flag size={22} />
          </div>
          <div className={styles.statValue}>{totalCountries}</div>
          <div className={styles.statLabel}>Countries</div>
        </motion.div>
        <motion.div className={`${styles.statCard} ${styles.citiesCard}`} variants={itemVariants}>
          <div className={styles.statIcon}>
            <Building2 size={22} />
          </div>
          <div className={styles.statValue}>{totalCities}</div>
          <div className={styles.statLabel}>Cities Visited</div>
        </motion.div>
        <motion.div className={`${styles.statCard} ${styles.groupTripsCard}`} variants={itemVariants}>
          <div className={styles.statIcon}>
            <Users size={22} />
          </div>
          <div className={styles.statValue}>{groupTrips}</div>
          <div className={styles.statLabel}>Group Trips</div>
        </motion.div>
      </motion.div>

      {/* Interests and Languages */}
      <div className={styles.twoColumnGrid}>
        {/* Interests */}
        <motion.div className={styles.section} variants={itemVariants}>
          <h2 className={styles.sectionTitle}>Interests</h2>
          <div className={styles.tagsGrid}>
            {interests.map((interest) => (
              <Badge key={interest} className={styles.tag}>
                {interest}
              </Badge>
            ))}
            <Button variant="outline" size="sm" className={styles.addBtn} onClick={openEditModal}>
              <Plus size={14} />
              Add
            </Button>
          </div>
        </motion.div>

        {/* Languages */}
        <motion.div className={styles.section} variants={itemVariants}>
          <h2 className={styles.sectionTitle}>Languages</h2>
          <div className={styles.tagsGrid}>
            {languages.map((language) => (
              <Badge key={language} className={styles.tag}>
                {language}
              </Badge>
            ))}
            <Button variant="outline" size="sm" className={styles.addBtn} onClick={openEditModal}>
              <Plus size={14} />
              Add
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Cities Visited */}
      <motion.div className={styles.section} variants={itemVariants}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <MapPin size={20} className={styles.titleIcon} />
            Cities I've Visited
          </h2>
        </div>
        <div className={styles.citiesGrid}>
          {cities.length > 0 ? (
            cities.map((city) => (
              <Badge key={city} className={styles.cityBadge}>
                <MapPin size={12} />
                {city}
              </Badge>
            ))
          ) : (
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No cities added yet. Start tracking your travels!</p>
          )}
        </div>
      </motion.div>

      {/* Edit Profile Modal */}
      {createPortal(
        isEditModalOpen && (
          <motion.div
            className={styles.modalBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseEdit}
          >
            <motion.div
              className={styles.editModal}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={handleCloseEdit} className={styles.modalCloseBtn}>
                <X size={20} />
              </button>

              <div className={styles.editHeader}>
                <h3 className={styles.editTitle}>Edit Profile</h3>
                <p className={styles.editSubtitle}>Update your travel profile details.</p>
              </div>

              <div className={styles.editForm}>
                <label className={styles.editLabel}>
                  Name
                  <input
                    className={styles.editInput}
                    value={editForm.name}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Your name"
                  />
                </label>

                <label className={styles.editLabel}>
                  Bio
                  <textarea
                    className={styles.editTextarea}
                    rows={3}
                    value={editForm.bio}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell others about your travel style"
                  />
                </label>

                <label className={styles.editLabel}>
                  Interests
                  <div className={styles.chipInputRow}>
                    <input
                      className={styles.editInput}
                      value={pendingInterest}
                      onChange={(e) => setPendingInterest(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addListItem('interests', pendingInterest);
                        }
                      }}
                      placeholder="Add an interest"
                    />
                    <button
                      type="button"
                      className={styles.addItemButton}
                      onClick={() => addListItem('interests', pendingInterest)}
                    >
                      Add
                    </button>
                  </div>
                  <div className={styles.chipList}>
                    {editForm.interests.map((interest) => (
                      <span key={interest} className={styles.chip}>
                        {interest}
                        <button
                          type="button"
                          className={styles.chipRemove}
                          onClick={() => removeListItem('interests', interest)}
                          aria-label={`Remove ${interest}`}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </label>

                <label className={styles.editLabel}>
                  Languages
                  <div className={styles.chipInputRow}>
                    <input
                      className={styles.editInput}
                      value={pendingLanguage}
                      onChange={(e) => setPendingLanguage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addListItem('languages', pendingLanguage);
                        }
                      }}
                      placeholder="Add a language"
                    />
                    <button
                      type="button"
                      className={styles.addItemButton}
                      onClick={() => addListItem('languages', pendingLanguage)}
                    >
                      Add
                    </button>
                  </div>
                  <div className={styles.chipList}>
                    {editForm.languages.map((language) => (
                      <span key={language} className={styles.chip}>
                        {language}
                        <button
                          type="button"
                          className={styles.chipRemove}
                          onClick={() => removeListItem('languages', language)}
                          aria-label={`Remove ${language}`}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </label>
              </div>

              <div className={styles.previewActions}>
                <Button variant="outline" onClick={handleCloseEdit} disabled={isUpdating} className={styles.cancelBtn}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} disabled={isUpdating} className={styles.saveBtn}>
                  {isUpdating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ),
        document.body
      )}

      {/* Avatar Preview Modal */}
      {createPortal(
        showPreviewModal && previewUrl && (
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
                  This will be visible to other users.
                </p>
              </div>

              <div className={styles.previewActions}>
                <Button
                  variant="outline"
                  onClick={handleCancelUpload}
                  disabled={isUploading}
                  className={styles.cancelBtn}
                >
                  Cancel
                </Button>
                <Button
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
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ),
        document.body
      )}
    </motion.div>
  );
}
