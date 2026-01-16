import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ZoomIn } from 'lucide-react';
import styles from './ImageMessage.module.css';

interface ImageMessageProps {
  imageUrl: string;
  caption?: string;
  timestamp: string;
  isOwn?: boolean;
}

export function ImageMessage({ imageUrl, caption, timestamp, isOwn }: ImageMessageProps) {
  const [showLightbox, setShowLightbox] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <div className={`${styles.container} ${isOwn ? styles.own : ''}`}>
        <div className={styles.imageWrapper} onClick={() => setShowLightbox(true)}>
          {isLoading && (
            <div className={styles.loadingPlaceholder}>
              <div className={styles.loadingSpinner} />
            </div>
          )}
          <img
            src={imageUrl}
            alt="Shared image"
            className={styles.image}
            onLoad={() => setIsLoading(false)}
            style={{ opacity: isLoading ? 0 : 1 }}
          />
          <div className={styles.imageOverlay}>
            <ZoomIn size={24} />
          </div>
        </div>

        {caption && <p className={styles.caption}>{caption}</p>}

        <span className={styles.timestamp}>{timestamp}</span>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {showLightbox && (
          <motion.div
            className={styles.lightbox}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLightbox(false)}
          >
            <div className={styles.lightboxHeader}>
              <button
                className={styles.lightboxBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  // Mock download
                  window.open(imageUrl, '_blank');
                }}
              >
                <Download size={20} />
              </button>
              <button
                className={styles.lightboxBtn}
                onClick={() => setShowLightbox(false)}
              >
                <X size={20} />
              </button>
            </div>

            <motion.img
              src={imageUrl}
              alt="Full size"
              className={styles.lightboxImage}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
