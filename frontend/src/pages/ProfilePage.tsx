import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Check,
  Loader2,
  AlertCircle,
  Users,
  Plus,
  Trash2,
  Home,
  Briefcase,
  Edit3,
  Lock,
  Menu,
  X,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadBookingHistory } from '../store/slices/bookingSlice';
import {
  addAddress,
  deleteAddress,
  fetchAddresses,
  fetchProfile,
  updateAddress,
  updateProfileAPI,
} from '../store/slices/profileSlice';
import { formatDate } from '../utils';
import toast, { Toaster } from 'react-hot-toast';
import { Address } from '../types';
import {
  AddressModal,
  DeleteConfirmDialog,
  ChangePassword,
  LoginHistory,
  KYCDocuments,
  TravelPreferences,
  ProfilePictureUpload,
  ProfileSidebar,
  ProfileHeader,
} from '../components/profile';
import styles from './ProfilePage.module.css';

type TabType = 'profile' | 'addresses' | 'emergency' | 'kyc' | 'security' | 'preferences';

export function ProfilePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const bookingHistory = useAppSelector((state) => state.booking.bookingHistory);
  const {
    profile,
    addresses,
    isLoading: isProfileLoading,
    isUpdating,
    error: profileError,
  } = useAppSelector((state) => state.profile);

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Address modal states
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
  });

  const [emergencyContact, setEmergencyContact] = useState({
    name: '',
    phone: '',
    relationship: '',
  });

  // Fetch data on mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    dispatch(fetchProfile());
    dispatch(fetchAddresses());
    dispatch(loadBookingHistory());
  }, [dispatch, isAuthenticated, navigate]);

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        gender: profile.gender || '',
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
      });
      if (profile.emergencyContact) {
        setEmergencyContact({
          name: profile.emergencyContact.name || '',
          phone: profile.emergencyContact.phone || '',
          relationship: profile.emergencyContact.relationship || '',
        });
      }
    }
  }, [profile]);

  // Handlers
  const handleSave = async () => {
    const updateData: any = {
      name: formData.name,
      phone: formData.phone || null,
      gender: formData.gender || null,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
    };

    if (emergencyContact.name || emergencyContact.phone) {
      updateData.emergencyContact = emergencyContact;
    }

    try {
      await dispatch(updateProfileAPI(updateData)).unwrap();
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      const message = typeof error === 'string' ? error : 'Failed to update profile';
      toast.error(message);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  // Address handlers
  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddressModalOpen(true);
  };

  const handleOpenEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressModalOpen(true);
  };

  const handleSaveAddress = async (addressData: Omit<Address, 'id'>) => {
    try {
      if (editingAddress) {
        await dispatch(updateAddress({ id: editingAddress.id, data: addressData })).unwrap();
        toast.success('Address updated successfully!');
      } else {
        await dispatch(addAddress(addressData)).unwrap();
        toast.success('Address added successfully!');
      }
      return { success: true };
    } catch (error) {
      const message = typeof error === 'string' ? error : 'Failed to save address';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const handleDeleteAddress = async () => {
    if (!deletingAddressId) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteAddress({ id: deletingAddressId })).unwrap();
      toast.success('Address deleted successfully!');
    } catch (error) {
      const message = typeof error === 'string' ? error : 'Failed to delete address';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
    setDeletingAddressId(null);
  };

  // Helper functions
  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'MALE': return 'Male';
      case 'FEMALE': return 'Female';
      case 'OTHER': return 'Other';
      case 'PREFER_NOT_TO_SAY': return 'Prefer not to say';
      default: return 'Not provided';
    }
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'HOME': return Home;
      case 'WORK': return Briefcase;
      default: return MapPin;
    }
  };

  const getProfileCompletion = () => {
    if (!profile) return 0;
    const fields = [
      profile.name,
      profile.email,
      profile.phone,
      profile.gender,
      profile.dateOfBirth,
      profile.emergencyContact?.name,
    ];
    const filledFields = fields.filter(Boolean).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  // Loading state
  if (isProfileLoading && !profile) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner} />
          <p className={styles.loadingText}>Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (profileError && !profile) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <div className={styles.errorIcon}>
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className={styles.errorTitle}>Failed to load profile</h2>
          <p className={styles.errorText}>{profileError}</p>
          <button onClick={() => dispatch(fetchProfile())} className={styles.errorButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user && !profile) {
    return null;
  }

  const displayName = profile?.name || user?.name || '';
  const displayEmail = profile?.email || user?.email || '';
  const displayPhone = profile?.phone || user?.phone || '';
  const displayGender = profile?.gender || '';
  const displayDOB = profile?.dateOfBirth || '';
  const displayAvatar = profile?.profilePicUrl || user?.avatar || '';
  const memberSince = profile?.createdAt || user?.createdAt || '';
  const profileCompletion = getProfileCompletion();

  const getSectionTitle = () => {
    switch (activeTab) {
      case 'profile': return 'Personal Information';
      case 'addresses': return 'Saved Addresses';
      case 'emergency': return 'Emergency Contact';
      case 'kyc': return 'Identity Verification';
      case 'security': return 'Security Settings';
      case 'preferences': return 'Travel Preferences';
      default: return '';
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Toaster position="top-center" />

      {/* Mobile Menu Button */}
      <button
        className={styles.mobileMenuBtn}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className={styles.mobileOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`${styles.sidebarWrapper} ${mobileMenuOpen ? styles.sidebarOpen : ''}`}>
        <ProfileSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          userName={displayName}
          userEmail={displayEmail}
          profilePicUrl={displayAvatar}
        />
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Profile Header */}
        <ProfileHeader
          userName={displayName}
          userEmail={displayEmail}
          profilePicUrl={displayAvatar}
          memberSince={memberSince}
          tripsCount={bookingHistory.length || 0}
          countriesCount={profile?.totalCountries}
          reviewsCount={profile?.totalReviews}
          profileCompletion={profileCompletion}
          isEditing={isEditing}
          onEditClick={() => setIsEditing(!isEditing)}
        />

        {/* Content Card */}
        <motion.div
          className={styles.contentCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Section Header */}
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{getSectionTitle()}</h2>
            {activeTab === 'addresses' && (
              <button onClick={handleOpenAddAddress} className={styles.addBtn}>
                <Plus size={18} />
                Add Address
              </button>
            )}
            {activeTab === 'profile' && !isEditing && (
              <button onClick={() => setIsEditing(true)} className={styles.editSectionBtn}>
                <Edit3 size={16} />
                Edit
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            <AnimatePresence mode="wait">
              {/* Personal Info Tab */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {isEditing ? (
                    <div className={styles.formContainer}>
                      <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Full Name</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={styles.formInput}
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Email Address</label>
                          <input
                            type="email"
                            value={formData.email}
                            disabled
                            className={`${styles.formInput} ${styles.formInputDisabled}`}
                          />
                          <span className={styles.formHint}>
                            <Lock size={12} /> Email cannot be changed
                          </span>
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Phone Number</label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className={styles.formInput}
                            placeholder="+91 900 700 0777"
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Gender</label>
                          <select
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            className={styles.formSelect}
                          >
                            <option value="">Select gender</option>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                          </select>
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Date of Birth</label>
                          <input
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                            className={styles.formInput}
                          />
                        </div>
                      </div>

                      <div className={styles.formActions}>
                        <button onClick={() => setIsEditing(false)} className={styles.btnCancel}>
                          Cancel
                        </button>
                        <button onClick={handleSave} disabled={isUpdating} className={styles.btnSave}>
                          {isUpdating ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.infoGrid}>
                      <div className={styles.infoCard}>
                        <div className={`${styles.infoIcon} ${styles.infoIconBlue}`}>
                          <User size={20} />
                        </div>
                        <div className={styles.infoDetails}>
                          <span className={styles.infoLabel}>Full Name</span>
                          <span className={styles.infoValue}>{displayName}</span>
                        </div>
                      </div>

                      <div className={styles.infoCard}>
                        <div className={`${styles.infoIcon} ${styles.infoIconGreen}`}>
                          <Mail size={20} />
                        </div>
                        <div className={styles.infoDetails}>
                          <span className={styles.infoLabel}>Email Address</span>
                          <span className={styles.infoValue}>{displayEmail}</span>
                        </div>
                      </div>

                      <div className={styles.infoCard}>
                        <div className={`${styles.infoIcon} ${styles.infoIconPurple}`}>
                          <Phone size={20} />
                        </div>
                        <div className={styles.infoDetails}>
                          <span className={styles.infoLabel}>Phone Number</span>
                          <span className={displayPhone ? styles.infoValue : styles.infoValueEmpty}>
                            {displayPhone || 'Not provided'}
                          </span>
                        </div>
                      </div>

                      <div className={styles.infoCard}>
                        <div className={`${styles.infoIcon} ${styles.infoIconPink}`}>
                          <User size={20} />
                        </div>
                        <div className={styles.infoDetails}>
                          <span className={styles.infoLabel}>Gender</span>
                          <span className={displayGender ? styles.infoValue : styles.infoValueEmpty}>
                            {getGenderLabel(displayGender)}
                          </span>
                        </div>
                      </div>

                      <div className={styles.infoCard}>
                        <div className={`${styles.infoIcon} ${styles.infoIconAmber}`}>
                          <Calendar size={20} />
                        </div>
                        <div className={styles.infoDetails}>
                          <span className={styles.infoLabel}>Date of Birth</span>
                          <span className={displayDOB ? styles.infoValue : styles.infoValueEmpty}>
                            {displayDOB ? formatDate(displayDOB) : 'Not provided'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <motion.div
                  key="addresses"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {addresses && addresses.length > 0 ? (
                    <div className={styles.addressList}>
                      {addresses.map((address) => {
                        const AddressIcon = getAddressIcon(address.type);
                        return (
                          <div key={address.id} className={styles.addressCard}>
                            <div className={styles.addressHeader}>
                              <div className={styles.addressType}>
                                <span className={styles.addressIcon}>
                                  <AddressIcon size={18} />
                                </span>
                                <span>{address.type}</span>
                                {address.isDefault && (
                                  <span className={styles.defaultBadge}>Default</span>
                                )}
                              </div>
                              <div className={styles.addressActions}>
                                <button
                                  onClick={() => handleOpenEditAddress(address)}
                                  className={styles.addressActionBtn}
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  onClick={() => setDeletingAddressId(address.id)}
                                  className={`${styles.addressActionBtn} ${styles.addressDeleteBtn}`}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                            <div className={styles.addressBody}>
                              <p className={styles.addressLine}>{address.addressLine1}</p>
                              {address.addressLine2 && (
                                <p className={styles.addressLine}>{address.addressLine2}</p>
                              )}
                              <p className={styles.addressLine}>
                                {address.city}, {address.state} {address.pincode}
                              </p>
                              <p className={styles.addressCountry}>{address.country}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIcon}>
                        <MapPin size={32} />
                      </div>
                      <h3 className={styles.emptyTitle}>No addresses saved</h3>
                      <p className={styles.emptyText}>Add your first address for faster checkout</p>
                      <button onClick={handleOpenAddAddress} className={styles.emptyBtn}>
                        <Plus size={18} />
                        Add Address
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Emergency Contact Tab */}
              {activeTab === 'emergency' && (
                <motion.div
                  key="emergency"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {isEditing ? (
                    <div className={styles.formContainer}>
                      <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Contact Name</label>
                          <input
                            type="text"
                            value={emergencyContact.name}
                            onChange={(e) => setEmergencyContact({ ...emergencyContact, name: e.target.value })}
                            className={styles.formInput}
                            placeholder="Full name"
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Phone Number</label>
                          <input
                            type="tel"
                            value={emergencyContact.phone}
                            onChange={(e) => setEmergencyContact({ ...emergencyContact, phone: e.target.value })}
                            className={styles.formInput}
                            placeholder="+91 900 700 0777"
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Relationship</label>
                          <select
                            value={emergencyContact.relationship}
                            onChange={(e) => setEmergencyContact({ ...emergencyContact, relationship: e.target.value })}
                            className={styles.formSelect}
                          >
                            <option value="">Select relationship</option>
                            <option value="SPOUSE">Spouse</option>
                            <option value="PARENT">Parent</option>
                            <option value="SIBLING">Sibling</option>
                            <option value="FRIEND">Friend</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className={styles.formActions}>
                        <button onClick={() => setIsEditing(false)} className={styles.btnCancel}>
                          Cancel
                        </button>
                        <button onClick={handleSave} disabled={isUpdating} className={styles.btnSave}>
                          {isUpdating ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.infoGrid}>
                      <div className={styles.infoCard}>
                        <div className={`${styles.infoIcon} ${styles.infoIconRed}`}>
                          <Users size={20} />
                        </div>
                        <div className={styles.infoDetails}>
                          <span className={styles.infoLabel}>Contact Name</span>
                          <span className={profile?.emergencyContact?.name ? styles.infoValue : styles.infoValueEmpty}>
                            {profile?.emergencyContact?.name || 'Not provided'}
                          </span>
                        </div>
                      </div>

                      <div className={styles.infoCard}>
                        <div className={`${styles.infoIcon} ${styles.infoIconOrange}`}>
                          <Phone size={20} />
                        </div>
                        <div className={styles.infoDetails}>
                          <span className={styles.infoLabel}>Phone Number</span>
                          <span className={profile?.emergencyContact?.phone ? styles.infoValue : styles.infoValueEmpty}>
                            {profile?.emergencyContact?.phone || 'Not provided'}
                          </span>
                        </div>
                      </div>

                      <div className={styles.infoCard}>
                        <div className={`${styles.infoIcon} ${styles.infoIconTeal}`}>
                          <User size={20} />
                        </div>
                        <div className={styles.infoDetails}>
                          <span className={styles.infoLabel}>Relationship</span>
                          <span className={profile?.emergencyContact?.relationship ? styles.infoValue : styles.infoValueEmpty}>
                            {profile?.emergencyContact?.relationship || 'Not provided'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* KYC Tab */}
              {activeTab === 'kyc' && (
                <motion.div
                  key="kyc"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <KYCDocuments />
                </motion.div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className={styles.securitySection}
                >
                  <div className={styles.securityCard}>
                    <h3 className={styles.securityTitle}>Change Password</h3>
                    <ChangePassword />
                  </div>
                  <div className={styles.securityCard}>
                    <h3 className={styles.securityTitle}>Login Activity</h3>
                    <LoginHistory />
                  </div>
                </motion.div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <motion.div
                  key="preferences"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <TravelPreferences />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>

      {/* Modals */}
      <AddressModal
        isOpen={addressModalOpen}
        onClose={() => {
          setAddressModalOpen(false);
          setEditingAddress(null);
        }}
        onSave={handleSaveAddress}
        editAddress={editingAddress}
      />

      <DeleteConfirmDialog
        isOpen={deletingAddressId !== null}
        onClose={() => setDeletingAddressId(null)}
        onConfirm={handleDeleteAddress}
        title="Delete Address"
        description="Are you sure you want to delete this address? This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
}

export default ProfilePage;
