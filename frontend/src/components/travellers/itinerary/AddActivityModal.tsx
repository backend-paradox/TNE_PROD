import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Clock,
  IndianRupee,
  FileText,
  Utensils,
  Camera,
  Car,
  Bed,
  ShoppingBag,
  Landmark,
  PartyPopper,
  Image,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ItineraryActivity } from '@/types/travellers';
import styles from './AddActivityModal.module.css';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (activity: Omit<ItineraryActivity, 'id'>) => void;
  dayNumber: number;
  date: string;
}

const categories = [
  { id: 'FOOD', label: 'Food & Dining', icon: Utensils, color: '#f97316' },
  { id: 'SIGHTSEEING', label: 'Sightseeing', icon: Camera, color: '#8b5cf6' },
  { id: 'TRANSPORT', label: 'Transport', icon: Car, color: '#3b82f6' },
  { id: 'ACCOMMODATION', label: 'Accommodation', icon: Bed, color: '#ec4899' },
  { id: 'SHOPPING', label: 'Shopping', icon: ShoppingBag, color: '#10b981' },
  { id: 'ACTIVITY', label: 'Activity', icon: Landmark, color: '#f59e0b' },
  { id: 'FREE_TIME', label: 'Free Time', icon: PartyPopper, color: '#ef4444' },
];

const timeSlots = [
  '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM',
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM',
  '9:00 PM', '9:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM',
];

const durations = [
  '30 mins', '1 hour', '1.5 hours', '2 hours', '2.5 hours', '3 hours',
  '4 hours', '5 hours', '6 hours', 'Full day',
];

export function AddActivityModal({ isOpen, onClose, onAdd, dayNumber, date }: AddActivityModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    time: '9:00 AM',
    duration: '2 hours',
    category: 'SIGHTSEEING' as ItineraryActivity['category'],
    cost: 0,
    notes: '',
    image: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAdd(formData);

    // Reset form
    setFormData({
      title: '',
      location: '',
      time: '9:00 AM',
      duration: '2 hours',
      category: 'SIGHTSEEING',
      cost: 0,
      notes: '',
      image: '',
    });
    setErrors({});
  };

  const handleCategorySelect = (categoryId: string) => {
    setFormData({ ...formData, category: categoryId as ItineraryActivity['category'] });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className={styles.overlay} onClick={onClose}>
        <motion.div
          className={styles.modal}
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
        >
          <div className={styles.header}>
            <div>
              <h2 className={styles.title}>Add Activity</h2>
              <p className={styles.subtitle}>Day {dayNumber} | {date}</p>
            </div>
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Category Selection */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Category</label>
              <div className={styles.categoryGrid}>
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = formData.category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`${styles.categoryBtn} ${isSelected ? styles.selected : ''}`}
                      style={{
                        '--cat-color': cat.color,
                        borderColor: isSelected ? cat.color : 'transparent',
                        background: isSelected ? `${cat.color}15` : undefined,
                      } as React.CSSProperties}
                      onClick={() => handleCategorySelect(cat.id)}
                    >
                      <Icon size={20} style={{ color: cat.color }} />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Activity Title *</label>
              <input
                type="text"
                className={`${styles.input} ${errors.title ? styles.error : ''}`}
                placeholder="e.g., Visit Burj Khalifa"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              {errors.title && <span className={styles.errorText}>{errors.title}</span>}
            </div>

            {/* Location */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                <MapPin size={16} />
                Location *
              </label>
              <input
                type="text"
                className={`${styles.input} ${errors.location ? styles.error : ''}`}
                placeholder="e.g., Downtown Dubai"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
              {errors.location && <span className={styles.errorText}>{errors.location}</span>}
            </div>

            {/* Time & Duration Row */}
            <div className={styles.row}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  <Clock size={16} />
                  Start Time
                </label>
                <select
                  className={styles.select}
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                >
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Duration</label>
                <select
                  className={styles.select}
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                >
                  {durations.map((dur) => (
                    <option key={dur} value={dur}>
                      {dur}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cost */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                <IndianRupee size={16} />
                Estimated Cost (INR)
              </label>
              <input
                type="number"
                className={styles.input}
                placeholder="0"
                min="0"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })}
              />
            </div>

            {/* Image URL */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                <Image size={16} />
                Image URL (optional)
              </label>
              <input
                type="url"
                className={styles.input}
                placeholder="https://example.com/image.jpg"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
            </div>

            {/* Notes */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                <FileText size={16} />
                Notes (optional)
              </label>
              <textarea
                className={styles.textarea}
                placeholder="Add any additional notes..."
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <Button type="button" variant="outline" className={styles.cancelBtn} onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className={styles.submitBtn}>
                Add Activity
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
