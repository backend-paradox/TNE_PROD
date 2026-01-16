import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  IndianRupee,
  FileText,
  Tag,
  Users,
  Check,
  CheckCircle,
  Percent,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ExpenseFormData } from '@/types/travellers';
import styles from './AddExpenseModal.module.css';

// Re-export ExpenseFormData for backwards compatibility
export type { ExpenseFormData };

export interface ExpenseMember {
  id: string;
  name: string;
  avatar: string;
}

export interface ExpenseGroup {
  id: string;
  name: string;
  image?: string;
  members: ExpenseMember[];
}

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: ExpenseFormData) => void;
  groups: ExpenseGroup[];
  preSelectedGroupId?: string;
}

const categories = [
  { id: 'Activities', label: 'Activities', color: '#ec4899' },
  { id: 'Attractions', label: 'Attractions', color: '#a855f7' },
  { id: 'Food', label: 'Food', color: '#f59e0b' },
  { id: 'Lodging', label: 'Lodging', color: '#3b82f6' },
  { id: 'Transport', label: 'Transport', color: '#10b981' },
  { id: 'Shopping', label: 'Shopping', color: '#f43f5e' },
  { id: 'Other', label: 'Other', color: '#6b7280' },
];

const currencySymbol = '\u20B9';

export function AddExpenseModal({ isOpen, onClose, onAddExpense, groups, preSelectedGroupId }: AddExpenseModalProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [selectedGroupId, setSelectedGroupId] = useState(preSelectedGroupId || '');
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [category, setCategory] = useState('');
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});
  const [includedMembers, setIncludedMembers] = useState<string[]>([]);

  // Get selected group and its members
  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const members = selectedGroup?.members || [];

  // Reset member-related states when group changes
  useEffect(() => {
    setPaidBy('');
    setIncludedMembers([]);
    setCustomSplits({});
  }, [selectedGroupId]);

  // Set preselected group when modal opens
  useEffect(() => {
    if (isOpen && preSelectedGroupId) {
      setSelectedGroupId(preSelectedGroupId);
    }
  }, [isOpen, preSelectedGroupId]);

  const resetForm = () => {
    setStep('form');
    setSelectedGroupId(preSelectedGroupId || '');
    setShowGroupDropdown(false);
    setDescription('');
    setAmount('');
    setPaidBy('');
    setCategory('');
    setSplitType('equal');
    setCustomSplits({});
    setIncludedMembers([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    let splits: { memberId: string; amount: number }[] = [];

    if (splitType === 'equal') {
      const membersToSplit = includedMembers.length > 0 ? includedMembers : members.map(m => m.id);
      const splitAmount = numAmount / membersToSplit.length;
      splits = membersToSplit.map(memberId => ({
        memberId,
        amount: Math.round(splitAmount * 100) / 100,
      }));
    } else {
      splits = Object.entries(customSplits).map(([memberId, amt]) => ({
        memberId,
        amount: parseFloat(amt) || 0,
      }));
    }

    const expenseData: ExpenseFormData = {
      description,
      amount: numAmount,
      paidBy,
      category,
      splitType,
      splits,
      groupId: selectedGroupId,
      groupName: selectedGroup?.name || '',
    };

    onAddExpense(expenseData);
    setStep('success');
  };

  const toggleMemberInclusion = (memberId: string) => {
    setIncludedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleCustomSplitChange = (memberId: string, value: string) => {
    setCustomSplits(prev => ({
      ...prev,
      [memberId]: value,
    }));
  };

  const getEqualSplitAmount = () => {
    const numAmount = parseFloat(amount) || 0;
    const membersToSplit = includedMembers.length > 0 ? includedMembers.length : members.length;
    return (numAmount / membersToSplit).toFixed(2);
  };

  const getCustomSplitTotal = () => {
    return Object.values(customSplits).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  };

  const isFormValid = () => {
    if (!selectedGroupId || !description || !amount || !paidBy || !category) return false;
    if (splitType === 'custom') {
      const total = getCustomSplitTotal();
      return Math.abs(total - parseFloat(amount)) < 0.01;
    }
    return true;
  };

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroupId(groupId);
    setShowGroupDropdown(false);
  };

  if (!isOpen) return null;

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
          <button className={`btn btn-icon btn-ghost ${styles.closeBtn}`} onClick={handleClose}>
            <X size={20} />
          </button>

          {step === 'form' ? (
            <>
              <div className={styles.header}>
                <div className={styles.iconWrapper}>
                  <IndianRupee size={28} />
                </div>
                <h2 className={styles.title}>Add Expense</h2>
                <p className={styles.subtitle}>Track your group expenses easily</p>
              </div>

              <form className={styles.form} onSubmit={handleSubmit}>
                {/* Group Selector */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Select Group</label>
                  <div className={styles.groupSelector}>
                    <button
                      type="button"
                      className={styles.groupDropdownTrigger}
                      onClick={() => setShowGroupDropdown(!showGroupDropdown)}
                    >
                      {selectedGroup ? (
                        <div className={styles.selectedGroup}>
                          {selectedGroup.image ? (
                            <img src={selectedGroup.image} alt={selectedGroup.name} className={styles.groupImage} />
                          ) : (
                            <div className={styles.groupImagePlaceholder}>
                              <Users size={16} />
                            </div>
                          )}
                          <span className={styles.groupName}>{selectedGroup.name}</span>
                          <span className={styles.memberCount}>{selectedGroup.members.length} members</span>
                        </div>
                      ) : (
                        <span className={styles.groupPlaceholder}>Choose a group to split expense</span>
                      )}
                      <ChevronDown size={18} className={`${styles.dropdownIcon} ${showGroupDropdown ? styles.rotated : ''}`} />
                    </button>

                    {showGroupDropdown && (
                      <div className={styles.groupDropdown}>
                        {groups.map((group) => (
                          <button
                            key={group.id}
                            type="button"
                            className={`${styles.groupOption} ${selectedGroupId === group.id ? styles.selected : ''}`}
                            onClick={() => handleGroupSelect(group.id)}
                          >
                            {group.image ? (
                              <img src={group.image} alt={group.name} className={styles.groupImage} />
                            ) : (
                              <div className={styles.groupImagePlaceholder}>
                                <Users size={16} />
                              </div>
                            )}
                            <div className={styles.groupInfo}>
                              <span className={styles.groupName}>{group.name}</span>
                              <span className={styles.memberCount}>{group.members.length} members</span>
                            </div>
                            {selectedGroupId === group.id && <Check size={16} className={styles.checkIcon} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Description</label>
                  <div className={styles.inputWrapper}>
                    <FileText size={18} className={styles.inputIcon} />
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="e.g., Dinner at restaurant"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Amount */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Amount ({currencySymbol})</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.rupeeIcon}>{currencySymbol}</span>
                    <input
                      type="number"
                      className={styles.input}
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                {/* Paid By */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Paid By</label>
                  <div className={styles.memberSelect}>
                    {members.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        className={`${styles.memberOption} ${paidBy === member.id ? styles.selected : ''}`}
                        onClick={() => setPaidBy(member.id)}
                      >
                        <img src={member.avatar} alt={member.name} className={styles.memberAvatar} />
                        <span>{member.name}</span>
                        {paidBy === member.id && <Check size={16} className={styles.checkIcon} />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Category</label>
                  <div className={styles.categoryGrid}>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        className={`${styles.categoryOption} ${category === cat.id ? styles.selected : ''}`}
                        style={{ '--cat-color': cat.color } as React.CSSProperties}
                        onClick={() => setCategory(cat.id)}
                      >
                        <Tag size={14} />
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Split Type */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Split Type</label>
                  <div className={styles.splitToggle}>
                    <button
                      type="button"
                      className={`${styles.splitOption} ${splitType === 'equal' ? styles.active : ''}`}
                      onClick={() => setSplitType('equal')}
                    >
                      <Users size={16} />
                      Split Equally
                    </button>
                    <button
                      type="button"
                      className={`${styles.splitOption} ${splitType === 'custom' ? styles.active : ''}`}
                      onClick={() => setSplitType('custom')}
                    >
                      <Percent size={16} />
                      Custom Split
                    </button>
                  </div>
                </div>

                {/* Split Details */}
                {splitType === 'equal' ? (
                  <div className={styles.equalSplit}>
                    <p className={styles.splitInfo}>
                      Each person pays: <strong>{currencySymbol}{getEqualSplitAmount()}</strong>
                    </p>
                    <div className={styles.memberCheckboxes}>
                      {members.map((member) => {
                        const isIncluded = includedMembers.length === 0 || includedMembers.includes(member.id);
                        return (
                          <label key={member.id} className={styles.memberCheckbox}>
                            <input
                              type="checkbox"
                              checked={isIncluded}
                              onChange={() => toggleMemberInclusion(member.id)}
                            />
                            <img src={member.avatar} alt={member.name} />
                            <span>{member.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className={styles.customSplit}>
                    <div className={styles.splitHeader}>
                      <span>Member</span>
                      <span>Amount</span>
                    </div>
                    {members.map((member) => (
                      <div key={member.id} className={styles.splitRow}>
                        <div className={styles.splitMember}>
                          <img src={member.avatar} alt={member.name} />
                          <span>{member.name}</span>
                        </div>
                        <div className={styles.splitInput}>
                          <span>{currencySymbol}</span>
                          <input
                            type="number"
                            placeholder="0.00"
                            value={customSplits[member.id] || ''}
                            onChange={(e) => handleCustomSplitChange(member.id, e.target.value)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    ))}
                    <div className={styles.splitTotal}>
                      <span>Total:</span>
                      <span className={Math.abs(getCustomSplitTotal() - parseFloat(amount || '0')) < 0.01 ? styles.valid : styles.invalid}>
                        {currencySymbol}{getCustomSplitTotal().toFixed(2)} / {currencySymbol}{parseFloat(amount || '0').toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={!isFormValid()}
                >
                  Add Expense
                </Button>
              </form>
            </>
          ) : (
            <div className={styles.successContent}>
              <div className={styles.successHeader}>
                <div className={styles.successIcon}>
                  <CheckCircle size={32} />
                </div>
                <h2 className={styles.title}>Expense Added!</h2>
                <p className={styles.subtitle}>
                  {currencySymbol}{parseFloat(amount).toFixed(2)} has been added to the group expenses
                </p>
              </div>

              <div className={styles.successDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Group</span>
                  <span className={styles.detailValue}>{selectedGroup?.name}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Description</span>
                  <span className={styles.detailValue}>{description}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Amount</span>
                  <span className={styles.detailValue}>{currencySymbol}{parseFloat(amount).toFixed(2)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Paid By</span>
                  <span className={styles.detailValue}>
                    {members.find(m => m.id === paidBy)?.name || paidBy}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Category</span>
                  <span className={styles.detailValue}>{category}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Split</span>
                  <span className={styles.detailValue}>
                    {splitType === 'equal' ? `Split Equally (${members.length} members)` : 'Custom Split'}
                  </span>
                </div>
              </div>

              <Button className="btn btn-primary btn-block" onClick={handleClose}>
                Done
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
