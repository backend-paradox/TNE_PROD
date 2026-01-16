import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import styles from './ProfileComponents.module.css';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  isLoading?: boolean;
}

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading = false,
}: DeleteConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

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
            className={styles.confirmDialog}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className={styles.closeButtonSmall}>
              <X className="w-4 h-4" />
            </button>

            <div className={styles.confirmIcon}>
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className={styles.confirmTitle}>{title}</h3>
            <p className={styles.confirmDescription}>{description}</p>

            <div className={styles.confirmActions}>
              <button onClick={onClose} className={styles.btnCancel} disabled={isLoading}>
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={styles.btnDelete}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default DeleteConfirmDialog;
