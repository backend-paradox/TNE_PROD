import React, { useState, useEffect } from 'react';
import {
  Plane,
  Utensils,
  Armchair,
  Bell,
  Mail,
  Loader2,
  Check,
  Mountain,
  Palmtree,
  Camera,
  Compass,
  Heart,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateProfileAPI } from '../../store/slices/profileSlice';
import { TravelPreferences as TravelPreferencesType } from '../../types';
import toast from 'react-hot-toast';
import styles from './ProfileComponents.module.css';

const seatOptions = [
  { value: 'WINDOW', label: 'Window', icon: '🪟' },
  { value: 'AISLE', label: 'Aisle', icon: '🚶' },
  { value: 'MIDDLE', label: 'Middle', icon: '👥' },
] as const;

const mealOptions = [
  { value: 'VEGETARIAN', label: 'Vegetarian' },
  { value: 'NON_VEGETARIAN', label: 'Non-Vegetarian' },
  { value: 'VEGAN', label: 'Vegan' },
  { value: 'HALAL', label: 'Halal' },
  { value: 'KOSHER', label: 'Kosher' },
  { value: 'NONE', label: 'No Preference' },
] as const;

const classOptions = [
  { value: 'ECONOMY', label: 'Economy' },
  { value: 'PREMIUM_ECONOMY', label: 'Premium Economy' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'FIRST', label: 'First Class' },
] as const;

const travelStyleOptions = [
  { value: 'Adventure', label: 'Adventure', icon: Mountain },
  { value: 'Beach', label: 'Beach', icon: Palmtree },
  { value: 'Cultural', label: 'Cultural', icon: Camera },
  { value: 'Explorer', label: 'Explorer', icon: Compass },
  { value: 'Romantic', label: 'Romantic', icon: Heart },
] as const;

const defaultPreferences: TravelPreferencesType = {
  seatPreference: undefined,
  mealPreference: undefined,
  classPreference: 'ECONOMY',
  preferredAirlines: [],
  notifications: true,
  newsletter: false,
  travelStyles: [],
};

export function TravelPreferences() {
  const dispatch = useAppDispatch();
  const { profile, isUpdating } = useAppSelector((state) => state.profile);
  const [preferences, setPreferences] = useState<TravelPreferencesType>(defaultPreferences);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (profile?.preferences) {
      setPreferences({
        ...defaultPreferences,
        ...profile.preferences,
      });
    }
  }, [profile]);

  const handleChange = (key: keyof TravelPreferencesType, value: any) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const toggleTravelStyle = (style: string) => {
    setPreferences((prev) => {
      const current = prev.travelStyles || [];
      const updated = current.includes(style)
        ? current.filter((s) => s !== style)
        : [...current, style];
      return { ...prev, travelStyles: updated };
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await dispatch(updateProfileAPI({ preferences })).unwrap();
      toast.success('Preferences saved!');
      setHasChanges(false);
    } catch (error) {
      const message = typeof error === 'string' ? error : 'Failed to save preferences';
      toast.error(message);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem' }}>
          Travel Preferences
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
          Customize your travel experience with your preferences.
        </p>
      </div>

      {/* Seat Preference */}
      <div className={styles.preferenceSection}>
        <p className={styles.preferenceTitle}>
          <Armchair className="w-4 h-4" />
          Seat Preference
        </p>
        <div className={styles.preferenceChips}>
          {seatOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleChange('seatPreference', option.value)}
              className={`${styles.preferenceChip} ${
                preferences.seatPreference === option.value ? styles.preferenceChipActive : ''
              }`}
            >
              <span>{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Meal Preference */}
      <div className={styles.preferenceSection}>
        <p className={styles.preferenceTitle}>
          <Utensils className="w-4 h-4" />
          Meal Preference
        </p>
        <select
          value={preferences.mealPreference || ''}
          onChange={(e) => handleChange('mealPreference', e.target.value || undefined)}
          className={styles.formSelect}
        >
          <option value="">Select meal preference</option>
          {mealOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Class Preference */}
      <div className={styles.preferenceSection}>
        <p className={styles.preferenceTitle}>
          <Plane className="w-4 h-4" />
          Preferred Class
        </p>
        <div className={styles.preferenceChips}>
          {classOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleChange('classPreference', option.value)}
              className={`${styles.preferenceChip} ${
                preferences.classPreference === option.value ? styles.preferenceChipActive : ''
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Travel Styles */}
      <div className={styles.preferenceSection}>
        <p className={styles.preferenceTitle}>
          <Compass className="w-4 h-4" />
          Travel Styles
        </p>
        <div className={styles.preferenceChips}>
          {travelStyleOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleTravelStyle(option.value)}
                className={`${styles.preferenceChip} ${
                  preferences.travelStyles?.includes(option.value) ? styles.preferenceChipActive : ''
                }`}
              >
                <Icon className="w-4 h-4" />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className={styles.preferenceSection}>
        <p className={styles.preferenceTitle}>
          <Bell className="w-4 h-4" />
          Notifications
        </p>

        <div className={styles.preferenceToggle}>
          <div className={styles.toggleLabel}>
            <span className={styles.toggleTitle}>Push Notifications</span>
            <span className={styles.toggleDescription}>Receive booking updates and reminders</span>
          </div>
          <button
            type="button"
            onClick={() => handleChange('notifications', !preferences.notifications)}
            className={`${styles.toggle} ${preferences.notifications ? styles.toggleActive : ''}`}
          />
        </div>

        <div className={styles.preferenceToggle}>
          <div className={styles.toggleLabel}>
            <span className={styles.toggleTitle}>Newsletter</span>
            <span className={styles.toggleDescription}>Get travel deals and inspiration</span>
          </div>
          <button
            type="button"
            onClick={() => handleChange('newsletter', !preferences.newsletter)}
            className={`${styles.toggle} ${preferences.newsletter ? styles.toggleActive : ''}`}
          />
        </div>
      </div>

      {/* Save Button */}
      {hasChanges && (
        <div className={styles.modalActions}>
          <button onClick={handleSave} disabled={isUpdating} className={styles.btnSave}>
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save Preferences
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default TravelPreferences;
