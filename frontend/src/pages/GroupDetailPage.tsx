import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useGroups, useExpenses, useChat } from '@/hooks/travellers';
import { socketService } from '@/services/socket.service';
import { groupsAPI } from '@/features/travellers/travellersAPI';
import type { Poll, PollOption } from '@/types/travellers';
import { applyAvatarFallback, fallbackAvatarDataUrl, formatCurrency, normalizeDestination } from '@/utils/travellers';
import {
  ArrowLeft,
  MapPin,
  Users,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Plus,
  CheckCircle,
  Settings,
  MessageCircle,
  X,
  Minus,
  Maximize2,
  UserPlus,
  LogOut,
  MoreVertical,
  UserCog,
  UserMinus,
  Shield,
  Wallet,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  TrendingUp,
  Edit3,
  Vote,
  Trophy,
  ListOrdered,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { ChatWindow } from '@/components/travellers/chat/ChatWindow';
import { AddProposalModal, InviteModal } from '@/components/travellers/groups';
import { AddExpenseModal } from '@/components/travellers/expenses';
import type { ChatMessage, GroupMember, ProposalFormData, ExpenseFormData } from '@/types/travellers';
import styles from './GroupDetailPage.module.css';

// Local Group interface for UI display (transformed from API response)
interface Group {
  id: string;
  name: string;
  destination: string;
  description: string;
  image: string;
  memberCount: number;
  onlineCount: number;
  startDate: string;
  endDate: string;
  budget: string;
  status: 'active' | 'planning' | 'completed';
  members: GroupMember[];
}

// Note: Removed Proposal interface - now using Poll from types
// Note: Removed GroupExpense interface - now using Expense from types

interface MemberBalance {
  id: string;
  name: string;
  avatar: string;
  balance: number;
}

interface GroupSettingsDraft {
  name: string;
  description: string;
  destination: string;
  budget: string;
  currency: string;
  startDate: string;
  endDate: string;
  status: 'PLANNING' | 'ON_TOUR' | 'COMPLETED';
  type: 'PUBLIC' | 'PRIVATE';
  maxMembers: string;
  imageUrl: string;
}

const COVER_IMAGE_OPTIONS = [
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519817650390-64a93db511aa?w=800&auto=format&fit=crop',
];

const MAX_COVER_BYTES = 2 * 1024 * 1024;
const STATUS_OPTIONS: Array<{ value: GroupSettingsDraft['status']; label: string }> = [
  { value: 'PLANNING', label: 'Planning' },
  { value: 'ON_TOUR', label: 'On Tour' },
  { value: 'COMPLETED', label: 'Completed' },
];
const VISIBILITY_OPTIONS: Array<{ value: GroupSettingsDraft['type']; label: string }> = [
  { value: 'PUBLIC', label: 'Public' },
  { value: 'PRIVATE', label: 'Private' },
];
const CURRENCY_OPTIONS = ['INR', 'USD', 'EUR', 'GBP', 'AUD'];
const resolveGroupVisibility = (value?: string): GroupSettingsDraft['type'] =>
  value === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE';
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

// Note: Mock data removed - now using real API data from useGroups hook

export function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { currentGroup, members, isLoading, error, fetchGroupDetails, updateGroup } = useGroups();
  const { expenses, fetchExpenses, addExpense } = useExpenses(groupId);

  // Initialize chat hook
  const {
    messages: chatMessages,
    members: chatMembers,
    typingUsers,
    isLoading: chatLoading,
    error: chatError,
    fetchMessages,
    fetchMembers,
    sendMessage,
    sendImageMessage,
    sendVoiceMessage,
    initializeConversation,
    setTypingStatus,
    addReaction,
    deleteMessage,
  } = useChat(groupId, currentGroup?.name);
  const [isAddProposalOpen, setIsAddProposalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [openMemberMenu, setOpenMemberMenu] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVotingOpen, setIsVotingOpen] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [isLoadingJoinRequests, setIsLoadingJoinRequests] = useState(false);
  const [joinRequestError, setJoinRequestError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [settingsDraft, setSettingsDraft] = useState<GroupSettingsDraft>({
    name: '',
    description: '',
    destination: '',
    budget: '',
    currency: 'INR',
    startDate: '',
    endDate: '',
    status: 'PLANNING',
    type: 'PRIVATE',
    maxMembers: '20',
    imageUrl: '',
  });
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
    confirmLabel?: string;
    confirmVariant?: 'default' | 'destructive';
  } | null>(null);
  const memberRetryRef = useRef<string | null>(null);

  // Fetch group details, expenses, and initialize chat on mount
  useEffect(() => {
    if (groupId) {
      fetchGroupDetails(groupId);
      fetchExpenses();
    }
  }, [groupId, fetchGroupDetails, fetchExpenses]);

  useEffect(() => {
    if (!groupId) return;
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    socketService.connect(token);
    socketService.joinPresence(groupId);

    const handlePresenceUpdate = (data: { groupId: string; onlineUserIds: Array<string | number> }) => {
      if (String(data.groupId) !== String(groupId)) return;
      const normalized = data.onlineUserIds.map((id) => String(id));
      setOnlineUserIds(normalized);
    };

    socketService.onPresenceUpdate(handlePresenceUpdate);

    return () => {
      socketService.leavePresence(groupId);
      socketService.offPresenceUpdate(handlePresenceUpdate);
    };
  }, [groupId]);

  // Track unread messages when chat is closed
  useEffect(() => {
    if (!groupId) return;

    const handleNewMessage = () => {
      // Only increment unread count if chat is closed
      if (!isChatOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    socketService.onNewMessage(handleNewMessage);

    return () => {
      socketService.offNewMessage(handleNewMessage);
    };
  }, [groupId, isChatOpen]);

  // Reset unread count when chat opens
  useEffect(() => {
    if (isChatOpen) {
      setUnreadCount(0);
    }
  }, [isChatOpen]);

  // Initialize chat conversation and fetch messages
  useEffect(() => {
    const initChat = async () => {
      if (groupId && currentGroup?.name) {
        await initializeConversation();
        await fetchMessages();
        await fetchMembers();
      }
    };
    initChat();
  }, [groupId, currentGroup?.name, initializeConversation, fetchMessages, fetchMembers]);

  useEffect(() => {
    if (!groupId || !currentGroup) return;
    const expectedCount = (currentGroup as any)?._count?.members || currentGroup.memberCount || 0;
    if (chatMembers.length > 0 || expectedCount === 0) {
      memberRetryRef.current = null;
      return;
    }
    if (memberRetryRef.current === groupId) return;
    memberRetryRef.current = groupId;

    const retryTimer = setTimeout(() => {
      fetchMembers();
      fetchGroupDetails(groupId);
    }, 800);

    return () => clearTimeout(retryTimer);
  }, [groupId, currentGroup, chatMembers.length, fetchMembers, fetchGroupDetails]);


  // Destination poll data (from API)
  const [destinationPoll, setDestinationPoll] = useState<Poll | null>(null);
  const [isLoadingPoll, setIsLoadingPoll] = useState(false);
  const [newDestination, setNewDestination] = useState('');
  const [pendingDestinations, setPendingDestinations] = useState<string[]>([]);
  // All polls (for proposals section)
  const [allPolls, setAllPolls] = useState<Poll[]>([]);
  const [isVotingOnPoll, setIsVotingOnPoll] = useState<string | null>(null);
  const proposalPolls = useMemo(
    () => allPolls.filter((poll) => !isDestinationPollQuestion(poll.question)),
    [allPolls]
  );

  // Fetch destination poll and all polls
  const fetchDestinationPoll = useCallback(async () => {
    if (!groupId) return;
    setIsLoadingPoll(true);
    try {
      const polls = await groupsAPI.getPolls(groupId);
      // Store all polls for proposals section
      setAllPolls(polls);
      // Find a destination poll (question indicates destination vote)
      const destPoll = polls.find((poll) => isDestinationPollQuestion(poll.question));
      setDestinationPoll(destPoll ?? null);
    } catch (err) {
      console.error('Failed to fetch polls:', err);
    } finally {
      setIsLoadingPoll(false);
    }
  }, [groupId]);

  // Fetch polls on mount
  useEffect(() => {
    if (groupId) {
      fetchDestinationPoll();
    }
  }, [groupId, fetchDestinationPoll]);

  // Create destination poll if none exists
  const createDestinationPoll = async (destinations: string[]) => {
    const cleaned = destinations
      .map((item) => item.trim())
      .filter(Boolean)
      .filter((item, idx, arr) => arr.findIndex((v) => v.toLowerCase() === item.toLowerCase()) === idx);

    if (!groupId || cleaned.length < 2) return;
    try {
      const newPoll = await groupsAPI.createPoll(groupId, {
        question: 'Where should we go?',
        type: 'SINGLE_CHOICE',
        options: cleaned,
      });
      setDestinationPoll(newPoll);
      setNewDestination(''); // Clear input after success
      setPendingDestinations([]);
      return newPoll;
    } catch (err) {
      console.error('Failed to create destination poll:', err);
      alert('Failed to create poll. Please try again.');
    }
  };

  // Helper to get destination votes in display format
  const getDestinationVotes = () => {
    if (!destinationPoll) return [];
    const totalVotes = destinationPoll.options.reduce((sum, opt) => sum + (opt.voteCount || 0), 0);
    return destinationPoll.options.map((opt) => ({
      id: opt.id,
      destination: opt.text,
      votes: opt.voteCount,
      percentage: opt.percentage ?? (totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 100) : 0),
    }));
  };

  // Get user's current vote
  const getUserVote = () => {
    if (!destinationPoll?.myVotes?.length) return null;
    return destinationPoll.myVotes[0];
  };

  // Expense data
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  // groupExpenses now comes from useExpenses hook as 'expenses'

  const formatGenderLabel = (gender?: string | null) => {
    if (!gender) return '';
    const normalized = String(gender).replace(/_/g, ' ').toLowerCase();
    return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Get members from useGroups or fallback to currentGroup.members
  const getMembersArray = () => {
    // First try members from useGroups (from getGroupMembers API)
    if (members.length > 0) {
      return members.map((m: any, idx: number) => ({
        id: m.id || String(idx),
        oddjobId: String(m.userId), // User ID for comparison with current user
        name: m.name || m.user?.name || m.nickname || `Member ${idx + 1}`,
        avatar: m.avatar || m.profilePicUrl || m.user?.profilePicUrl || m.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name || idx}`,
        gender: formatGenderLabel(m.gender || m.user?.gender),
        online: false,
        role: m.role?.toLowerCase() || 'member',
      }));
    }
    // Fallback to members from currentGroup (from getGroupDetails API)
    const groupMembers = (currentGroup as any)?.members;
    if (groupMembers && groupMembers.length > 0) {
      return groupMembers.map((m: any, idx: number) => ({
        id: m.id || String(idx),
        oddjobId: String(m.userId), // User ID for comparison with current user
        name: m.name || m.user?.name || m.nickname || `Member ${idx + 1}`,
        avatar: m.avatar || m.profilePicUrl || m.user?.profilePicUrl || m.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name || idx}`,
        gender: formatGenderLabel(m.gender || m.user?.gender),
        online: false,
        role: m.role?.toLowerCase() || 'member',
      }));
    }
  // Last resort fallback
  return [
    { id: '1', oddjobId: '1', name: 'You', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You', online: true, role: 'admin' },
  ];
  };

  const calculateEffectiveStatus = (groupData: typeof currentGroup): 'PLANNING' | 'ON_TOUR' | 'COMPLETED' => {
    if (!groupData) return 'PLANNING';

    const status = String(groupData.status || '').toUpperCase();
    const effectiveStart = (groupData as any).manualStartDate || groupData.startDate;
    const effectiveEnd = (groupData as any).manualEndDate || groupData.endDate;
    const now = new Date();

    if (status === 'ON_TOUR') {
      if (effectiveStart && effectiveEnd) {
        const start = new Date(effectiveStart);
        const end = new Date(effectiveEnd);
        if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
          if (now >= start && now <= end) return 'ON_TOUR';
          if (now > end) return 'COMPLETED';
          return 'PLANNING';
        }
      }
      return 'ON_TOUR';
    }

    if (status === 'COMPLETED') return 'COMPLETED';

    if (!effectiveStart || !effectiveEnd) return 'PLANNING';

    const start = new Date(effectiveStart);
    const end = new Date(effectiveEnd);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'PLANNING';
    if (now < start) return 'PLANNING';
    if (now <= end) return 'ON_TOUR';
    return 'COMPLETED';
  };

  // Transform API data to component format
  const calculatedStatus = useMemo(
    () => calculateEffectiveStatus(currentGroup),
    [currentGroup]
  );
  const rawStatus = currentGroup ? (currentGroup.calculatedStatus || calculatedStatus || currentGroup.status || 'PLANNING') : 'PLANNING';
  const statusMap: Record<string, 'active' | 'planning' | 'completed'> = {
    PLANNING: 'planning',
    ON_TOUR: 'active',
    COMPLETED: 'completed',
    planning: 'planning',
    active: 'active',
    completed: 'completed',
  };
  const calculatedStatusLabel =
    STATUS_OPTIONS.find((option) => option.value === calculatedStatus)?.label || 'Planning';

  const onlineSet = useMemo(() => new Set(onlineUserIds), [onlineUserIds]);
  const resolvedMembers = getMembersArray().map((member) => ({
    ...member,
    online: onlineSet.has(String((member as any).oddjobId ?? member.id)),
  }));
  const resolvedOnlineCount = resolvedMembers.filter((member) => member.online).length;
  const effectiveStartDate = (currentGroup as any)?.manualStartDate || currentGroup?.startDate;
  const effectiveEndDate = (currentGroup as any)?.manualEndDate || currentGroup?.endDate;
  const currencyCode = currentGroup?.currency || 'INR';
  const budgetValue = currentGroup?.budget;
  const parsedBudget = budgetValue !== null && budgetValue !== undefined ? Number(budgetValue) : null;
  const budgetLabel = Number.isFinite(parsedBudget)
    ? formatCurrency(parsedBudget, currencyCode)
    : 'Budget TBD';
  const group: Group | null = currentGroup ? {
    id: currentGroup.id,
    name: currentGroup.name,
    destination: normalizeDestination(currentGroup.destination),
    description: currentGroup.description || 'No description provided',
    image: (currentGroup as any).imageUrl || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop',
    memberCount: (currentGroup as any)._count?.members || members.length || (currentGroup as any)?.members?.length || 1,
    onlineCount: resolvedOnlineCount,
    startDate: effectiveStartDate ? new Date(effectiveStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD',
    endDate: effectiveEndDate ? new Date(effectiveEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD',
    budget: budgetLabel,
    status: statusMap[rawStatus] || 'planning',
    members: resolvedMembers,
    // Note: Proposals/polls are now fetched separately via allPolls state
  } : null;

  const chatRoster = useMemo(() => {
    if (!group) return [];
    if (chatMembers.length === 0) return group.members;

    const memberMap = new Map<string, GroupMember>();
    const getKey = (member: any) => String(member.userId ?? member.oddjobId ?? member.id);

    group.members.forEach((member) => {
      memberMap.set(getKey(member), member);
    });

    chatMembers.forEach((member) => {
      const key = getKey(member);
      const existing = memberMap.get(key);
      if (existing) {
        memberMap.set(key, {
          ...existing,
          ...member,
          name: member.name || existing.name,
          avatar: member.avatar || existing.avatar,
          online: existing.online,
          role: existing.role || member.role,
        });
      } else {
        memberMap.set(key, { ...member, online: onlineSet.has(key) });
      }
    });

    return Array.from(memberMap.values());
  }, [group, chatMembers, onlineSet]);

  const inviteCode = currentGroup?.inviteCode || '';
  const joinBaseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const inviteLink = inviteCode ? `${joinBaseUrl}/travellers/group-planning?code=${inviteCode}` : '';

  // Get actual user ID from JWT token
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

  const currentUserId = getCurrentUserId();
  // Match by oddjobId which contains the user's ID
  const currentUserRole = group?.members.find(m =>
    (m as any).oddjobId === currentUserId
  )?.role || 'member';

  const isOwner = currentUserRole?.toLowerCase() === 'owner';
  const isAdmin = ['owner', 'admin'].includes(currentUserRole?.toLowerCase() || '');
  const toDateInputValue = (value?: string | Date | null) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
  };

  const buildSettingsDraft = (groupData: typeof currentGroup): GroupSettingsDraft => ({
    name: groupData?.name || '',
    description: groupData?.description || '',
    destination: groupData?.destination || '',
    budget: groupData?.budget !== null && groupData?.budget !== undefined
      ? String(groupData.budget)
      : '',
    currency: groupData?.currency || 'INR',
    startDate: toDateInputValue((groupData as any)?.manualStartDate || groupData?.startDate),
    endDate: toDateInputValue((groupData as any)?.manualEndDate || groupData?.endDate),
    status: (groupData?.status || 'PLANNING') as GroupSettingsDraft['status'],
    type: resolveGroupVisibility((groupData as any)?.type),
    maxMembers: groupData?.maxMembers ? String(groupData.maxMembers) : '20',
    imageUrl: (groupData as any)?.imageUrl || '',
  });

  useEffect(() => {
    if (!isSettingsOpen || !currentGroup) return;
    setIsEditingSettings(false);
    setSettingsDraft(buildSettingsDraft(currentGroup));
    setCoverError(null);
    setSettingsError(null);
    setShowCoverPicker(false);
  }, [isSettingsOpen, currentGroup]);

  const hasSettingsChanges = useMemo(() => {
    if (!currentGroup) return false;

    const normalizeValue = (value?: string | null) => (value || '').trim().toLowerCase();
    const currentStartInput = toDateInputValue((currentGroup as any)?.manualStartDate || currentGroup.startDate);
    const currentEndInput = toDateInputValue((currentGroup as any)?.manualEndDate || currentGroup.endDate);
    const currentBudgetValue = currentGroup.budget !== null && currentGroup.budget !== undefined
      ? Number(currentGroup.budget)
      : null;
    const draftBudgetValue = settingsDraft.budget.trim() ? Number(settingsDraft.budget) : null;
    let budgetChanged = false;
    if (draftBudgetValue === null) {
      budgetChanged = currentBudgetValue !== null && currentBudgetValue !== undefined;
    } else if (Number.isFinite(draftBudgetValue)) {
      budgetChanged = !Number.isFinite(currentBudgetValue ?? NaN) || draftBudgetValue !== Number(currentBudgetValue);
    }

    return (
      settingsDraft.name.trim() !== (currentGroup.name || '').trim() ||
      settingsDraft.description.trim() !== (currentGroup.description || '').trim() ||
      normalizeValue(settingsDraft.destination) !== normalizeValue(currentGroup.destination) ||
      settingsDraft.startDate !== currentStartInput ||
      settingsDraft.endDate !== currentEndInput ||
      settingsDraft.status !== (currentGroup.status || 'PLANNING') ||
      settingsDraft.type !== resolveGroupVisibility((currentGroup as any)?.type) ||
      settingsDraft.currency !== (currentGroup.currency || 'INR') ||
      Number(settingsDraft.maxMembers || 0) !== Number(currentGroup.maxMembers || 20) ||
      budgetChanged ||
      (settingsDraft.imageUrl || '') !== ((currentGroup as any)?.imageUrl || '')
    );
  }, [currentGroup, settingsDraft]);

  const fetchJoinRequests = useCallback(async () => {
    if (!groupId) return;
    setIsLoadingJoinRequests(true);
    setJoinRequestError(null);
    try {
      const data = await groupsAPI.getJoinRequests(groupId);
      const requests = Array.isArray(data) ? data : (data?.requests || []);
      setJoinRequests(requests);
    } catch (error) {
      console.error('Failed to fetch join requests:', error);
      setJoinRequestError('Failed to load join requests');
    } finally {
      setIsLoadingJoinRequests(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (!isSettingsOpen || !isAdmin) return;
    fetchJoinRequests();
  }, [isSettingsOpen, isAdmin, fetchJoinRequests]);

  const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCoverError(null);
    if (!file.type.startsWith('image/')) {
      setCoverError('Please select an image file.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_COVER_BYTES) {
      setCoverError('Image must be 2MB or smaller.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setSettingsDraft((prev) => ({ ...prev, imageUrl: result }));
        setShowCoverPicker(false);
      } else {
        setCoverError('Failed to read image file.');
      }
    };
    reader.onerror = () => setCoverError('Failed to read image file.');
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleCoverSelect = (url: string) => {
    setSettingsDraft((prev) => ({ ...prev, imageUrl: url }));
    setShowCoverPicker(false);
    setCoverError(null);
  };

  const handleCancelSettingsEdit = () => {
    if (!currentGroup) return;
    setSettingsDraft(buildSettingsDraft(currentGroup));
    setCoverError(null);
    setSettingsError(null);
    setShowCoverPicker(false);
    setIsEditingSettings(false);
  };

  const handleSaveSettings = async () => {
    if (!currentGroup) return;
    setIsSavingSettings(true);
    setSettingsError(null);

    const normalizeValue = (value?: string | null) => (value || '').trim().toLowerCase();
    const trimmedName = settingsDraft.name.trim();
    const trimmedDescription = settingsDraft.description.trim();
    const trimmedDestination = settingsDraft.destination.trim();
    const currentStatus = (currentGroup.status || 'PLANNING') as GroupSettingsDraft['status'];
    const requiresDates = settingsDraft.status === 'ON_TOUR' || settingsDraft.status === 'COMPLETED';
    const startDateValue = settingsDraft.startDate;
    const endDateValue = settingsDraft.endDate;

    if (!trimmedName) {
      setSettingsError('Group name is required.');
      setIsSavingSettings(false);
      return;
    }

    if (requiresDates && (!startDateValue || !endDateValue)) {
      setSettingsError('Start and end dates are required for On Tour or Completed status.');
      setIsSavingSettings(false);
      return;
    }

    if (startDateValue && endDateValue) {
      const start = new Date(startDateValue);
      const end = new Date(endDateValue);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        setSettingsError('Please provide valid start and end dates.');
        setIsSavingSettings(false);
        return;
      }
      if (start > end) {
        setSettingsError('End date must be on or after the start date.');
        setIsSavingSettings(false);
        return;
      }
    }

    const maxMembersValue = Number(settingsDraft.maxMembers);
    if (!Number.isFinite(maxMembersValue) || maxMembersValue < 2 || maxMembersValue > 50) {
      setSettingsError('Max members must be between 2 and 50.');
      setIsSavingSettings(false);
      return;
    }

    const budgetInput = settingsDraft.budget.trim();
    const parsedBudget = budgetInput ? Number(budgetInput) : null;
    if (budgetInput && (!Number.isFinite(parsedBudget) || parsedBudget <= 0)) {
      setSettingsError('Budget must be a positive number.');
      setIsSavingSettings(false);
      return;
    }

    const destinationChanged = normalizeValue(trimmedDestination) !== normalizeValue(currentGroup.destination);
    if (destinationChanged && destinationPoll) {
      const confirmed = window.confirm('Changing the destination will clear the destination poll. Continue?');
      if (!confirmed) {
        setIsSavingSettings(false);
        return;
      }
    }

    const payload: Record<string, unknown> = {};
    const currentStartInput = toDateInputValue((currentGroup as any)?.manualStartDate || currentGroup.startDate);
    const currentEndInput = toDateInputValue((currentGroup as any)?.manualEndDate || currentGroup.endDate);
    const currentBudgetValue = currentGroup.budget !== null && currentGroup.budget !== undefined
      ? Number(currentGroup.budget)
      : null;
    const statusChanged = settingsDraft.status !== currentStatus;

    if (trimmedName !== (currentGroup.name || '').trim()) {
      payload.name = trimmedName;
    }

    if (trimmedDescription !== (currentGroup.description || '').trim()) {
      payload.description = trimmedDescription;
    }

    if (destinationChanged) {
      payload.destination = trimmedDestination;
    }

    if (settingsDraft.startDate && settingsDraft.startDate !== currentStartInput) {
      payload.startDate = settingsDraft.startDate;
    }

    if (settingsDraft.endDate && settingsDraft.endDate !== currentEndInput) {
      payload.endDate = settingsDraft.endDate;
    }

    if (parsedBudget !== null && Number.isFinite(parsedBudget)) {
      if (!Number.isFinite(currentBudgetValue ?? NaN) || parsedBudget !== Number(currentBudgetValue)) {
        payload.budget = parsedBudget;
      }
    } else if (currentBudgetValue !== null && currentBudgetValue !== undefined) {
      payload.budget = null;
    }

    if (settingsDraft.currency !== (currentGroup.currency || 'INR')) {
      payload.currency = settingsDraft.currency;
    }

    if (settingsDraft.type !== resolveGroupVisibility((currentGroup as any)?.type)) {
      payload.type = settingsDraft.type;
    }

    if (maxMembersValue !== Number(currentGroup.maxMembers || 20)) {
      payload.maxMembers = maxMembersValue;
    }

    if (settingsDraft.imageUrl && settingsDraft.imageUrl !== ((currentGroup as any).imageUrl || '')) {
      payload.imageUrl = settingsDraft.imageUrl;
    }

    if (statusChanged) {
      payload.status = settingsDraft.status;
    }

    if (statusChanged && settingsDraft.status === 'PLANNING') {
      payload.manualStartDate = null;
      payload.manualEndDate = null;
    } else if (requiresDates && (statusChanged || settingsDraft.startDate !== currentStartInput || settingsDraft.endDate !== currentEndInput)) {
      payload.manualStartDate = settingsDraft.startDate || null;
      payload.manualEndDate = settingsDraft.endDate || null;
    }

    if (Object.keys(payload).length === 0) {
      setIsSavingSettings(false);
      setIsEditingSettings(false);
      return;
    }

    try {
      await updateGroup(currentGroup.id, payload);
      await fetchGroupDetails(currentGroup.id);
      if (destinationChanged) {
        setDestinationPoll(null);
        setPendingDestinations([]);
        setNewDestination('');
        await fetchDestinationPoll();
      }
      setIsEditingSettings(false);
    } catch (err) {
      console.error('Failed to update group settings:', err);
      setSettingsError('Failed to update group settings. Please try again.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Debug logging for member menu visibility
  console.log('=== Member Menu Debug ===');
  console.log('Current User ID:', currentUserId, typeof currentUserId);
  console.log('Group Members:', JSON.stringify(group?.members, null, 2));
  console.log('Members oddjobIds:', JSON.stringify(group?.members?.map(m => ({ oddjobId: (m as any).oddjobId, role: m.role }))));
  console.log('Current User Role:', currentUserRole);
  console.log('========================');

  if (isLoading) {
    return (
      <div className={styles.skeletonContainer}>
        {/* Skeleton Header */}
        <div className={styles.skeletonHeader}>
          <div className={styles.skeletonBackBtn} />
        </div>

        {/* Skeleton Group Info */}
        <div className={styles.skeletonGroupInfo}>
          <div className={styles.skeletonGroupTop}>
            <div className={styles.skeletonGroupImage} />
            <div className={styles.skeletonGroupMainInfo}>
              <div className={styles.skeletonGroupTitle} />
              <div className={styles.skeletonGroupMeta}>
                <div className={styles.skeletonGroupMetaItem} />
                <div className={styles.skeletonGroupMetaItem} />
                <div className={styles.skeletonGroupMetaItem} />
              </div>
              <div className={styles.skeletonGroupDesc} />
            </div>
          </div>
          <div className={styles.skeletonQuickStats}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={styles.skeletonStatCard} />
            ))}
          </div>
        </div>

        {/* Skeleton Tabs */}
        <div className={styles.skeletonTabs}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={styles.skeletonTab} />
          ))}
        </div>

        {/* Skeleton Content */}
        <div className={styles.skeletonContent}>
          <div className={styles.skeletonContentRow}>
            <div className={styles.skeletonContentLine} />
            <div className={styles.skeletonContentLine} />
            <div className={styles.skeletonContentLine} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className={styles.notFound}>
        <h2>{error || 'Group not found'}</h2>
        <Button onClick={() => navigate('/travellers/group-planning')}>
          <ArrowLeft size={16} />
          Back to Groups
        </Button>
      </div>
    );
  }

  const handleSendMessage = async (
    content: string,
    type: 'text' | 'image' | 'voice' | 'location',
    replyToId?: string
  ) => {
    if (!content.trim()) return;

    try {
      await sendMessage(content, type, replyToId);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  const handleSendVoice = async (file: File, durationSeconds: number, replyToId?: string) => {
    try {
      await sendVoiceMessage(file, durationSeconds, replyToId);
    } catch (error) {
      console.error('Failed to send voice message:', error);
      toast.error('Failed to send voice message. Please try again.');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
      toast.success('Message deleted');
    } catch (error) {
      console.error('Failed to delete message:', error);
      toast.error('Failed to delete message. Please try again.');
    }
  };

  const handleAddProposal = async (proposalData: ProposalFormData) => {
    if (!groupId) return;
    try {
      // Create a poll with Yes/No options for the proposal
      await groupsAPI.createPoll(groupId, {
        question: proposalData.title,
        type: 'SINGLE_CHOICE',
        options: ['Yes, I approve', 'No, I disagree'],
      });
      setIsAddProposalOpen(false);
      // Refresh polls after adding
      fetchDestinationPoll();
    } catch (error) {
      console.error('Failed to add proposal:', error);
      alert('Failed to add proposal. Please try again.');
    }
  };

  const handleAddExpense = async (expenseData: ExpenseFormData) => {
    if (!groupId) return;
    try {
      await addExpense(expenseData);
      setIsAddExpenseOpen(false);
    } catch (error) {
      console.error('Failed to add expense:', error);
    }
  };

  // Calculate group expense totals
  const totalGroupExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const expensePerPerson = group ? Math.round(totalGroupExpenses / group.memberCount) : 0;

  // Calculate member balances
  const getMemberBalances = (): MemberBalance[] => {
    if (!group) return [];
    return group.members.map(member => {
      // Use oddjobId (user ID) for comparison, fallback to paidBy if paidById doesn't exist
      const memberUserId = (member as any).oddjobId || member.id;
      const paidAmount = expenses
        .filter(exp => {
          // Support both paidById and paidBy fields from API
          const expPaidById = (exp as any).paidById || exp.paidBy;
          return expPaidById === memberUserId || expPaidById === member.id;
        })
        .reduce((sum, exp) => sum + exp.amount, 0);
      const balance = paidAmount - expensePerPerson;
      return {
        id: member.id,
        name: member.name,
        avatar: member.avatar,
        balance,
      };
    });
  };

  const memberBalances = getMemberBalances();

  // Get expense groups for the modal
  const expenseGroups = group ? [{
    id: group.id,
    name: group.name,
    image: group.image,
    members: group.members
      .map(m => {
        const memberUserId = (m as any).oddjobId || (m as any).userId;
        const fallbackId = Number.isFinite(Number(m.id)) ? String(m.id) : String(memberUserId || '');
        const safeId = memberUserId ? String(memberUserId) : fallbackId;
        return { id: safeId, name: m.name, avatar: m.avatar };
      })
      .filter((member) => member.id),
  }] : [];

  const getCategoryColor = (category: string) => {
    const normalized = (category || '').trim().toUpperCase();
    const colors: Record<string, string> = {
      ACTIVITIES: '#ec4899',
      ATTRACTIONS: '#a855f7',
      FOOD: '#f59e0b',
      ACCOMMODATION: '#3b82f6',
      LODGING: '#3b82f6',
      TRANSPORT: '#10b981',
      SHOPPING: '#f43f5e',
      OTHER: '#6b7280',
      TIPS: '#6b7280',
    };
    return colors[normalized] || '#6b7280';
  };

  const formatExpenseCategoryLabel = (category: string) =>
    (category || 'Other')
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const getMemberNameByUserId = (userId?: string) => {
    if (!userId || !group) return userId || 'Unknown';
    const member = group.members.find(
      (m) => String((m as any).oddjobId || (m as any).userId || m.id) === String(userId)
    );
    return member?.name || `User ${userId}`;
  };

  const handleLeaveGroup = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Leave Group',
      message: `Are you sure you want to leave "${group.name}"? You won't be able to see group messages or activities.`,
      confirmLabel: 'Leave Group',
      action: async () => {
        try {
          await groupsAPI.leaveGroup(groupId!);
          navigate('/travellers/group-planning');
        } catch (error) {
          console.error('Failed to leave group:', error);
          alert('Failed to leave group. Please try again.');
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleDeleteGroup = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Group',
      message: `Delete "${group.name}" for everyone? This cannot be undone.`,
      confirmLabel: 'Delete Group',
      action: async () => {
        try {
          await groupsAPI.deleteGroup(groupId!);
          navigate('/travellers/group-planning');
        } catch (error) {
          console.error('Failed to delete group:', error);
          alert('Failed to delete group. Please try again.');
        } finally {
          setConfirmDialog(null);
        }
      },
    });
    };

    const handleJoinRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
      if (!groupId) return;
      try {
        await groupsAPI.handleJoinRequest(groupId, requestId, action);
        setJoinRequests((prev) => prev.filter((request) => request.id !== requestId));
        fetchGroupDetails(groupId);
      } catch (error) {
        console.error(`Failed to ${action} join request:`, error);
        alert(`Failed to ${action} request. Please try again.`);
      }
    };

  const handleRemoveMember = (memberUserId: string, memberName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Member',
      message: `Are you sure you want to remove ${memberName} from this group?`,
      action: async () => {
        try {
          await groupsAPI.removeMember(groupId!, memberUserId);
          // Refresh group details to update members list
          fetchGroupDetails(groupId!);
        } catch (error) {
          console.error('Failed to remove member:', error);
          alert('Failed to remove member. Please try again.');
        } finally {
          setConfirmDialog(null);
          setOpenMemberMenu(null);
        }
      },
    });
  };

  const handleMakeAdmin = async (memberUserId: string, memberName: string) => {
    try {
      await groupsAPI.updateMemberRole(groupId!, memberUserId, 'ADMIN');
      // Refresh group details to update members list
      fetchGroupDetails(groupId!);
      alert(`${memberName} is now an admin!`);
    } catch (error) {
      console.error('Failed to make admin:', error);
      alert('Failed to update member role. Please try again.');
    } finally {
      setOpenMemberMenu(null);
    }
  };

  const handleRemoveAdmin = (memberUserId: string, memberName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Admin',
      message: `Are you sure you want to remove admin privileges from ${memberName}?`,
      action: async () => {
        try {
          await groupsAPI.updateMemberRole(groupId!, memberUserId, 'MEMBER');
          // Refresh group details to update members list
          fetchGroupDetails(groupId!);
        } catch (error) {
          console.error('Failed to remove admin:', error);
          alert('Failed to update member role. Please try again.');
        } finally {
          setConfirmDialog(null);
          setOpenMemberMenu(null);
        }
      },
    });
  };

  const canManageMember = (memberUserId?: string) => {
    if (currentUserRole?.toLowerCase() !== 'owner') return false;
    return String(memberUserId || '') !== String(currentUserId || '');
  };

  const handleVoteDestination = async (optionId: string) => {
    if (!groupId || !destinationPoll) return;

    try {
      // Call API to vote
      const updatedPoll = await groupsAPI.voteOnPoll(groupId, destinationPoll.id, optionId);
      setDestinationPoll(updatedPoll);
    } catch (err) {
      console.error('Failed to vote:', err);
      alert('Failed to submit vote. Please try again.');
    }
  };

  // Vote on a poll (for proposals)
  const handleVoteOnPoll = async (pollId: string, optionId: string) => {
    if (!groupId) return;
    setIsVotingOnPoll(pollId);
    try {
      await groupsAPI.voteOnPoll(groupId, pollId, optionId);
      // Refresh polls after voting
      fetchDestinationPoll();
    } catch (err) {
      console.error('Failed to vote on poll:', err);
      alert('Failed to submit vote. Please try again.');
    } finally {
      setIsVotingOnPoll(null);
    }
  };

  const isDestinationPollLocked = Boolean(destinationPoll?.isClosed || destinationPoll?.isExpired);
  const MAX_DESTINATION_OPTIONS = 10;
  const destinationOptions = destinationPoll
    ? destinationPoll.options.map((opt) => opt.text)
    : pendingDestinations;
  const destinationOptionCount = destinationOptions.length;
  const trimmedDestination = newDestination.trim();
  const isDuplicateDestination = Boolean(trimmedDestination) && destinationOptions.some(
    (opt) => opt.trim().toLowerCase() === trimmedDestination.toLowerCase()
  );
  const isAtOptionLimit = destinationOptionCount >= MAX_DESTINATION_OPTIONS;
  const totalDestinationVotes = destinationPoll
    ? destinationPoll.options.reduce((sum, opt) => sum + (opt.voteCount || 0), 0)
    : 0;
  const canManageDestinationPoll = currentUserRole === 'owner' || currentUserRole === 'admin';
  const canCloseDestinationPoll = Boolean(destinationPoll && !isDestinationPollLocked && canManageDestinationPoll);

  // Add new destination option
  const handleAddDestination = async () => {
    if (!groupId || !newDestination.trim()) return;

    try {
      if (isDestinationPollLocked) {
        alert('This poll is closed. You cannot add new options.');
        return;
      }
      if (isAtOptionLimit) {
        alert(`You can add up to ${MAX_DESTINATION_OPTIONS} destinations.`);
        return;
      }
      if (isDuplicateDestination) {
        alert('This destination is already in the list.');
        return;
      }
      const destination = newDestination.trim();
      if (destinationPoll) {
        await groupsAPI.addPollOption(groupId, destinationPoll.id, destination);
        await fetchDestinationPoll();
        setNewDestination('');
        return;
      }

      if (!pendingDestinations.some((item) => item.toLowerCase() === destination.toLowerCase())) {
        setPendingDestinations((prev) => [...prev, destination]);
        setNewDestination('');
      }
    } catch (err) {
      console.error('Failed to add destination:', err);
      alert('Failed to add destination. Please try again.');
    }
  };

  const handleRemoveDestination = (optionId: string, optionLabel?: string) => {
    if (!groupId) return;

    // For pending destinations (not in poll yet) - show confirmation
    if (!destinationPoll) {
      setConfirmDialog({
        isOpen: true,
        title: 'Remove Destination',
        message: `Are you sure you want to remove "${optionLabel}" from the list?`,
        action: async () => {
          setPendingDestinations((prev) => prev.filter((item) => item !== optionLabel));
          setConfirmDialog(null);
        },
      });
      return;
    }

    // Validation checks before showing confirmation
    if (destinationPoll.isClosed || destinationPoll.isExpired) {
      alert('This poll is closed. You cannot remove options.');
      return;
    }
    if (destinationPoll.options.length <= 2) {
      alert('A poll must have at least 2 options.');
      return;
    }
    const optionMeta = destinationPoll.options.find((opt) => opt.id === optionId);
    if ((optionMeta?.voteCount || 0) > 0) {
      alert('Cannot remove an option that already has votes.');
      return;
    }

    // Show confirmation dialog for poll option removal
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Destination Option',
      message: `Are you sure you want to remove "${optionLabel}" from the poll?`,
      action: async () => {
        try {
          await groupsAPI.removePollOption(groupId, destinationPoll.id, optionId);
          await fetchDestinationPoll();
        } catch (err) {
          console.error('Failed to remove destination:', err);
          const errorMessage =
            (err as any)?.response?.data?.message || 'Failed to remove destination. Please try again.';
          alert(errorMessage);
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleResetDestinationPoll = async () => {
    if (!groupId || !destinationPoll) return;
    const confirmed = window.confirm('Reset destination poll? This will remove all options and votes.');
    if (!confirmed) return;
    try {
      await groupsAPI.deletePoll(groupId, destinationPoll.id);
      setDestinationPoll(null);
      setPendingDestinations([]);
      setNewDestination('');
      await fetchDestinationPoll();
    } catch (err) {
      console.error('Failed to reset destination poll:', err);
      const errorMessage =
        (err as any)?.response?.data?.message || 'Failed to reset destination poll. Please try again.';
      alert(errorMessage);
    }
  };

  const handleCloseDestinationPoll = async () => {
    if (!groupId || !destinationPoll) return;
    const confirmed = window.confirm('Close this poll? Voting and changes will be disabled.');
    if (!confirmed) return;
    try {
      await groupsAPI.closePoll(groupId, destinationPoll.id);
      await fetchDestinationPoll();
    } catch (err) {
      console.error('Failed to close destination poll:', err);
      const errorMessage =
        (err as any)?.response?.data?.message || 'Failed to close poll. Please try again.';
      alert(errorMessage);
    }
  };

  const getMostVotedDestination = () => {
    const votes = getDestinationVotes();
    if (votes.length === 0) {
      return { destinations: ['Destination TBD'], votes: 0, isTie: false };
    }
    const maxVotes = Math.max(...votes.map((item) => item.votes));
    const winners = votes.filter((item) => item.votes === maxVotes).map((item) => item.destination);
    return { destinations: winners, votes: maxVotes, isTie: winners.length > 1 };
  };

  const destinationWinner = getMostVotedDestination();
  const baseDestination = normalizeDestination(currentGroup?.destination);
  const destinationLabel = destinationWinner.votes === 0
    ? (baseDestination || 'Destination TBD')
    : destinationWinner.isTie
      ? `Tie: ${destinationWinner.destinations.join(', ')}`
      : destinationWinner.destinations[0];
  const destinationVotesLabel = destinationWinner.votes === 0
    ? ''
    : `(${destinationWinner.votes} votes)`;
  const hasDestinationVote = destinationWinner.votes > 0 || Boolean(baseDestination);
  const requireDestinationVote = (onAllowed?: () => void) => {
    if (hasDestinationVote) {
      if (onAllowed) onAllowed();
      return true;
    }
    setConfirmDialog({
      isOpen: true,
      title: 'Destination not selected',
      message: 'Destination not selected yet. Please vote.',
      confirmLabel: 'Vote Now',
      confirmVariant: 'default',
      action: () => {
        setConfirmDialog(null);
        setIsVotingOpen(true);
      },
    });
    return false;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className={styles.container}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className={styles.header} variants={itemVariants}>
        <Button
          variant="ghost"
          className={styles.backButton}
          onClick={() => navigate('/travellers/group-planning')}
        >
          <ArrowLeft size={20} />
          Back to Groups
        </Button>
      </motion.div>

      {/* Group Info Section - Modern Design */}
      <motion.div className={styles.groupInfoModern} variants={itemVariants}>
        <div className={styles.groupTopBar}>
          <div className={styles.groupHeader}>
            <div className={styles.groupIconWrapper}>
              {group.image ? (
                <img src={group.image} alt={group.name} className={styles.groupCoverImage} />
              ) : (
                <div className={styles.groupIcon}>
                  <Users size={32} />
                </div>
              )}
            </div>
            <div className={styles.groupMainInfo}>
              <div className={styles.groupTitleRow}>
                <h1 className={styles.groupName}>{group.name}</h1>
                <Badge
                  className={
                    group.status === 'active'
                      ? styles.activeBadge
                      : group.status === 'planning'
                      ? styles.planningBadge
                      : styles.completedBadge
                  }
                >
                  {group.status}
                </Badge>
              </div>
              <div className={styles.destinationRow}>
                <p className={styles.groupDestination}>
                  <MapPin size={16} />
                  {destinationLabel}
                </p>
                <button className={styles.voteButton} onClick={() => setIsVotingOpen(true)}>
                  Vote Destination
                </button>
              </div>
            </div>
          </div>
          <div className={styles.groupActions}>
            <Button
              variant="ghost"
              className={styles.inviteButtonModern}
              onClick={() => requireDestinationVote(() => setIsInviteModalOpen(true))}
            >
              <UserPlus size={20} />
              Invite
            </Button>
            <Button variant="ghost" className={styles.settingsButtonModern} onClick={() => setIsSettingsOpen(true)}>
              <Settings size={20} />
            </Button>
            {!isOwner && (
              <Button variant="ghost" className={styles.leaveButtonModern} onClick={handleLeaveGroup}>
                <LogOut size={20} />
              </Button>
            )}
          </div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <div className={styles.statIconCircle}>
              <Users size={20} />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statValue}>{group.memberCount}</p>
              <p className={styles.statLabel}>Members</p>
            </div>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <div className={styles.statIconCircle}>
              <Calendar size={20} />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statValue}>5 Days</p>
              <p className={styles.statLabel}>Duration</p>
            </div>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <div className={styles.statIconCircle}>
              <Wallet size={20} />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statValue}>{group.budget}</p>
              <p className={styles.statLabel}>Budget</p>
            </div>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <div className={styles.statIconCircle}>
              <MessageCircle size={20} />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statValue}>{group.onlineCount}</p>
              <p className={styles.statLabel}>Online Now</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content - Overview & Voting Combined */}
      <motion.div className={styles.mainContent} variants={itemVariants}>
        {/* Overview Section */}
        <Card className={styles.descriptionCard}>
          <h3 className={styles.sectionTitle}>About This Trip</h3>
          <p className={styles.description}>{group.description}</p>
        </Card>

        <Card className={styles.descriptionCard}>
          <h3 className={styles.sectionTitle}>Trip Details</h3>
          <div className={styles.detailsList}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Start Date:</span>
              <span className={styles.detailValue}>{group.startDate}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>End Date:</span>
              <span className={styles.detailValue}>{group.endDate}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Total Members:</span>
              <span className={styles.detailValue}>{group.memberCount} travelers</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Currently Online:</span>
              <span className={styles.detailValue}>{group.onlineCount} members</span>
            </div>
          </div>
        </Card>

        <Card className={styles.descriptionCard}>
          <h3 className={styles.sectionTitle}>Members</h3>
          <div className={styles.membersList}>
            {group.members.map((member) => (
              <div key={member.id} className={styles.memberItem}>
                  <div className={styles.memberAvatar}>
                    <img
                      src={member.avatar || fallbackAvatarDataUrl}
                      alt={member.name}
                      onError={applyAvatarFallback}
                    />
                    {member.online && <div className={styles.onlineIndicator} />}
                  </div>
                <div className={styles.memberInfo}>
                  <div className={styles.memberNameRow}>
                    <p className={styles.memberName}>{member.name}</p>
                    {(member.role === 'admin' || member.role === 'owner') && (
                      <Shield size={14} className={styles.adminBadge} />
                    )}
                  </div>
                  <p className={styles.memberRole}>
                    {member.role}
                    {member.gender ? ` | ${member.gender}` : ''}
                  </p>
                </div>
                {canManageMember((member as any).oddjobId) && (
                  <div className={styles.memberActions}>
                    <button
                      className={styles.memberMenuButton}
                      onClick={() => setOpenMemberMenu(openMemberMenu === member.id ? null : member.id)}
                    >
                      <MoreVertical size={18} />
                    </button>
                    {openMemberMenu === member.id && (
                      <div className={styles.memberMenu}>
                        {canManageMember((member as any).oddjobId) && (
                          <>
                            {member.role === 'member' && (
                              <button
                                className={styles.menuItem}
                              onClick={() => handleMakeAdmin((member as any).oddjobId || member.id, member.name)}
                              >
                                <UserCog size={16} />
                                Make Admin
                              </button>
                            )}
                            {member.role === 'admin' && currentUserRole === 'owner' && (
                              <button
                                className={styles.menuItem}
                              onClick={() => handleRemoveAdmin((member as any).oddjobId || member.id, member.name)}
                              >
                                <Shield size={16} />
                                Remove Admin
                              </button>
                            )}
                            <button
                              className={`${styles.menuItem} ${styles.menuItemDanger}`}
                              onClick={() => handleRemoveMember((member as any).oddjobId || member.id, member.name)}
                            >
                              <UserMinus size={16} />
                              Remove Member
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Group Expenses Section */}
        <Card className={styles.descriptionCard}>
          <div className={styles.expenseHeader}>
            <h3 className={styles.sectionTitle}>Group Expenses</h3>
            <Button className={styles.addExpenseBtn} onClick={() => requireDestinationVote(() => setIsAddExpenseOpen(true))}>
              <Plus size={18} />
              Add Expense
            </Button>
          </div>

          {/* Expense Stats */}
          <div className={styles.expenseStats}>
            <div className={styles.expenseStat}>
              <div className={styles.expenseStatIcon}>
                <Receipt size={20} />
              </div>
              <div className={styles.expenseStatContent}>
                <p className={styles.expenseStatValue}>{formatCurrency(totalGroupExpenses, currencyCode)}</p>
                <p className={styles.expenseStatLabel}>Total Expenses</p>
              </div>
            </div>
            <div className={styles.expenseStatDivider}></div>
            <div className={styles.expenseStat}>
              <div className={styles.expenseStatIcon}>
                <TrendingUp size={20} />
              </div>
              <div className={styles.expenseStatContent}>
                <p className={styles.expenseStatValue}>{formatCurrency(expensePerPerson, currencyCode)}</p>
                <p className={styles.expenseStatLabel}>Per Person</p>
              </div>
            </div>
          </div>

          {/* Member Balances */}
          <div className={styles.balancesSection}>
            <h4 className={styles.balancesTitle}>Member Balances</h4>
            <div className={styles.balancesGrid}>
              {memberBalances.map((member) => (
                <div key={member.id} className={styles.balanceCard}>
                  <img
                    src={member.avatar || fallbackAvatarDataUrl}
                    alt={member.name}
                    className={styles.balanceAvatar}
                    onError={applyAvatarFallback}
                  />
                  <div className={styles.balanceInfo}>
                    <p className={styles.balanceName}>{member.name}</p>
                    <p className={`${styles.balanceAmount} ${member.balance >= 0 ? styles.positive : styles.negative}`}>
                      {member.balance >= 0 ? (
                        <>
                          <ArrowUpRight size={14} />
                          Gets {formatCurrency(Math.abs(member.balance), currencyCode)}
                        </>
                      ) : (
                        <>
                          <ArrowDownRight size={14} />
                          Owes {formatCurrency(Math.abs(member.balance), currencyCode)}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Expenses */}
          <div className={styles.recentExpenses}>
            <h4 className={styles.recentExpensesTitle}>Recent Expenses</h4>
            <div className={styles.expensesList}>
              {expenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className={styles.expenseItem}>
                  <div className={styles.expenseItemLeft}>
                    <div
                      className={styles.expenseCategoryIcon}
                      style={{ background: getCategoryColor(expense.category) }}
                    >
                      <IndianRupee size={16} />
                    </div>
                    <div className={styles.expenseItemInfo}>
                      <p className={styles.expenseItemDescription}>{expense.description}</p>
                      <p className={styles.expenseItemMeta}>
                        Paid by {getMemberNameByUserId(expense.paidById || expense.paidBy)} | {expense.date}
                      </p>
                    </div>
                  </div>
                  <div className={styles.expenseItemRight}>
                    <p className={styles.expenseItemAmount}>{formatCurrency(expense.amount, currencyCode)}</p>
                    <Badge
                      className={styles.expenseCategoryBadge}
                      style={{ background: `${getCategoryColor(expense.category)}20`, color: getCategoryColor(expense.category) }}
                    >
                      {formatExpenseCategoryLabel(expense.category)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Voting Section */}
        <div className={styles.votingSection}>
          <div className={styles.votingHeader}>
            <div>
              <h3 className={styles.sectionTitle}>Vote on Destinations & Activities</h3>
              <p className={styles.sectionSubtitle}>Help decide where to go and what to do</p>
            </div>
            <Button onClick={() => requireDestinationVote(() => setIsAddProposalOpen(true))} className={styles.addProposalBtn}>
              <Plus size={18} />
              Add Proposal
            </Button>
          </div>

          <div className={styles.proposalsGrid}>
            {proposalPolls.length === 0 && !isLoadingPoll && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 24px', color: '#6b7280' }}>
                <p style={{ marginBottom: '8px' }}>No proposals yet.</p>
                <p style={{ fontSize: '14px' }}>Click "Add Proposal" to create one!</p>
              </div>
            )}
            {isLoadingPoll && proposalPolls.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 24px', color: '#6b7280' }}>
                Loading proposals...
              </div>
            )}
            {proposalPolls.map((poll) => {
              const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.voteCount || 0), 0);
              const yesOption = poll.options.find(opt => opt.text?.toLowerCase().includes('yes') || opt.text?.toLowerCase().includes('approve'));
              const noOption = poll.options.find(opt => opt.text?.toLowerCase().includes('no') || opt.text?.toLowerCase().includes('disagree'));
              const yesVotes = yesOption?.voteCount || 0;
              const noVotes = noOption?.voteCount || 0;
              const votePercentage = totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 0;
              const isVoting = isVotingOnPoll === poll.id;
              const hasVoted = poll.myVotes && poll.myVotes.length > 0;
              const pollStatus = poll.isClosed || poll.isExpired ? 'Closed' : 'Active';

              return (
                <Card key={poll.id} className={styles.proposalCard}>
                  <div className={styles.proposalContent} style={{ padding: '20px' }}>
                    <div className={styles.proposalHeader}>
                      <h4 className={styles.proposalTitle}>{poll.question}</h4>
                      <Badge style={{ marginTop: '8px' }}>{pollStatus}</Badge>
                    </div>

                    <div className={styles.voteProgress} style={{ marginTop: '16px' }}>
                      <div className={styles.voteStats}>
                        {poll.options.map((option) => {
                          const percentage =
                            option.percentage ?? (totalVotes > 0 ? Math.round(((option.voteCount || 0) / totalVotes) * 100) : 0);
                          return (
                          <span key={option.id} className={styles.voteStat}>
                            {option.text}: {option.voteCount || 0} ({percentage}%)
                          </span>
                        );
                      })}
                      </div>
                      <Progress value={votePercentage} className={styles.progressBar} />
                      <p className={styles.votePercentage}>{totalVotes} total votes</p>
                    </div>

                    <div className={styles.voteActions} style={{ marginTop: '16px' }}>
                      {poll.options.map((option) => {
                        const isYesLike = option.text?.toLowerCase().includes('yes') || option.text?.toLowerCase().includes('approve');
                        const userVotedThis = poll.myVotes?.includes(option.id);
                        return (
                          <Button
                            key={option.id}
                            className={isYesLike ? styles.voteYesBtn : styles.voteNoBtn}
                            variant={isYesLike ? 'default' : 'outline'}
                            disabled={isVoting || hasVoted}
                            onClick={() => handleVoteOnPoll(poll.id, option.id)}
                            style={userVotedThis ? { border: '2px solid #10b981' } : {}}
                          >
                            {isYesLike ? <ThumbsUp size={16} /> : <ThumbsDown size={16} />}
                            {option.text}
                            {userVotedThis && ' (voted)'}
                          </Button>
                        );
                      })}
                    </div>

                    {hasVoted && (
                      <p style={{ marginTop: '8px', fontSize: '12px', color: '#10b981' }}>
                        You have voted on this poll
                      </p>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Floating Chat Button */}
      {!isChatOpen && (
        <motion.button
          className={styles.chatFloatingButton}
          onClick={() => requireDestinationVote(() => setIsChatOpen(true))}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageCircle size={24} />
          {unreadCount > 0 && (
            <span className={styles.unreadBadge}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </motion.button>
      )}

      {/* Floating Chat Popup */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            className={`${styles.chatPopup} ${isChatMinimized ? styles.chatMinimized : ''}`}
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Chat Content */}
            <div className={styles.chatPopupContent}>
              {chatError && !isChatMinimized && (
                <div style={{ padding: '12px', background: '#fef2f2', color: '#dc2626', borderBottom: '1px solid #fecaca', fontSize: '14px' }}>
                  {chatError}
                </div>
              )}
              {chatLoading && !chatMessages.length && !isChatMinimized && (
                <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                  Loading chat...
                </div>
              )}
              <ChatWindow
                groupName={group.name}
                groupImage={group.image}
                groupDescription={group.description === 'No description provided' ? '' : group.description}
                members={chatRoster.length > 0 ? chatRoster : group.members}
                messages={chatMessages}
                typingUsers={typingUsers}
                showBackButton={false}
                isMinimized={isChatMinimized}
                onClose={() => setIsChatOpen(false)}
                onMinimize={() => setIsChatMinimized(!isChatMinimized)}
                onSendMessage={handleSendMessage}
                onSendImage={sendImageMessage}
                onSendVoice={handleSendVoice}
                onTyping={setTypingStatus}
                onReact={addReaction}
                onDeleteMessage={handleDeleteMessage}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Proposal Modal */}
      <AddProposalModal
        isOpen={isAddProposalOpen}
        onClose={() => setIsAddProposalOpen(false)}
        onAddProposal={handleAddProposal}
        tripName={group.name}
      />

      {/* Invite Modal */}
      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        groupId={group.id}
        tripName={group.name}
        memberCount={group.memberCount}
        duration="5 Days"
        inviteLink={inviteLink}
        inviteCode={inviteCode}
        members={group.members}
      />

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onAddExpense={handleAddExpense}
        groups={expenseGroups}
        preSelectedGroupId={group.id}
      />

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className={styles.confirmDialogOverlay} onClick={() => setConfirmDialog(null)}>
          <motion.div
            className={styles.dialogBox}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <h3 className={styles.dialogTitle}>{confirmDialog.title}</h3>
            <p className={styles.dialogMessage}>{confirmDialog.message}</p>
            <div className={styles.dialogActions}>
              <Button variant="outline" onClick={() => setConfirmDialog(null)}>
                Cancel
              </Button>
              <Button variant={confirmDialog.confirmVariant ?? 'destructive'} onClick={confirmDialog.action}>
                {confirmDialog.confirmLabel ?? 'Confirm'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Voting Modal */}
      <AnimatePresence>
        {isVotingOpen && (
          <div className={styles.dialogOverlay} onClick={() => setIsVotingOpen(false)}>
            <motion.div
              className={styles.votingModal}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className={styles.votingHeader}>
                <h3 className={styles.votingTitle}>
                  <Vote size={24} />
                  Vote for Destination
                </h3>
                <button className={styles.closeButton} onClick={() => setIsVotingOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              <p className={styles.votingSubtitle}>
                Choose your preferred destination. The most voted destination will be set as the group destination.
              </p>
              <div className={styles.votingMeta}>
                <div className={styles.votingMetaRow}>
                  <span className={styles.votingMetaItem}>
                    <Users size={14} />
                    Votes: {totalDestinationVotes} / {group.memberCount}
                  </span>
                  <span className={styles.votingMetaDivider} />
                  <span className={styles.votingMetaItem}>
                    <ListOrdered size={14} />
                    Options: {destinationOptionCount}/{MAX_DESTINATION_OPTIONS}
                  </span>
                  <div className={styles.votingMetaRight}>
                    {destinationPoll && (
                      <span className={`${styles.votingMetaBadge} ${isDestinationPollLocked ? styles.votingMetaBadgeClosed : ''}`}>
                        {isDestinationPollLocked ? 'Closed' : 'Open'}
                      </span>
                    )}
                    <span className={`${styles.votingWinnerInline} ${destinationWinner.votes === 0 ? styles.votingCurrentInline : ''}`}>
                      {destinationWinner.votes > 0 ? <Trophy size={14} /> : <MapPin size={14} />}
                      <span className={styles.votingWinnerLabel}>
                        {destinationWinner.votes > 0 ? 'Winner' : 'Current'}
                      </span>
                      <span className={styles.votingWinnerName}>{destinationLabel}</span>
                      {destinationVotesLabel && (
                        <span className={styles.votingWinnerVotes}>{destinationVotesLabel}</span>
                      )}
                    </span>
                  </div>
                </div>
                {isDestinationPollLocked && (
                  <div className={styles.pollClosedBanner}>
                    Poll closed. You can still view results.
                  </div>
                )}
                {destinationPoll && canManageDestinationPoll && (
                  <div className={styles.votingActionRow}>
                    <Button variant="outline" onClick={handleCloseDestinationPoll} disabled={!canCloseDestinationPoll}>
                      Close Poll
                    </Button>
                    <Button variant="destructive" onClick={handleResetDestinationPoll}>
                      Reset Poll
                    </Button>
                  </div>
                )}
              </div>

              {isLoadingPoll ? (
                <div className={styles.votingOptions}>
                  <div className={styles.votingEmptyState}>
                    <div className={styles.emptyStateIcon}>
                      <Vote size={32} />
                    </div>
                    <p>Loading poll...</p>
                  </div>
                </div>
              ) : !destinationPoll ? (
                <div className={styles.votingOptions}>
                  <div className={styles.votingEmptyState}>
                    <div className={styles.emptyStateIcon}>
                      <MapPin size={40} />
                    </div>
                    <h4>No Destination Poll Yet</h4>
                    <p>Add at least 2 destinations below to create a poll and let your group vote!</p>
                  </div>
                  <div className={styles.destinationInputCard}>
                    <div className={styles.destinationInputRow}>
                      <div className={styles.inputWrapper}>
                        <MapPin size={16} className={styles.inputIcon} />
                        <input
                          type="text"
                          placeholder="Enter destination (e.g., Paris, France)"
                          value={newDestination}
                          onChange={(e) => setNewDestination(e.target.value)}
                          className={styles.destinationInput}
                        />
                      </div>
                      <button
                        className={styles.addDestinationBtn}
                        onClick={handleAddDestination}
                        disabled={!trimmedDestination || isDuplicateDestination || isAtOptionLimit}
                      >
                        <Plus size={16} />
                        Add
                      </button>
                    </div>
                    {isDuplicateDestination && (
                      <p className={styles.destinationHint}>This destination is already listed.</p>
                    )}
                    {isAtOptionLimit && (
                      <p className={styles.destinationHint}>You have reached the option limit.</p>
                    )}
                  </div>
                  {pendingDestinations.length > 0 && (
                    <div className={styles.pendingDestinations}>
                      {pendingDestinations.map((destination) => (
                        <motion.div
                          key={destination}
                          className={styles.pendingDestinationItem}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <MapPin size={14} />
                          <span>{destination}</span>
                          <button
                            className={styles.pendingRemoveBtn}
                            onClick={() => handleRemoveDestination('', destination)}
                          >
                            <X size={14} />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                  <button
                    className={styles.createPollButton}
                    onClick={() => createDestinationPoll(pendingDestinations)}
                    disabled={pendingDestinations.length < 2}
                  >
                    <Plus size={18} />
                    Create Poll
                  </button>
                </div>
              ) : (
                <div className={styles.votingOptions}>
                  <div className={styles.destinationInputCard}>
                    <div className={styles.destinationInputRow}>
                      <div className={styles.inputWrapper}>
                        <MapPin size={16} className={styles.inputIcon} />
                        <input
                          type="text"
                          placeholder="Add a destination"
                          value={newDestination}
                          onChange={(e) => setNewDestination(e.target.value)}
                          className={styles.destinationInput}
                          disabled={isDestinationPollLocked}
                        />
                      </div>
                      <button
                        className={styles.addDestinationBtn}
                        onClick={handleAddDestination}
                        disabled={isDestinationPollLocked || !trimmedDestination || isDuplicateDestination || isAtOptionLimit}
                      >
                        <Plus size={16} />
                        Add
                      </button>
                    </div>
                    {isDuplicateDestination && (
                      <p className={styles.destinationHint}>This destination is already listed.</p>
                    )}
                    {isAtOptionLimit && (
                      <p className={styles.destinationHint}>You have reached the option limit.</p>
                    )}
                    {isDestinationPollLocked && (
                      <p className={styles.destinationHint}>
                        This poll is closed. Voting has ended.
                      </p>
                    )}
                  </div>
                  {getDestinationVotes().map((dest) => {
                    const userVote = getUserVote();
                    const isSelected = userVote === dest.id;
                    const canRemoveOption = !isDestinationPollLocked &&
                      (destinationPoll?.options?.length ?? 0) > 2 &&
                      dest.votes === 0;

                    return (
                      <div
                        key={dest.id}
                        className={`${styles.votingOption} ${isSelected ? styles.votingOptionSelected : ''}`}
                        onClick={() => handleVoteDestination(dest.id)}
                      >
                        <div className={styles.votingOptionHeader}>
                          <div className={styles.votingOptionInfo}>
                            <MapPin size={18} />
                            <span className={styles.votingOptionName}>{dest.destination}</span>
                          </div>
                          <div className={styles.votingOptionStats}>
                            <span className={styles.votingOptionVotes}>{dest.votes} votes</span>
                            <span className={styles.votingOptionPercentage}>{dest.percentage}%</span>
                            {isSelected && (
                              <span className={styles.myVoteBadge}>Your vote</span>
                            )}
                            {canRemoveOption && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveDestination(dest.id, dest.destination);
                                }}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className={styles.progressBarContainer}>
                          <motion.div
                            className={styles.progressBarFill}
                            initial={{ width: 0 }}
                            animate={{ width: `${dest.percentage}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className={styles.dialogOverlay} onClick={() => setIsSettingsOpen(false)}>
            <motion.div
              className={styles.settingsModal}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className={styles.settingsHeader}>
                <h3 className={styles.settingsTitle}>Group Settings</h3>
                <button className={styles.closeButton} onClick={() => setIsSettingsOpen(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className={styles.settingsContent}>
                <div className={styles.settingSection}>
                  <div className={styles.settingSectionHeader}>
                    <h4 className={styles.settingSectionTitle}>Group Information</h4>
                    {isAdmin && !isEditingSettings && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingSettings(true)}
                      >
                        <Edit3 size={16} />
                        Edit
                      </Button>
                    )}
                  </div>
                  {!isEditingSettings ? (
                    <>
                      <div className={styles.settingItem}>
                        <span className={styles.settingLabel}>Group Name</span>
                        <span className={styles.settingValue}>{group.name}</span>
                      </div>
                      <div className={styles.settingItem}>
                        <span className={styles.settingLabel}>Status</span>
                        <Badge
                          className={
                            group.status === 'active'
                              ? styles.activeBadge
                              : group.status === 'planning'
                              ? styles.planningBadge
                              : styles.completedBadge
                          }
                        >
                          {group.status}
                        </Badge>
                      </div>
                      <div className={styles.settingItem}>
                        <span className={styles.settingLabel}>Destination</span>
                        <span className={styles.settingValue}>{destinationLabel}</span>
                      </div>
                      <div className={styles.settingItem}>
                        <span className={styles.settingLabel}>Visibility</span>
                        <span className={styles.settingValue}>
                          {resolveGroupVisibility((currentGroup as any)?.type)}
                        </span>
                      </div>
                      <div className={styles.settingItem}>
                        <span className={styles.settingLabel}>Max Members</span>
                        <span className={styles.settingValue}>{currentGroup?.maxMembers || 20}</span>
                      </div>
                    </>
                  ) : (
                    <div className={styles.settingFormGrid}>
                      <div className={styles.settingField}>
                        <label className={styles.settingFieldLabel}>Group Name</label>
                        <input
                          className={styles.settingInput}
                          type="text"
                          value={settingsDraft.name}
                          onChange={(event) =>
                            setSettingsDraft((prev) => ({ ...prev, name: event.target.value }))
                          }
                          disabled={isSavingSettings}
                        />
                      </div>
                      <div className={styles.settingField}>
                        <label className={styles.settingFieldLabel}>Status</label>
                        <select
                          className={styles.settingSelect}
                          value={settingsDraft.status}
                          onChange={(event) =>
                            setSettingsDraft((prev) => ({
                              ...prev,
                              status: event.target.value as GroupSettingsDraft['status'],
                            }))
                          }
                          disabled={isSavingSettings}
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <p className={styles.settingFieldHelper}>
                          Current status: {calculatedStatusLabel}. On Tour or Completed requires start and end dates.
                        </p>
                      </div>
                      <div className={styles.settingField}>
                        <label className={styles.settingFieldLabel}>Destination</label>
                        <input
                          className={styles.settingInput}
                          type="text"
                          value={settingsDraft.destination}
                          onChange={(event) =>
                            setSettingsDraft((prev) => ({ ...prev, destination: event.target.value }))
                          }
                          disabled={isSavingSettings}
                        />
                        {destinationPoll && (
                          <p className={styles.settingHelperWarning}>
                            Changing destination clears the destination poll.
                          </p>
                        )}
                      </div>
                      <div className={styles.settingField}>
                        <label className={styles.settingFieldLabel}>Visibility</label>
                        <select
                          className={styles.settingSelect}
                          value={settingsDraft.type}
                          onChange={(event) =>
                            setSettingsDraft((prev) => ({
                              ...prev,
                              type: event.target.value as GroupSettingsDraft['type'],
                            }))
                          }
                          disabled={isSavingSettings}
                        >
                          {VISIBILITY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className={styles.settingField}>
                        <label className={styles.settingFieldLabel}>Max Members</label>
                        <input
                          className={styles.settingInput}
                          type="number"
                          min={2}
                          max={50}
                          value={settingsDraft.maxMembers}
                          onChange={(event) =>
                            setSettingsDraft((prev) => ({ ...prev, maxMembers: event.target.value }))
                          }
                          disabled={isSavingSettings}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.settingSection}>
                  <h4 className={styles.settingSectionTitle}>Trip Details</h4>
                  {!isEditingSettings ? (
                    <>
                      <div className={styles.settingItem}>
                        <span className={styles.settingLabel}>Start Date</span>
                        <span className={styles.settingValue}>{group.startDate}</span>
                      </div>
                      <div className={styles.settingItem}>
                        <span className={styles.settingLabel}>End Date</span>
                        <span className={styles.settingValue}>{group.endDate}</span>
                      </div>
                      <div className={styles.settingItem}>
                        <span className={styles.settingLabel}>Budget</span>
                        <span className={styles.settingValue}>{group.budget}</span>
                      </div>
                      <div className={styles.settingItem}>
                        <span className={styles.settingLabel}>Currency</span>
                        <span className={styles.settingValue}>{currentGroup?.currency || 'INR'}</span>
                      </div>
                    </>
                  ) : (
                    <div className={styles.settingFormGrid}>
                      <div className={styles.settingField}>
                        <label className={styles.settingFieldLabel}>Start Date</label>
                        <input
                          className={styles.settingInput}
                          type="date"
                          value={settingsDraft.startDate}
                          onChange={(event) =>
                            setSettingsDraft((prev) => ({ ...prev, startDate: event.target.value }))
                          }
                          disabled={isSavingSettings}
                        />
                      </div>
                      <div className={styles.settingField}>
                        <label className={styles.settingFieldLabel}>End Date</label>
                        <input
                          className={styles.settingInput}
                          type="date"
                          value={settingsDraft.endDate}
                          onChange={(event) =>
                            setSettingsDraft((prev) => ({ ...prev, endDate: event.target.value }))
                          }
                          disabled={isSavingSettings}
                        />
                      </div>
                      <div className={styles.settingField}>
                        <label className={styles.settingFieldLabel}>Budget</label>
                        <div className={styles.settingRow}>
                          <input
                            className={styles.settingInput}
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="Enter budget"
                            value={settingsDraft.budget}
                            onChange={(event) =>
                              setSettingsDraft((prev) => ({ ...prev, budget: event.target.value }))
                            }
                            disabled={isSavingSettings}
                          />
                          <select
                            className={styles.settingSelect}
                            value={settingsDraft.currency}
                            onChange={(event) =>
                              setSettingsDraft((prev) => ({ ...prev, currency: event.target.value.toUpperCase() }))
                            }
                            disabled={isSavingSettings}
                          >
                            {CURRENCY_OPTIONS.map((currency) => (
                              <option key={currency} value={currency}>
                                {currency}
                              </option>
                            ))}
                          </select>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className={styles.clearBudgetButton}
                            onClick={() => {
                              setSettingsDraft((prev) => ({ ...prev, budget: '' }));
                              setSettingsError(null);
                            }}
                            disabled={isSavingSettings}
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {isAdmin && isEditingSettings && (
                  <div className={styles.settingSection}>
                    <h4 className={styles.settingSectionTitle}>About & Cover</h4>
                    <div className={styles.settingField}>
                      <label className={styles.settingFieldLabel}>About This Trip</label>
                      <textarea
                        className={styles.settingTextarea}
                        rows={4}
                        placeholder="Share a quick overview for your group..."
                        value={settingsDraft.description}
                        onChange={(event) =>
                          setSettingsDraft((prev) => ({ ...prev, description: event.target.value }))
                        }
                        disabled={isSavingSettings}
                      />
                    </div>
                    <div className={styles.settingField}>
                      <label className={styles.settingFieldLabel}>Cover Image</label>
                      <div className={styles.coverEditor}>
                        {coverError && <div className={styles.settingHelperError}>{coverError}</div>}
                        {settingsDraft.imageUrl ? (
                          <div className={styles.coverPreview}>
                            <img src={settingsDraft.imageUrl} alt="Cover preview" />
                          </div>
                        ) : (
                          <div className={styles.coverEmpty}>No custom cover yet.</div>
                        )}
                        <div className={styles.coverActions}>
                          <label className={styles.coverUpload}>
                            <Upload size={16} />
                            Upload image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleCoverUpload}
                              disabled={isSavingSettings}
                              className={styles.coverInput}
                            />
                          </label>
                          <button
                            type="button"
                            className={styles.coverChoose}
                            onClick={() => setShowCoverPicker(!showCoverPicker)}
                            disabled={isSavingSettings}
                          >
                            <ImageIcon size={16} />
                            Choose cover
                          </button>
                        </div>
                        <p className={styles.coverNote}>PNG or JPG up to 2MB.</p>
                        {showCoverPicker && (
                          <div className={styles.coverGrid}>
                            {COVER_IMAGE_OPTIONS.map((url) => (
                              <button
                                key={url}
                                type="button"
                                className={styles.coverOption}
                                onClick={() => handleCoverSelect(url)}
                                disabled={isSavingSettings}
                              >
                                <img src={url} alt="Cover option" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {settingsError && <div className={styles.settingHelperError}>{settingsError}</div>}
                    <div className={styles.settingActions}>
                      <Button
                        variant="outline"
                        onClick={handleCancelSettingsEdit}
                        disabled={isSavingSettings}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveSettings}
                        disabled={!hasSettingsChanges || isSavingSettings}
                      >
                        {isSavingSettings ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </div>
                )}

                {isAdmin && (
                  <div className={styles.settingSection}>
                    <div className={styles.settingSectionHeader}>
                      <h4 className={styles.settingSectionTitle}>Join Requests</h4>
                      <Badge className={styles.pendingBadge}>{joinRequests.length} pending</Badge>
                    </div>

                    {isLoadingJoinRequests && (
                      <div className={styles.settingHelper}>Loading join requests...</div>
                    )}

                    {joinRequestError && !isLoadingJoinRequests && (
                      <div className={styles.settingHelper}>{joinRequestError}</div>
                    )}

                    {!isLoadingJoinRequests && !joinRequestError && joinRequests.length === 0 && (
                      <div className={styles.settingHelper}>No pending requests right now.</div>
                    )}

                    {!isLoadingJoinRequests && !joinRequestError && joinRequests.length > 0 && (
                      <div className={styles.joinRequestsList}>
                        {joinRequests.map((request) => (
                          <div key={request.id} className={styles.joinRequestItem}>
                            <div className={styles.joinRequestInfo}>
                              <img
                                src={request.user?.profilePicUrl || fallbackAvatarDataUrl}
                                alt={request.user?.name || `User ${request.userId}`}
                                className={styles.joinRequestAvatar}
                                onError={applyAvatarFallback}
                              />
                              <div>
                                <div className={styles.joinRequestName}>
                                  {request.user?.name || `User ${request.userId}`}
                                </div>
                                <div className={styles.joinRequestMeta}>
                                  {request.message || 'Requested to join your group'}
                                </div>
                              </div>
                            </div>
                            <div className={styles.joinRequestActions}>
                              <Button
                                variant="outline"
                                onClick={() => handleJoinRequestAction(request.id, 'reject')}
                              >
                                Decline
                              </Button>
                              <Button
                                onClick={() => handleJoinRequestAction(request.id, 'approve')}
                              >
                                Accept
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className={styles.settingSection}>
                  <h4 className={styles.settingSectionTitle}>Danger Zone</h4>
                  {isOwner ? (
                    <Button
                      variant="destructive"
                      className={styles.dangerButton}
                      onClick={handleDeleteGroup}
                    >
                      <LogOut size={18} />
                      Delete Group
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      className={styles.dangerButton}
                      onClick={handleLeaveGroup}
                    >
                      <LogOut size={18} />
                      Leave Group
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
