import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, IndianRupee, Clock, TrendingUp, ArrowUpRight, ArrowDownRight, ChevronDown, Receipt, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AddExpenseModal } from '@/components/travellers/expenses';
import { EmptyState } from '@/components/travellers/common';
import type { ExpenseFormData, Group } from '@/types/travellers';
import { useGroups, useExpenses } from '@/hooks/travellers';
import { expensesAPI, groupsAPI } from '@/features/travellers/travellersAPI';
import { normalizeDestination } from '@/utils/travellers';
import styles from './ExpensesPage.module.css';

interface Member {
  id: string;
  name: string;
  avatar: string;
  balance: number;
}

interface ExpenseSummary {
  totalExpenses: number;
  expenseCount: number;
  myBalance: { paid: number; owes: number; balance: number };
  memberBalances: Record<string, { paid: number; owes: number; balance: number }>;
}

const getCurrentUserId = (): string | null => {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return String(payload.id);
  } catch {
    return null;
  }
};

const formatDate = (value?: string) => {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatCategoryLabel = (category: string) =>
  (category || 'Other')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const toNumber = (value: number | string | null | undefined): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const formatAmount = (value: number | string | null | undefined): string => {
  const numeric = toNumber(value);
  const hasDecimals = !Number.isInteger(numeric);
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: hasDecimals ? 2 : 0,
  }).format(numeric);
};

const currencySymbol = '\u20B9';

const isDestinationPollQuestion = (question?: string) => {
  if (!question) return false;
  const normalized = question.trim().toLowerCase();
  return (
    normalized.includes('destination') ||
    normalized.includes('where should we go') ||
    normalized.includes('where to go') ||
    normalized.includes('where do we go')
  );
};

export function ExpensesPage() {
  const { groups, isLoading: groupsLoading, error: groupsError, fetchGroups } = useGroups();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const { expenses, isLoading: expensesLoading, error: expensesError, fetchExpenses, addExpense } = useExpenses(
    selectedGroupId || undefined
  );
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [rawMembers, setRawMembers] = useState<any[]>([]);
  const [showTripDropdown, setShowTripDropdown] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [pollDestinations, setPollDestinations] = useState<Record<string, string>>({});
  const [pollHasVotes, setPollHasVotes] = useState<Record<string, boolean>>({});
  const fetchedPollGroupsRef = useRef(new Set<string>());

  const currentUserId = getCurrentUserId();

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    if (!selectedGroupId && groups.length > 0) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId]);

  useEffect(() => {
    if (!selectedGroupId) return;

    fetchExpenses();

    const loadSummary = async () => {
      setSummaryLoading(true);
      try {
        const result = await expensesAPI.getExpenseSummary(selectedGroupId);
        setSummary(result);
      } catch (err) {
        console.error('Failed to fetch expense summary:', err);
      } finally {
        setSummaryLoading(false);
      }
    };

    const loadMembers = async () => {
      try {
        const data = await groupsAPI.getGroupMembers(selectedGroupId);
        const membersArray = Array.isArray(data) ? data : (data?.members || []);
        setRawMembers(membersArray);
      } catch (err) {
        console.error('Failed to fetch group members:', err);
        setRawMembers([]);
      }
    };

    loadSummary();
    loadMembers();
  }, [selectedGroupId, fetchExpenses]);

  useEffect(() => {
    let isActive = true;
    const pendingGroups = groups.filter(
      (group) => !fetchedPollGroupsRef.current.has(group.id)
    );

    if (pendingGroups.length === 0) return;

    pendingGroups.forEach((group) => fetchedPollGroupsRef.current.add(group.id));

    const loadPollDestinations = async () => {
      const updates: Record<string, string> = {};
      const voteFlags: Record<string, boolean> = {};

      await Promise.all(
        pendingGroups.map(async (group) => {
          try {
            const polls = await groupsAPI.getPolls(group.id);
            const poll = polls.find((item) => isDestinationPollQuestion(item.question));
            if (!poll || !Array.isArray(poll.options) || poll.options.length === 0) return;

            const shouldSuggestLabel = !normalizeDestination(group.destination);
            const options = poll.options
              .map((option) => ({
                label: normalizeDestination(option.text) || option.text || '',
                votes: option.voteCount || 0,
              }))
              .filter((option) => option.label);

            if (options.length === 0) return;
            const maxVotes = Math.max(...options.map((option) => option.votes));
            if (!Number.isFinite(maxVotes)) return;

            if (maxVotes === 0) {
              voteFlags[group.id] = false;
              if (shouldSuggestLabel) {
                updates[group.id] = options[0].label;
              }
              return;
            }

            voteFlags[group.id] = true;
            const winners = options
              .filter((option) => option.votes === maxVotes)
              .map((option) => option.label);
            if (winners.length === 0) return;

            if (shouldSuggestLabel) {
              updates[group.id] = winners.length > 1 ? `Tie: ${winners.join(', ')}` : winners[0];
            }
          } catch (err) {
            console.warn('Failed to fetch destination poll for group:', group.id, err);
          }
        })
      );

      if (!isActive) return;
      if (Object.keys(updates).length > 0) {
        setPollDestinations((prev) => ({ ...prev, ...updates }));
      }
      if (Object.keys(voteFlags).length > 0) {
        setPollHasVotes((prev) => ({ ...prev, ...voteFlags }));
      }
    };

    loadPollDestinations();

    return () => {
      isActive = false;
    };
  }, [groups]);

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId) || null,
    [groups, selectedGroupId]
  );
  const resolveDestinationLabel = (group: Group) => {
    const normalized = normalizeDestination(group.destination);
    if (normalized) return normalized;
    return pollDestinations[group.id] || 'Destination TBD';
  };
  const hasDestinationVote = selectedGroup
    ? Boolean(normalizeDestination(selectedGroup.destination)) || pollHasVotes[selectedGroup.id] === true
    : false;
  const ensureDestinationVote = () => {
    if (hasDestinationVote) return true;
    window.alert('Destination not selected yet. Please vote.');
    return false;
  };

  const members: Member[] = useMemo(() => {
    const balances = summary?.memberBalances || {};
    return rawMembers.map((member) => {
      const memberId = String(member.userId ?? member.id ?? '');
      const isCurrentUser = currentUserId && memberId === currentUserId;
      const balance = toNumber(balances[memberId]?.balance);
      return {
        id: memberId,
        name: member.name || member.user?.name || (isCurrentUser ? 'You' : `User ${memberId}`),
        avatar:
          member.avatar ||
          member.user?.avatar ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${memberId || 'user'}`,
        balance,
      };
    });
  }, [rawMembers, summary, currentUserId]);

  const totalSpent = summary
    ? toNumber(summary.totalExpenses)
    : expenses.reduce((sum, expense) => sum + toNumber(expense.amount), 0);
  const myBalance = toNumber(summary?.myBalance?.balance);
  const pendingAmount = myBalance < 0 ? Math.abs(myBalance) : 0;

  const expenseGroups = useMemo(() => {
    if (!selectedGroup) return [];
    return [
      {
        id: selectedGroup.id,
        name: selectedGroup.name,
        image: (selectedGroup as any).imageUrl,
        members: members.map((member) => ({
          id: member.id,
          name: member.name,
          avatar: member.avatar,
        })),
      },
    ];
  }, [selectedGroup, members]);

  const handleAddExpense = async (expenseData: ExpenseFormData) => {
    try {
      await addExpense(expenseData);
      setIsAddExpenseOpen(false);
      await fetchExpenses();
      if (selectedGroupId) {
        const result = await expensesAPI.getExpenseSummary(selectedGroupId);
        setSummary(result);
      }
    } catch (err) {
      console.error('Failed to add expense:', err);
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      ACTIVITIES: '#ec4899',
      ATTRACTIONS: '#a855f7',
      FOOD: '#f59e0b',
      LODGING: '#3b82f6',
      ACCOMMODATION: '#3b82f6',
      TRANSPORT: '#10b981',
    };
    return colors[(category || '').toUpperCase()] || '#9333ea';
  };

  const getMemberName = (memberId?: string | number) => {
    if (!memberId) return 'Unknown';
    const match = members.find((m) => m.id === String(memberId));
    return match?.name || `User ${memberId}`;
  };

  if (groupsLoading) {
    return (
      <div className={styles.skeletonContainer}>
        {/* Header Skeleton */}
        <div className={styles.skeletonHeader}>
          <div className={styles.skeletonHeaderLeft}>
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonDropdown} />
          </div>
          <div className={styles.skeletonAddBtn} />
        </div>

        {/* Stats Grid Skeleton */}
        <div className={styles.skeletonStatsGrid}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.skeletonStatCard}>
              <div className={styles.skeletonStatIcon} />
              <div className={styles.skeletonStatContent}>
                <div className={styles.skeletonStatLabel} />
                <div className={styles.skeletonStatValue} />
              </div>
            </div>
          ))}
        </div>

        {/* Balances Section Skeleton */}
        <div className={styles.skeletonSection}>
          <div className={styles.skeletonSectionTitle} />
          <div className={styles.skeletonMembersGrid}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={styles.skeletonMemberCard}>
                <div className={styles.skeletonMemberAvatar} />
                <div className={styles.skeletonMemberName} />
                <div className={styles.skeletonMemberBalance} />
              </div>
            ))}
          </div>
        </div>

        {/* Expenses Section Skeleton */}
        <div className={styles.skeletonSection}>
          <div className={styles.skeletonSectionTitle} />
          <div className={styles.skeletonExpensesList}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.skeletonExpenseItem}>
                <div className={styles.skeletonExpenseInfo}>
                  <div className={styles.skeletonExpenseHeader}>
                    <div className={styles.skeletonExpenseDesc} />
                    <div className={styles.skeletonExpenseBadge} />
                  </div>
                  <div className={styles.skeletonExpenseMeta}>
                    <div className={styles.skeletonExpenseMetaItem} />
                    <div className={styles.skeletonExpenseMetaItem} />
                  </div>
                </div>
                <div className={styles.skeletonExpenseAmount} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (groupsError) {
    return (
      <motion.div className={styles.container} initial="hidden" animate="visible">
        <EmptyState
          icon={Receipt}
          title="Unable to load expenses"
          description={groupsError}
          actionLabel="Try Again"
          onAction={fetchGroups}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      className={styles.container}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className={styles.header} variants={itemVariants}>
        <div>
          <h1 className={styles.title}>Expense Tracker</h1>
          <div className={styles.tripSelector}>
            <button
              className={styles.tripDropdownBtn}
              onClick={() => setShowTripDropdown(!showTripDropdown)}
              disabled={!selectedGroup}
            >
              <span>{selectedGroup?.name || 'Select Group'}</span>
              <ChevronDown size={18} className={showTripDropdown ? styles.rotated : ''} />
            </button>
            {showTripDropdown && (
              <div className={styles.tripDropdown}>
                {groups.map((group: Group) => (
                  <button
                    key={group.id}
                    className={`${styles.tripOption} ${group.id === selectedGroupId ? styles.selected : ''}`}
                    onClick={() => {
                      setSelectedGroupId(group.id);
                      setShowTripDropdown(false);
                    }}
                  >
                    <span className={styles.tripName}>{group.name}</span>
                    <span className={styles.tripDest}>{resolveDestinationLabel(group)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <Button
          className={styles.addButton}
          onClick={() => {
            if (!ensureDestinationVote()) return;
            setIsAddExpenseOpen(true);
          }}
          disabled={!selectedGroup}
        >
          <Plus size={20} />
          Add Expense
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div className={styles.statsGrid} variants={containerVariants}>
        <motion.div className={`${styles.statCard} ${styles.totalCard}`} variants={itemVariants}>
          <div className={styles.statIcon}>
            <IndianRupee size={24} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Total Spent</p>
            <p className={styles.statValue}>{currencySymbol}{formatAmount(totalSpent)}</p>
          </div>
        </motion.div>

        <motion.div className={`${styles.statCard} ${styles.pendingCard}`} variants={itemVariants}>
          <div className={styles.statIcon}>
            <Clock size={24} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Pending</p>
            <p className={styles.statValue}>{currencySymbol}{formatAmount(pendingAmount)}</p>
          </div>
        </motion.div>

        <motion.div className={`${styles.statCard} ${styles.balanceCard}`} variants={itemVariants}>
          <div className={styles.statIcon}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Your Balance</p>
            <p className={styles.statValue}>{currencySymbol}{formatAmount(myBalance)}</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Group Balances */}
      <motion.div className={styles.balancesSection} variants={itemVariants}>
        <h2 className={styles.sectionTitle}>Group Balances</h2>
        {summaryLoading ? (
          <div className={styles.loadingState}>
            <p>Loading balances...</p>
          </div>
        ) : members.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No members found"
            description="Group members will appear here once the group is loaded."
          />
        ) : (
          <div className={styles.membersGrid}>
            {members.map((member) => (
              <div key={member.id} className={styles.memberCard}>
                <div className={styles.memberAvatar}>
                  <img src={member.avatar} alt={member.name} />
                </div>
                <p className={styles.memberName}>{member.name}</p>
                <div className={styles.memberBalance}>
                  {member.balance === 0 ? (
                    <span className={styles.settled}>Settled Up</span>
                  ) : member.balance > 0 ? (
                    <>
                      <ArrowDownRight size={16} className={styles.owedIcon} />
                      <span className={styles.owedAmount}>
                        Owed {currencySymbol}{formatAmount(Math.abs(member.balance))}
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowUpRight size={16} className={styles.owesIcon} />
                      <span className={styles.owesAmount}>
                        Owes {currencySymbol}{formatAmount(Math.abs(member.balance))}
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Recent Expenses */}
      <motion.div className={styles.expensesSection} variants={itemVariants}>
        <h2 className={styles.sectionTitle}>Recent Expenses</h2>
        {expensesLoading ? (
          <div className={styles.loadingState}>
            <p>Loading expenses...</p>
          </div>
        ) : expensesError ? (
          <EmptyState
            icon={Receipt}
            title="Failed to load expenses"
            description={expensesError}
          />
        ) : expenses.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No expenses yet"
            description="Start tracking your group expenses. Add your first expense to split costs with your travel group."
            actionLabel="Add First Expense"
            onAction={() => {
              if (!ensureDestinationVote()) return;
              setIsAddExpenseOpen(true);
            }}
          />
        ) : (
          <div className={styles.expensesList}>
            {expenses.map((expense, index) => (
              <motion.div
                key={expense.id}
                className={styles.expenseItem}
                variants={itemVariants}
                custom={index}
              >
                <div className={styles.expenseInfo}>
                  <div className={styles.expenseHeader}>
                    <h3 className={styles.expenseDescription}>{expense.description}</h3>
                    <Badge
                      className={styles.categoryBadge}
                      style={{ backgroundColor: getCategoryColor(expense.category) }}
                    >
                      {formatCategoryLabel(expense.category)}
                    </Badge>
                  </div>
                  <div className={styles.expenseMeta}>
                    <span className={styles.paidBy}>Paid by {getMemberName(expense.paidById || expense.paidBy)}</span>
                    <span className={styles.separator}>|</span>
                    <span className={styles.date}>{formatDate(expense.date)}</span>
                  </div>
                </div>
                <div className={styles.expenseActions}>
                  <p className={styles.expenseAmount}>{currencySymbol}{formatAmount(expense.amount)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onAddExpense={handleAddExpense}
        groups={expenseGroups}
        preSelectedGroupId={selectedGroupId || undefined}
      />
    </motion.div>
  );
}
