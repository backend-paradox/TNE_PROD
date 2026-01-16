import { motion } from 'framer-motion';
import { X, Crown, MessageCircle, MoreHorizontal, Search } from 'lucide-react';
import { useState } from 'react';
import styles from './MemberPanel.module.css';
import { applyAvatarFallback, fallbackAvatarDataUrl } from '@/utils/travellers';

export interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  isAdmin?: boolean;
  lastSeen?: string;
}

interface MemberPanelProps {
  members: GroupMember[];
  groupName: string;
  onClose: () => void;
  onMessageMember?: (member: GroupMember) => void;
}

export function MemberPanel({ members, groupName, onClose, onMessageMember }: MemberPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const onlineMembers = members.filter((m) => m.online);
  const offlineMembers = members.filter((m) => !m.online);

  const filterMembers = (memberList: GroupMember[]) => {
    if (!searchQuery.trim()) return memberList;
    return memberList.filter((m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const renderMember = (member: GroupMember) => (
    <motion.div
      key={member.id}
      className={styles.memberItem}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className={styles.memberInfo}>
        <div className={styles.avatarWrapper}>
          <img
            src={member.avatar || fallbackAvatarDataUrl}
            alt={member.name}
            className={styles.avatar}
            onError={applyAvatarFallback}
          />
          <div className={`${styles.statusDot} ${member.online ? styles.online : styles.offline}`} />
        </div>
        <div className={styles.memberDetails}>
          <div className={styles.memberName}>
            {member.name}
            {member.isAdmin && (
              <span className={styles.adminBadge}>
                <Crown size={12} />
                Admin
              </span>
            )}
          </div>
          <span className={styles.memberStatus}>
            {member.online ? 'Online' : member.lastSeen || 'Offline'}
          </span>
        </div>
      </div>

      <div className={styles.memberActions}>
        <button
          className={styles.actionBtn}
          onClick={() => onMessageMember?.(member)}
          title="Send Message"
        >
          <MessageCircle size={16} />
        </button>
        <button className={styles.actionBtn} title="More">
          <MoreHorizontal size={16} />
        </button>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      className={styles.panel}
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h3 className={styles.title}>Group Members</h3>
          <span className={styles.memberCount}>
            {members.length} members | {onlineMembers.length} online
          </span>
        </div>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      {/* Search */}
      <div className={styles.searchWrapper}>
        <Search size={18} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Member Lists */}
      <div className={styles.memberLists}>
        {/* Online Members */}
        {filterMembers(onlineMembers).length > 0 && (
          <div className={styles.memberSection}>
            <h4 className={styles.sectionTitle}>
              <span className={`${styles.sectionDot} ${styles.online}`} />
              Online | {filterMembers(onlineMembers).length}
            </h4>
            <div className={styles.memberList}>
              {filterMembers(onlineMembers).map(renderMember)}
            </div>
          </div>
        )}

        {/* Offline Members */}
        {filterMembers(offlineMembers).length > 0 && (
          <div className={styles.memberSection}>
            <h4 className={styles.sectionTitle}>
              <span className={`${styles.sectionDot} ${styles.offline}`} />
              Offline | {filterMembers(offlineMembers).length}
            </h4>
            <div className={styles.memberList}>
              {filterMembers(offlineMembers).map(renderMember)}
            </div>
          </div>
        )}

        {/* No Results */}
        {filterMembers(members).length === 0 && searchQuery && (
          <div className={styles.noResults}>
            <p>No members found</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
