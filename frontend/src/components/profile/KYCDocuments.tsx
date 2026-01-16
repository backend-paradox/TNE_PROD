import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  CreditCard,
  FileText,
  Car,
  Vote,
  Plus,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchKYCDocuments, fetchKYCStatus } from '../../store/slices/profileSlice';
import { KYCDocument, KYCDocumentType } from '../../types';
import { KYCUploadModal } from './KYCUploadModal';
import styles from './ProfileComponents.module.css';

const documentIcons: Record<KYCDocumentType, React.ComponentType<any>> = {
  AADHAAR: CreditCard,
  PAN: FileText,
  PASSPORT: FileCheck,
  DRIVING_LICENSE: Car,
  VOTER_ID: Vote,
};

const documentColors: Record<KYCDocumentType, string> = {
  AADHAAR: styles.documentIconAadhaar,
  PAN: styles.documentIconPan,
  PASSPORT: styles.documentIconPassport,
  DRIVING_LICENSE: styles.documentIconLicense,
  VOTER_ID: styles.documentIconVoter,
};

const documentLabels: Record<KYCDocumentType, string> = {
  AADHAAR: 'Aadhaar Card',
  PAN: 'PAN Card',
  PASSPORT: 'Passport',
  DRIVING_LICENSE: 'Driving License',
  VOTER_ID: 'Voter ID',
};

const statusStyles: Record<string, string> = {
  VERIFIED: styles.statusVerified,
  PENDING: styles.statusPending,
  SUBMITTED: styles.statusSubmitted,
  REJECTED: styles.statusRejected,
};

const StatusIcon: Record<string, React.ComponentType<any>> = {
  VERIFIED: CheckCircle,
  PENDING: Clock,
  SUBMITTED: Clock,
  REJECTED: XCircle,
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export function KYCDocuments() {
  const dispatch = useAppDispatch();
  const { kycStatus, kycDocuments } = useAppSelector((state) => state.profile);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([dispatch(fetchKYCStatus()), dispatch(fetchKYCDocuments())]);
      setIsLoading(false);
    };
    loadData();
  }, [dispatch]);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ margin: '0 auto', color: '#0d9488' }} />
        <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading KYC documents...</p>
      </div>
    );
  }

  const completionPercentage = kycStatus
    ? Math.round((kycStatus.verified / Math.max(kycStatus.total, 2)) * 100)
    : 0;

  return (
    <div>
      {/* KYC Status Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem' }}>
              KYC Verification Status
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
              {kycStatus?.isComplete
                ? 'Your KYC is complete'
                : 'Complete your KYC for full access'}
            </p>
          </div>
          {kycStatus?.isComplete ? (
            <span className={`${styles.statusBadge} ${styles.statusVerified}`}>
              <CheckCircle className="w-4 h-4" />
              Verified
            </span>
          ) : (
            <span className={`${styles.statusBadge} ${styles.statusPending}`}>
              <Clock className="w-4 h-4" />
              Pending
            </span>
          )}
        </div>

        <div className={styles.progressWrapper}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${completionPercentage}%` }} />
          </div>
          <p className={styles.progressText}>{completionPercentage}% Complete</p>
        </div>

        {kycStatus && (
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22c55e' }}>{kycStatus.verified}</p>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Verified</p>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>{kycStatus.pending}</p>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Pending</p>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>{kycStatus.rejected}</p>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Rejected</p>
            </div>
          </div>
        )}
      </div>

      {/* Documents List */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>Your Documents</h3>
        <button onClick={() => setIsModalOpen(true)} className={styles.btnSave} style={{ padding: '0.5rem 1rem' }}>
          <Plus className="w-4 h-4" />
          Add Document
        </button>
      </div>

      {kycDocuments.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <FileCheck className="w-8 h-8" />
          </div>
          <p className={styles.emptyTitle}>No documents uploaded</p>
          <p className={styles.emptyText}>Upload your identity documents for verification.</p>
          <button onClick={() => setIsModalOpen(true)} className={styles.emptyButton}>
            <Plus className="w-4 h-4" />
            Upload Document
          </button>
        </div>
      ) : (
        <div>
          {kycDocuments.map((doc) => {
            const Icon = documentIcons[doc.documentType] || FileText;
            const StatusIconComponent = StatusIcon[doc.status] || Clock;
            const colorClass = documentColors[doc.documentType] || styles.documentIconAadhaar;
            const statusClass = statusStyles[doc.status] || styles.statusPending;

            return (
              <div key={doc.id} className={styles.documentCard}>
                <div className={`${styles.documentIcon} ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className={styles.documentInfo}>
                  <p className={styles.documentType}>{documentLabels[doc.documentType]}</p>
                  <p className={styles.documentNumber}>
                    {doc.documentNumber.replace(/(.{4})/g, '$1 ').trim()}
                  </p>
                  <p className={styles.documentDate}>Submitted on {formatDate(doc.submittedAt)}</p>
                  {doc.status === 'REJECTED' && doc.rejectionReason && (
                    <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                      <AlertCircle className="w-3 h-3" style={{ display: 'inline', marginRight: '0.25rem' }} />
                      {doc.rejectionReason}
                    </p>
                  )}
                </div>
                <span className={`${styles.statusBadge} ${statusClass}`}>
                  <StatusIconComponent className="w-3 h-3" />
                  {doc.status}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <KYCUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default KYCDocuments;
