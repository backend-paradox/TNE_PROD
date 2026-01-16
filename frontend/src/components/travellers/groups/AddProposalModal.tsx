import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  FileText,
  IndianRupee,
  Image,
  CheckCircle,
  Link,
  Hotel,
  Utensils,
  Target,
  Landmark,
  Car,
  Pin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/travellers';
import styles from './AddProposalModal.module.css';

export interface ProposalFormData {
  title: string;
  description: string;
  location: string;
  price: string;
  priceLabel: string;
  image: string;
}

interface AddProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProposal: (proposal: ProposalFormData) => void;
  tripName?: string;
}

const proposalTypes = [
  { id: 'hotel', label: 'Hotel/Stay', icon: <Hotel size={20} />, defaultPriceLabel: '/night' },
  { id: 'restaurant', label: 'Restaurant', icon: <Utensils size={20} />, defaultPriceLabel: '/person' },
  { id: 'activity', label: 'Activity', icon: <Target size={20} />, defaultPriceLabel: '/person' },
  { id: 'attraction', label: 'Attraction', icon: <Landmark size={20} />, defaultPriceLabel: '/ticket' },
  { id: 'transport', label: 'Transport', icon: <Car size={20} />, defaultPriceLabel: '/trip' },
  { id: 'other', label: 'Other', icon: <Pin size={20} />, defaultPriceLabel: '' },
];

const sampleImages = [
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
  'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=400',
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400',
];

export function AddProposalModal({ isOpen, onClose, onAddProposal, tripName }: AddProposalModalProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [selectedType, setSelectedType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [priceLabel, setPriceLabel] = useState('/person');
  const [imageUrl, setImageUrl] = useState('');
  const [showImagePicker, setShowImagePicker] = useState(false);

  const resetForm = () => {
    setStep('form');
    setSelectedType('');
    setTitle('');
    setDescription('');
    setLocation('');
    setPrice('');
    setPriceLabel('/person');
    setImageUrl('');
    setShowImagePicker(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleTypeSelect = (typeId: string) => {
    const type = proposalTypes.find(t => t.id === typeId);
    setSelectedType(typeId);
    if (type) {
      setPriceLabel(type.defaultPriceLabel);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedPrice = formatCurrency(Number(price) || 0, 'INR');
    const proposalData: ProposalFormData = {
      title,
      description,
      location,
      price: formattedPrice,
      priceLabel,
      image: imageUrl || sampleImages[0],
    };

    onAddProposal(proposalData);
    setStep('success');
  };

  const isFormValid = () => {
    return title && description && location && price && selectedType;
  };

  if (!isOpen) return null;

  const formattedPrice = formatCurrency(Number(price) || 0, 'INR');

  return (
    <AnimatePresence>
      <motion.div
        className={styles.backdrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className={styles.modal}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className={styles.closeBtn} onClick={handleClose}>
            <X size={20} />
          </button>

          {step === 'form' ? (
            <>
              <div className={styles.header}>
                <div className={styles.iconWrapper}>
                  <MapPin size={28} />
                </div>
                <h2 className={styles.title}>Add Proposal</h2>
                <p className={styles.subtitle}>
                  Suggest a place or activity for {tripName || 'the group'}
                </p>
              </div>

              <form className={styles.form} onSubmit={handleSubmit}>
                {/* Proposal Type */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>What are you proposing?</label>
                  <div className={styles.typeGrid}>
                    {proposalTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        className={`${styles.typeOption} ${selectedType === type.id ? styles.selected : ''}`}
                        onClick={() => handleTypeSelect(type.id)}
                      >
                        <span className={styles.typeIcon}>{type.icon}</span>
                        <span>{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Name / Title</label>
                  <div className={styles.inputWrapper}>
                    <FileText size={18} className={styles.inputIcon} />
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="e.g., Atlantis The Palm"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Description</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="Brief description of your proposal..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    required
                  />
                </div>

                {/* Location */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Location</label>
                  <div className={styles.inputWrapper}>
                    <MapPin size={18} className={styles.inputIcon} />
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="e.g., Palm Jumeirah, Dubai"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Price */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Estimated Price</label>
                  <div className={styles.priceRow}>
                    <div className={styles.inputWrapper}>
                      <IndianRupee size={18} className={styles.inputIcon} />
                      <input
                        type="number"
                        className={styles.input}
                        placeholder="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        min="0"
                        required
                      />
                    </div>
                    <select
                      className={styles.priceLabelSelect}
                      value={priceLabel}
                      onChange={(e) => setPriceLabel(e.target.value)}
                    >
                      <option value="/person">/person</option>
                      <option value="/night">/night</option>
                      <option value="/ticket">/ticket</option>
                      <option value="/trip">/trip</option>
                      <option value=" total">total</option>
                    </select>
                  </div>
                </div>

                {/* Image */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Image (Optional)</label>
                  <div className={styles.imageSection}>
                    {imageUrl ? (
                      <div className={styles.imagePreview}>
                        <img src={imageUrl} alt="Preview" />
                        <button
                          type="button"
                          className={styles.removeImage}
                          onClick={() => setImageUrl('')}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className={styles.imageActions}>
                        <button
                          type="button"
                          className={styles.imageBtn}
                          onClick={() => setShowImagePicker(!showImagePicker)}
                        >
                          <Image size={16} />
                          Choose Sample
                        </button>
                        <div className={styles.imageUrlInput}>
                          <Link size={16} />
                          <input
                            type="text"
                            placeholder="Or paste image URL"
                            onChange={(e) => setImageUrl(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                    {showImagePicker && !imageUrl && (
                      <div className={styles.imagePicker}>
                        {sampleImages.map((img, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className={styles.sampleImage}
                            onClick={() => {
                              setImageUrl(img);
                              setShowImagePicker(false);
                            }}
                          >
                            <img src={img} alt={`Sample ${idx + 1}`} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={!isFormValid()}
                >
                  Submit Proposal
                </Button>
              </form>
            </>
          ) : (
            <div className={styles.successContent}>
              <div className={styles.successHeader}>
                <div className={styles.successIcon}>
                  <CheckCircle size={32} />
                </div>
                <h2 className={styles.title}>Proposal Submitted!</h2>
                <p className={styles.subtitle}>
                  Your proposal has been added for the group to vote on
                </p>
              </div>

              <div className={styles.proposalPreview}>
                {imageUrl && (
                  <div className={styles.previewImage}>
                    <img src={imageUrl} alt={title} />
                  </div>
                )}
                <div className={styles.previewContent}>
                  <h3 className={styles.previewTitle}>{title}</h3>
                  <p className={styles.previewDescription}>{description}</p>
                  <div className={styles.previewMeta}>
                    <span>
                      <MapPin size={14} />
                      {location}
                    </span>
                    <span className={styles.previewPrice}>
                      {formattedPrice}{priceLabel}
                    </span>
                  </div>
                </div>
              </div>

              <p className={styles.voteInfo}>
                Group members can now vote Yes or No on your proposal
              </p>

              <Button className={styles.doneBtn} onClick={handleClose}>
                Done
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
