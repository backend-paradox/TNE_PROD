import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, MessageCircle, UserPlus, Sparkles, Search, ChevronDown, Loader2, Calendar, UserCheck, Clock, XCircle, CheckCircle, RefreshCw, X, Inbox, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import toast from 'react-hot-toast';
import { EmptyState, GroupCardSkeleton, TravellerCardSkeleton } from '@/components/travellers/common';
import { InviteToGroupModal } from '@/components/travellers/groups/InviteToGroupModal';
import { useNearbyGroups, useNearbyInbox, useTravellersNearby } from '@/hooks/travellers';
import {
  connectionsAPI,
  travellersAPI,
  type AcceptedConnection,
  type PendingConnectionRequest,
} from '@/features/travellers/travellersAPI';
import { useLocation, useNavigate } from 'react-router-dom';
import { normalizeDestination } from '@/utils/travellers';
import styles from './TravellersNearbyPage.module.css';

export function TravellersNearbyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'travellers' | 'groups' | 'connections' | 'inbox'>('travellers');
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [connectingUserId, setConnectingUserId] = useState<number | null>(null);
  const [cancellingUserId, setCancellingUserId] = useState<number | null>(null);
  const [inviteTarget, setInviteTarget] = useState<{ userId: number; name: string } | null>(null);
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);
  const [interestQuery, setInterestQuery] = useState('');
  const [interestSuggestions, setInterestSuggestions] = useState<string[]>([]);
  const [isInterestLoading, setIsInterestLoading] = useState(false);
  const [manualDestination, setManualDestination] = useState('');
  const [manualSearchActive, setManualSearchActive] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [allDestinations, setAllDestinations] = useState<string[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingConnectionRequest[]>([]);
  const [isPendingLoading, setIsPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const [pendingActionId, setPendingActionId] = useState<number | null>(null);
  const [connections, setConnections] = useState<AcceptedConnection[]>([]);
  const [isConnectionsLoading, setIsConnectionsLoading] = useState(false);
  const [connectionsError, setConnectionsError] = useState<string | null>(null);
  const [connectionsPage, setConnectionsPage] = useState(1);
  const [hasMoreConnections, setHasMoreConnections] = useState(true);
  const [isLoadingMoreConnections, setIsLoadingMoreConnections] = useState(false);
  const [sentRequests, setSentRequests] = useState<PendingConnectionRequest[]>([]);
  const [isSentLoading, setIsSentLoading] = useState(false);
  const [sentError, setSentError] = useState<string | null>(null);
  const [sentActionId, setSentActionId] = useState<number | null>(null);
  const locationState = location.state as { activeTab?: 'travellers' | 'groups' | 'connections' | 'inbox' } | null;

  const isManualSearch = manualSearchActive || Boolean(startDate || endDate);

  const {
    travellers,
    destinations,
    selectedDestination,
    setSelectedDestination,
    stats,
    isLoading,
    error,
    sendConnection,
    cancelConnection,
    refetch,
  } = useTravellersNearby(isManualSearch, startDate || undefined, endDate || undefined);

  const {
    groups,
    destinations: groupDestinations,
    setSelectedDestination: setGroupDestination,
    stats: groupStats,
    isLoading: groupsLoading,
    error: groupsError,
    requestToJoin,
    refetch: refetchGroups,
  } = useNearbyGroups(startDate || undefined, endDate || undefined);

  const {
    conversations: inboxConversations,
    destinations: inboxDestinations,
    stats: inboxStats,
    isLoading: inboxLoading,
    error: inboxError,
    refetch: refetchInbox,
    markConversationRead,
  } = useNearbyInbox(startDate || undefined, endDate || undefined);

  const fetchPendingRequests = useCallback(async () => {
    setIsPendingLoading(true);
    setPendingError(null);
    try {
      const response = await connectionsAPI.getPendingRequests();
      setPendingRequests(response.requests || []);
    } catch (err) {
      setPendingError('Failed to load connection requests');
      console.error('fetchPendingRequests error:', err);
    } finally {
      setIsPendingLoading(false);
    }
  }, []);

  const CONNECTIONS_PAGE_SIZE = 20;

  const fetchConnections = useCallback(async (page = 1, append = false) => {
    if (page === 1) {
      setIsConnectionsLoading(true);
    } else {
      setIsLoadingMoreConnections(true);
    }
    setConnectionsError(null);
    try {
      const response = await connectionsAPI.getConnections(page, CONNECTIONS_PAGE_SIZE);
      const newConnections = response.connections || [];

      if (append) {
        setConnections((prev) => [...prev, ...newConnections]);
      } else {
        setConnections(newConnections);
      }

      // Check if there are more connections to load
      setHasMoreConnections(newConnections.length === CONNECTIONS_PAGE_SIZE);
      setConnectionsPage(page);
    } catch (err) {
      setConnectionsError('Failed to load connections');
      console.error('fetchConnections error:', err);
    } finally {
      setIsConnectionsLoading(false);
      setIsLoadingMoreConnections(false);
    }
  }, []);

  const loadMoreConnections = useCallback(() => {
    if (!isLoadingMoreConnections && hasMoreConnections) {
      fetchConnections(connectionsPage + 1, true);
    }
  }, [connectionsPage, fetchConnections, hasMoreConnections, isLoadingMoreConnections]);

  const fetchSentRequests = useCallback(async () => {
    setIsSentLoading(true);
    setSentError(null);
    try {
      const response = await connectionsAPI.getSentRequests();
      setSentRequests(response.requests || []);
    } catch (err) {
      setSentError('Failed to load sent requests');
      console.error('fetchSentRequests error:', err);
    } finally {
      setIsSentLoading(false);
    }
  }, []);

  useEffect(() => {
    if (locationState?.activeTab) {
      setActiveTab(locationState.activeTab);
    }
  }, [locationState?.activeTab]);

  const connectedCount = activeTab === 'connections'
    ? connections.length
    : travellers.filter((t) => t.connectionStatus === 'ACCEPTED').length;
  const hasPendingRequests = pendingRequests.length > 0;
  const unreadInboxMessages = inboxConversations.reduce((sum, item) => sum + (item.unreadCount || 0), 0);
  const unreadInboxThreads = inboxConversations.filter((item) => (item.unreadCount || 0) > 0).length;
  const combinedDestinations = Array.from(
    new Set([...allDestinations, ...destinations, ...groupDestinations, ...inboxDestinations])
  )
    .map((dest) => normalizeDestination(dest))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  const dropdownDestinations = useMemo(() => {
    const query = normalizeDestination(manualDestination);
    if (!query) return combinedDestinations;

    const queryLower = query.toLowerCase();
    const matches = [];
    const nonMatches = [];
    combinedDestinations.forEach((dest) => {
      if (dest.toLowerCase().includes(queryLower)) {
        matches.push(dest);
      } else {
        nonMatches.push(dest);
      }
    });

    matches.sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      const aExact = aLower === queryLower;
      const bExact = bLower === queryLower;
      if (aExact !== bExact) return aExact ? -1 : 1;
      const aStarts = aLower.startsWith(queryLower);
      const bStarts = bLower.startsWith(queryLower);
      if (aStarts !== bStarts) return aStarts ? -1 : 1;
      return aLower.localeCompare(bLower);
    });

    return [...matches, ...nonMatches];
  }, [combinedDestinations, manualDestination]);

  const destinationSuggestions = useMemo(() => {
    const query = normalizeDestination(manualDestination);
    if (!query) return [];
    return dropdownDestinations.filter((dest) =>
      dest.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 6);
  }, [dropdownDestinations, manualDestination]);

  const totalGroupSpots = groups.reduce((sum, group) => sum + (group.spotsLeft || 0), 0);

  const statsDisplay =
    activeTab === 'groups'
      ? [
          { label: 'Planning Groups', value: String(groupStats.total || groups.length), icon: Users, color: 'purple' },
          { label: 'Destinations', value: String(groupDestinations.length), icon: MapPin, color: 'pink' },
          { label: 'Spots Open', value: String(totalGroupSpots), icon: UserPlus, color: 'purple' },
        ]
      : activeTab === 'inbox'
      ? [
          { label: 'Conversations', value: String(inboxStats.total || inboxConversations.length), icon: MessageCircle, color: 'purple' },
          { label: 'Unread', value: String(inboxStats.unread ?? unreadInboxMessages), icon: UserPlus, color: 'pink' },
          { label: 'Destinations', value: String(inboxDestinations.length), icon: MapPin, color: 'purple' },
        ]
      : activeTab === 'connections'
      ? [
          { label: 'Connections', value: String(connections.length), icon: Users, color: 'purple' },
          { label: 'Pending', value: String(pendingRequests.length), icon: UserPlus, color: 'pink' },
          { label: 'Destinations', value: String(destinations.length), icon: MapPin, color: 'purple' },
        ]
      : [
          { label: 'On Tour Travellers', value: String(stats.total), icon: Users, color: 'purple' },
          { label: 'Destinations', value: String(destinations.length), icon: MapPin, color: 'pink' },
          { label: 'Connections', value: String(connectedCount), icon: UserPlus, color: 'purple' },
        ];

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

  const headerSubtitle =
    activeTab === 'groups'
      ? `${groups.length} planning groups${selectedDestination && selectedDestination !== 'all' ? ` for ${selectedDestination}` : ''}`
      : activeTab === 'inbox'
      ? `${inboxConversations.length} nearby conversations${selectedDestination && selectedDestination !== 'all' ? ` for ${selectedDestination}` : ''}`
      : activeTab === 'connections'
      ? `${connections.length} connections${hasPendingRequests ? ` (${pendingRequests.length} pending)` : ''}`
      : `${travellers.length} travellers on tour${selectedDestination && selectedDestination !== 'all' ? ` going to ${selectedDestination}` : ' in your destinations'}`;

  const isConnectionsTabLoading = isLoading || isPendingLoading || isConnectionsLoading || isSentLoading;
  const isActiveLoading =
    activeTab === 'groups'
      ? groupsLoading
      : activeTab === 'inbox'
      ? inboxLoading
      : activeTab === 'connections'
      ? isConnectionsTabLoading
      : isLoading;
  const activeError =
    activeTab === 'groups'
      ? groupsError
      : activeTab === 'inbox'
      ? inboxError
      : activeTab === 'connections'
      ? null
      : error;
  const handleRefetch = useCallback(() => {
    if (activeTab === 'groups') {
      refetchGroups();
      return;
    }
    if (activeTab === 'inbox') {
      refetchInbox();
      return;
    }
    if (activeTab === 'connections') {
      // Fetch all connection data in parallel
      Promise.all([
        fetchPendingRequests(),
        fetchConnections(),
        fetchSentRequests(),
        refetch(),
      ]);
      return;
    }
    refetch();
  }, [activeTab, fetchConnections, fetchPendingRequests, fetchSentRequests, refetch, refetchGroups, refetchInbox]);

  const handleSendConnection = async (userId: number) => {
    setConnectingUserId(userId);
    const success = await sendConnection(userId);
    setConnectingUserId(null);
    if (success) {
      toast.success('Connection request sent!', { icon: '🤝', duration: 3000 });
    } else {
      toast.error('Failed to send connection request. Please try again.');
    }
  };

  const handleCancelConnection = async (userId: number, connectionId?: number | null) => {
    setCancellingUserId(userId);
    const success = await cancelConnection(userId, connectionId);
    setCancellingUserId(null);
    if (success) {
      toast.success('Connection request cancelled.', { duration: 3000 });
    } else {
      toast.error('Failed to cancel request. Please try again.');
    }
  };

  const handleAcceptConnection = async (connectionId: number) => {
    setPendingActionId(connectionId);
    try {
      await connectionsAPI.acceptConnection(String(connectionId));
      toast.success('Connection accepted.', { duration: 3000 });
      await fetchPendingRequests();
      await fetchConnections();
      await refetch();
    } catch (err) {
      console.error('Failed to accept connection request:', err);
      toast.error('Failed to accept request. Please try again.');
    } finally {
      setPendingActionId(null);
    }
  };

  const handleRejectConnection = async (connectionId: number) => {
    setPendingActionId(connectionId);
    try {
      await connectionsAPI.rejectConnection(String(connectionId));
      toast.success('Connection request declined.', { duration: 3000 });
      await fetchPendingRequests();
    } catch (err) {
      console.error('Failed to reject connection request:', err);
      toast.error('Failed to decline request. Please try again.');
    } finally {
      setPendingActionId(null);
    }
  };

  const handleCancelSentRequest = async (connectionId: number) => {
    setSentActionId(connectionId);
    try {
      await connectionsAPI.cancelConnectionRequest(String(connectionId));
      toast.success('Connection request cancelled.', { duration: 3000 });
      await fetchSentRequests();
      await refetch();
    } catch (err) {
      console.error('Failed to cancel sent request:', err);
      toast.error('Failed to cancel request. Please try again.');
    } finally {
      setSentActionId(null);
    }
  };

  const handleDestinationSelect = (destination: string) => {
    setManualSearchActive(destination !== 'all');
    setSelectedDestination(destination);
    setGroupDestination(destination);
    setShowDestinationDropdown(false);
    setShowDestinationSuggestions(false);
    setManualDestination(destination === 'all' ? '' : destination);
  };

  const handleOpenMessage = (traveller: { userId: number; name: string; profileImage: string }, conversationId?: string) => {
    if (conversationId) {
      markConversationRead(conversationId);
      window.dispatchEvent(
        new CustomEvent('conversation:read', { detail: { conversationId, userId: traveller.userId } })
      );
    }
    navigate(`/travellers/messages/${traveller.userId}`, {
      state: { name: traveller.name, avatar: traveller.profileImage, backgroundLocation: location },
    });
  };

  const handleOpenProfile = (userId?: number) => {
    if (!userId) return;
    navigate(`/travellers/profile/${userId}`);
  };

  const handleOpenInvite = (traveller: { userId: number; name: string }) => {
    setInviteTarget({ userId: traveller.userId, name: traveller.name });
  };

  const handleRequestJoin = async (groupId: string) => {
    setJoiningGroupId(groupId);
    const success = await requestToJoin(groupId);
    setJoiningGroupId(null);
    if (success) {
      toast.success('Join request sent! You will be notified when approved.', { icon: '📨', duration: 4000 });
    } else {
      toast.error('Failed to send join request. Please try again.');
    }
  };

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    if (endDate && value && endDate < value) {
      setEndDate(value);
    }
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(value);
    if (startDate && value && value < startDate) {
      setStartDate(value);
    }
  };

  const applyDestinationValue = (value: string) => {
    const cleaned = value.trim();
    if (!cleaned) {
      handleDestinationSelect('all');
      return;
    }

    setManualSearchActive(true);
    setSelectedDestination(cleaned);
    setGroupDestination(cleaned);
    setShowDestinationDropdown(false);
    setShowDestinationSuggestions(false);
    setManualDestination(cleaned);
  };

  const applyManualDestination = () => {
    applyDestinationValue(manualDestination);
  };

  const handleDestinationInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setManualDestination(value);
    // Suggestions are shown after a brief delay to avoid flickering
  };

  const hasActiveFilters = Boolean(
    (selectedDestination && selectedDestination !== 'all') ||
    startDate ||
    endDate ||
    interestQuery
  );

  const clearAllFilters = () => {
    setSelectedDestination('all');
    setGroupDestination('all');
    setManualDestination('');
    setManualSearchActive(false);
    setStartDate('');
    setEndDate('');
    setInterestQuery('');
    setShowDestinationDropdown(false);
    setShowDestinationSuggestions(false);
  };

  // Debounce destination suggestions display
  useEffect(() => {
    const query = manualDestination.trim();
    if (!query) {
      setShowDestinationSuggestions(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowDestinationSuggestions(true);
    }, 150);

    return () => clearTimeout(timer);
  }, [manualDestination]);

  const normalizedInterest = interestQuery.trim().toLowerCase();
  // Filter out blocked users - they should not appear in any list
  const nonBlockedTravellers = travellers.filter((t) => t.connectionStatus !== 'BLOCKED');
  const travellerBase =
    activeTab === 'connections'
      ? nonBlockedTravellers.filter((t) => t.connectionStatus === 'ACCEPTED')
      : nonBlockedTravellers;
  const filteredTravellers =
    normalizedInterest.length > 0
      ? travellerBase.filter((traveller) =>
          (traveller.interests || []).some((interest) =>
            interest.toLowerCase().includes(normalizedInterest)
          )
        )
      : travellerBase;
  const showTravellersEmpty =
    !isActiveLoading && !activeError && activeTab === 'travellers' && filteredTravellers.length === 0;
  const filteredGroups = groups;
  const filteredInbox = inboxConversations;

  const formatInboxTimestamp = (value?: string | null) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatInboxPreview = (item: typeof inboxConversations[number]) => {
    const lastMessage = item.lastMessage;
    if (!lastMessage) return 'No messages yet';
    if (lastMessage.content) return lastMessage.content;
    const type = String(lastMessage.type || '').toUpperCase();
    if (type === 'IMAGE') return 'Sent a photo';
    if (type === 'AUDIO') return 'Sent a voice note';
    if (type === 'LOCATION') return 'Shared a location';
    return 'New message';
  };

  useEffect(() => {
    let isMounted = true;
    const loadDestinations = async () => {
      try {
        const response = await travellersAPI.getDestinations();
        if (isMounted) {
          const cleaned = response.map((dest) => normalizeDestination(dest)).filter(Boolean);
          setAllDestinations(cleaned);
        }
      } catch (err) {
        console.error('Failed to load destinations:', err);
      }
    };

    loadDestinations();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const query = interestQuery.trim();
    if (!query) {
      setInterestSuggestions([]);
      setIsInterestLoading(false);
      return;
    }

    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        setIsInterestLoading(true);
        const response = await travellersAPI.getInterestSuggestions(query, 8);
        if (isMounted) {
          setInterestSuggestions(response);
        }
      } catch (err) {
        console.error('Failed to load interest suggestions:', err);
        if (isMounted) {
          setInterestSuggestions([]);
        }
      } finally {
        if (isMounted) {
          setIsInterestLoading(false);
        }
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [interestQuery]);

  useEffect(() => {
    if (activeTab === 'connections') {
      // Fetch all connection data in parallel for better performance
      Promise.all([
        fetchPendingRequests(),
        fetchConnections(),
        fetchSentRequests(),
      ]);
    }
  }, [activeTab, fetchPendingRequests, fetchConnections, fetchSentRequests]);

  return (
    <motion.div
      className={styles.container}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div className={styles.header} variants={itemVariants}>
        <div className={styles.headerContent}>
          <div className={styles.headerIcon}>
            <MapPin size={24} />
          </div>
          <div>
            <h1 className={styles.title}>TravelConnect Nearby</h1>
            <p className={styles.subtitle}>{headerSubtitle}</p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div className={styles.filterRow} variants={itemVariants}>
          <div className={styles.filterWrapper}>
            <button
              className={styles.destinationDropdownTrigger}
              onClick={() => setShowDestinationDropdown(!showDestinationDropdown)}
            >
              <MapPin size={16} />
              <span>{selectedDestination === 'all' ? 'All Destinations' : selectedDestination}</span>
              <ChevronDown size={16} className={showDestinationDropdown ? styles.rotated : ''} />
            </button>

            {showDestinationDropdown && (
              <div className={styles.destinationDropdown}>
                <button
                  className={`${styles.destinationOption} ${selectedDestination === 'all' ? styles.selected : ''}`}
                  onClick={() => handleDestinationSelect('all')}
                >
                  All Destinations
                </button>
                {dropdownDestinations.map((dest) => (
                  <button
                    key={dest}
                    className={`${styles.destinationOption} ${selectedDestination === dest ? styles.selected : ''}`}
                    onClick={() => handleDestinationSelect(dest)}
                  >
                    {dest}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.destinationSearch}>
            <MapPin size={16} className={styles.destinationIcon} />
            <input
              className={styles.destinationInput}
              placeholder="Search destination..."
              value={manualDestination}
              onChange={handleDestinationInputChange}
              onFocus={() => {
                if (manualDestination.trim()) {
                  setShowDestinationSuggestions(true);
                }
              }}
              onBlur={() => setShowDestinationSuggestions(false)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  applyManualDestination();
                }
              }}
            />
            <button className={styles.destinationApply} onClick={applyManualDestination}>
              Search
            </button>
            {showDestinationSuggestions && destinationSuggestions.length > 0 && (
              <div className={styles.suggestionsList}>
                {destinationSuggestions.map((dest) => (
                  <button
                    key={dest}
                    type="button"
                    className={styles.suggestionItem}
                    onMouseDown={() => applyDestinationValue(dest)}
                  >
                    <MapPin size={14} />
                    <span>{dest}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.dateFilter}>
            <Calendar size={16} className={styles.dateIcon} />
            <div className={styles.dateInputs}>
              <input
                type="date"
                className={styles.dateInput}
                aria-label="Start date"
                value={startDate}
                onChange={(event) => handleStartDateChange(event.target.value)}
              />
              <span className={styles.dateDivider}>to</span>
              <input
                type="date"
                className={styles.dateInput}
                aria-label="End date"
                min={startDate || undefined}
                value={endDate}
                onChange={(event) => handleEndDateChange(event.target.value)}
              />
            </div>
          </div>

          {(activeTab === 'travellers' || activeTab === 'connections') && (
            <div className={styles.interestFilter}>
              <Search size={16} className={styles.interestIcon} />
              <input
                className={styles.interestInput}
                placeholder="Filter by interest..."
                value={interestQuery}
                onChange={(event) => setInterestQuery(event.target.value)}
              />
              {interestSuggestions.length > 0 && (
                <div className={styles.suggestionsList}>
                  {interestSuggestions.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      className={styles.suggestionItem}
                      onMouseDown={() => {
                        setInterestQuery(interest);
                        setInterestSuggestions([]);
                      }}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className={styles.activeFilters}>
              {selectedDestination && selectedDestination !== 'all' && (
                <span className={styles.filterChip}>
                  <MapPin size={14} />
                  {selectedDestination}
                  <button
                    className={styles.filterChipRemove}
                    onClick={() => handleDestinationSelect('all')}
                    type="button"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {startDate && (
                <span className={styles.filterChip}>
                  <Calendar size={14} />
                  From: {startDate}
                  <button
                    className={styles.filterChipRemove}
                    onClick={() => setStartDate('')}
                    type="button"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {endDate && (
                <span className={styles.filterChip}>
                  <Calendar size={14} />
                  To: {endDate}
                  <button
                    className={styles.filterChipRemove}
                    onClick={() => setEndDate('')}
                    type="button"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {interestQuery && (
                <span className={styles.filterChip}>
                  <Search size={14} />
                  {interestQuery}
                  <button
                    className={styles.filterChipRemove}
                    onClick={() => setInterestQuery('')}
                    type="button"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              <button
                className={styles.clearAllBtn}
                onClick={clearAllFilters}
                type="button"
              >
                <X size={14} />
                Clear All
              </button>
            </div>
          )}
        </motion.div>

      {/* Stats Cards */}
      <motion.div className={styles.statsGrid} variants={itemVariants}>
        {statsDisplay.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`${styles.statCard} ${styles[stat.color]}`}>
              <div className={styles.statIcon}>
                <Icon size={22} />
              </div>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          );
        })}
      </motion.div>

      {/* Filter Tabs */}
      <motion.div className={styles.tabs} variants={itemVariants}>
        <button
          className={`${styles.tab} ${activeTab === 'travellers' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('travellers')}
        >
          <Users size={18} className={styles.tabIcon} />
          Travellers
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'groups' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          <Users size={18} className={styles.tabIcon} />
          Groups
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'inbox' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('inbox')}
        >
          <Inbox size={18} className={styles.tabIcon} />
          Nearby Inbox
          {unreadInboxThreads > 0 && (
            <span className={styles.tabBadge}>{unreadInboxThreads}</span>
          )}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'connections' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('connections')}
        >
          <Link2 size={18} className={styles.tabIcon} />
          Connections
        </button>
      </motion.div>

      {/* Loading State */}
      {isActiveLoading && activeTab !== 'connections' && (
        <div className={styles.skeletonList}>
          {activeTab === 'groups' ? (
            <>
              <GroupCardSkeleton />
              <GroupCardSkeleton />
              <GroupCardSkeleton />
            </>
          ) : (
            <>
              <TravellerCardSkeleton />
              <TravellerCardSkeleton />
              <TravellerCardSkeleton />
            </>
          )}
        </div>
      )}

      {/* Error State */}
      {activeError && !isActiveLoading && (
        <div className={styles.errorState}>
          <p>{activeError}</p>
          <Button onClick={handleRefetch} variant="outline">
            Try Again
          </Button>
        </div>
      )}

      {activeTab === 'connections' && (
        <>
          <motion.div className={styles.pendingSection} variants={itemVariants}>
            <div className={styles.pendingHeader}>
              <h3 className={styles.pendingTitle}>All Connections</h3>
              {isConnectionsLoading && <Loader2 size={16} className={styles.spinner} />}
            </div>
            {connectionsError && <div className={styles.pendingError}>{connectionsError}</div>}
            {!isConnectionsLoading && connections.length === 0 && (
              <div className={styles.pendingEmpty}>No connections yet.</div>
            )}
            {connections.length > 0 && (
              <motion.div className={styles.connectionsList} variants={containerVariants}>
                {connections.map((connection) => {
                  const user = connection.user || { id: 0 };
                  const name = user.name || `User ${user.id}`;
                  const avatar =
                    user.profilePicUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id || name}`;
                  const canMessage = Boolean(user.authId);
                  const profileId = user.authId || user.id;

                  return (
                    <motion.div key={connection.connectionId} className={styles.connectionCard} variants={itemVariants}>
                      <div className={styles.connectionInfo}>
                        <img src={avatar} alt={name} className={styles.connectionAvatar} />
                        <div className={styles.connectionText}>
                          <button
                            type="button"
                            className={`${styles.connectionName} ${styles.nameButton}`}
                            onClick={() => handleOpenProfile(profileId)}
                          >
                            {name}
                          </button>
                          <div className={styles.connectionMeta}>
                            {user.currentLocationName || 'Location not shared'}
                          </div>
                        </div>
                      </div>
                      <div className={styles.connectionActions}>
                        <button
                          className={`btn btn-primary ${styles.actionBtn}`}
                          onClick={() => handleOpenMessage({
                            userId: user.authId || 0,
                            name,
                            profileImage: avatar,
                          })}
                          disabled={!canMessage}
                        >
                          <MessageCircle size={16} />
                          Message
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
                {hasMoreConnections && (
                  <div className={styles.loadMoreContainer}>
                    <Button
                      variant="outline"
                      onClick={loadMoreConnections}
                      disabled={isLoadingMoreConnections}
                      className={styles.loadMoreBtn}
                    >
                      {isLoadingMoreConnections ? (
                        <>
                          <Loader2 size={16} className={styles.spinner} />
                          Loading...
                        </>
                      ) : (
                        'Load More'
                      )}
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>

          <motion.div className={styles.pendingSection} variants={itemVariants}>
            <div className={styles.pendingHeader}>
              <h3 className={styles.pendingTitle}>Pending requests</h3>
              {isPendingLoading && <Loader2 size={16} className={styles.spinner} />}
            </div>
            {pendingError && <div className={styles.pendingError}>{pendingError}</div>}
            {!isPendingLoading && pendingRequests.length === 0 && (
              <div className={styles.pendingEmpty}>No pending requests.</div>
            )}
            {pendingRequests.length > 0 && (
              <div className={styles.pendingList}>
                {pendingRequests.map((request) => {
                  const user = request.user || { id: 0 };
                  const name = user.name || `User ${user.id}`;
                  const avatar =
                    user.profilePicUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id || name}`;
                  const profileId = user.authId || user.id;

                  return (
                    <div key={request.connectionId} className={styles.pendingCard}>
                      <div className={styles.pendingInfo}>
                        <img src={avatar} alt={name} className={styles.pendingAvatar} />
                        <div className={styles.pendingText}>
                          <button
                            type="button"
                            className={`${styles.pendingName} ${styles.nameButton}`}
                            onClick={() => handleOpenProfile(profileId)}
                          >
                            {name}
                          </button>
                          <div className={styles.pendingMeta}>
                            {request.message || 'Sent you a connection request'}
                          </div>
                        </div>
                      </div>
                      <div className={styles.pendingActions}>
                      <Button
                        variant="outline"
                        onClick={() => handleRejectConnection(request.connectionId)}
                        disabled={pendingActionId === request.connectionId}
                        className={styles.declineButton}
                      >
                        Decline
                      </Button>
                        <Button
                          onClick={() => handleAcceptConnection(request.connectionId)}
                          disabled={pendingActionId === request.connectionId}
                        >
                          Accept
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          <motion.div className={styles.pendingSection} variants={itemVariants}>
            <div className={styles.pendingHeader}>
              <h3 className={styles.pendingTitle}>Request Sent</h3>
              {isSentLoading && <Loader2 size={16} className={styles.spinner} />}
            </div>
            {sentError && <div className={styles.pendingError}>{sentError}</div>}
            {!isSentLoading && sentRequests.length === 0 && (
              <div className={styles.pendingEmpty}>No sent requests.</div>
            )}
            {sentRequests.length > 0 && (
              <div className={styles.pendingList}>
                {sentRequests.map((request) => {
                  const user = request.user || { id: 0 };
                  const name = user.name || `User ${user.id}`;
                  const avatar =
                    user.profilePicUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id || name}`;
                  const profileId = user.authId || user.id;

                  return (
                    <div key={request.connectionId} className={styles.pendingCard}>
                      <div className={styles.pendingInfo}>
                        <img src={avatar} alt={name} className={styles.pendingAvatar} />
                        <div className={styles.pendingText}>
                          <button
                            type="button"
                            className={`${styles.pendingName} ${styles.nameButton}`}
                            onClick={() => handleOpenProfile(profileId)}
                          >
                            {name}
                          </button>
                          <div className={styles.pendingMeta}>
                            {request.message || 'Connection request sent'}
                          </div>
                        </div>
                      </div>
                      <div className={styles.pendingActions}>
                        <Button
                          variant="outline"
                          onClick={() => handleCancelSentRequest(request.connectionId)}
                          disabled={sentActionId === request.connectionId}
                          className={styles.cancelButton}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* Travellers List */}
      {showTravellersEmpty && (
        <EmptyState
          icon={Search}
          title="No travellers nearby"
          description={
            destinations.length === 0
              ? 'Join a group with a destination to find other travellers going to the same place!'
              : "Looks like there aren't any other travellers going to your destinations yet. Check back later!"
          }
          actionLabel={destinations.length === 0 ? 'Browse Groups' : 'Refresh'}
          onAction={destinations.length === 0 ? () => window.location.href = '/travellers/group-planning' : handleRefetch}
        />
      )}

      {!isActiveLoading && !activeError && activeTab === 'travellers' && filteredTravellers.length > 0 && (
        <motion.div className={styles.travellersList} variants={containerVariants}>
          {filteredTravellers.map((traveller) => (
            <motion.div key={traveller.id} className={styles.travellerCard} variants={itemVariants}>
              {/* Profile Header */}
              <div className={styles.cardHeader}>
                <div className={styles.profileSection}>
                  <div className={styles.avatarWrapper}>
                    <img src={traveller.profileImage} alt={traveller.name} className={styles.avatar} />
                    {traveller.isNew && <Badge className={styles.newBadge}>NEW</Badge>}
                  </div>

                  <div className={styles.profileInfo}>
                    <div className={styles.nameRow}>
                      <button
                        type="button"
                        className={`${styles.name} ${styles.nameButton}`}
                        onClick={() => handleOpenProfile(traveller.userId)}
                      >
                        {traveller.name}{traveller.age ? `, ${traveller.age}` : ''}
                      </button>
                      {/* Connection Status Badge */}
                      {traveller.connectionStatus === 'ACCEPTED' && (
                        <Badge className={styles.connectedBadge}>Connected</Badge>
                      )}
                      {traveller.connectionStatus === 'PENDING' && (
                        <Badge variant="outline" className={styles.pendingBadge}>Request Pending</Badge>
                      )}
                    </div>
                    <div className={styles.locationRow}>
                      <MapPin size={14} />
                      <span>
                  {normalizeDestination(traveller.destination) || traveller.groupName}
                  {normalizeDestination(traveller.destination) && traveller.groupName ? ` | ${traveller.groupName}` : ''}
                </span>
                      <span className={styles.separator}>|</span>
                      <span className={styles.travelDates}>{traveller.travelDates}</span>
                    </div>
                    <div className={styles.locationRow}>
                      <span>{traveller.currentLocation}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Why Connect Section */}
              <div className={styles.whyConnect}>
                <div className={styles.whyConnectHeader}>
                  <Sparkles size={16} />
                  <span>Why you might connect:</span>
                </div>
                <div className={styles.connectReasons}>
                  {(traveller.whyConnect || []).map((reason, idx) => (
                    <span key={idx} className={styles.reason}>
                      {reason}
                    </span>
                  ))}
                </div>
              </div>

              {/* Interests & Tags */}
              <div className={styles.tags}>
                <div className={styles.tagGroup}>
                  {(traveller.interests || []).map((interest, idx) => (
                    <Badge key={idx} variant="outline" className={styles.interestTag}>
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className={styles.languages}>
                {(traveller.languages || []).map((lang, idx) => (
                  <Badge key={idx} className={styles.languageTag}>
                    {lang}
                  </Badge>
                ))}
              </div>

              {/* Footer */}
              <div className={styles.cardFooter}>
                <div className={styles.dateInfo}>
                  {normalizeDestination(traveller.destination) && (
                    <span className={styles.location}>{normalizeDestination(traveller.destination)}</span>
                  )}
                  <span className={styles.dates}>{traveller.travelDates}</span>
                </div>

                <div className={styles.actions}>
                  {/* Show different buttons based on connection status */}
                  {traveller.connectionStatus === 'NONE' && (
                    <button
                      className={`btn btn-primary ${styles.actionBtn}`}
                      onClick={() => handleSendConnection(traveller.userId)}
                      disabled={connectingUserId === traveller.userId}
                    >
                      {connectingUserId === traveller.userId ? (
                        <Loader2 size={16} className={styles.spinner} />
                      ) : (
                        <UserPlus size={16} />
                      )}
                      Connect
                    </button>
                  )}

                  {traveller.connectionStatus === 'PENDING' && (
                    <button
                      className={`btn btn-danger-outline ${styles.actionBtn}`}
                      onClick={() => handleCancelConnection(traveller.userId, traveller.connectionId)}
                      disabled={!traveller.connectionId || cancellingUserId === traveller.userId}
                    >
                      {cancellingUserId === traveller.userId ? (
                        <Loader2 size={16} className={styles.spinner} />
                      ) : (
                        <XCircle size={16} />
                      )}
                      Cancel Request
                    </button>
                  )}

                  {traveller.connectionStatus === 'ACCEPTED' && (
                    <>
                      <button
                        className={`btn btn-primary ${styles.actionBtn}`}
                        type="button"
                        onClick={() => handleOpenMessage(traveller)}
                      >
                        <MessageCircle size={16} />
                        Message
                      </button>
                      <button
                        className={`btn btn-outline ${styles.actionBtn}`}
                        type="button"
                        onClick={() => handleOpenInvite(traveller)}
                      >
                        <Users size={16} />
                        Invite to Group
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {!isActiveLoading && !activeError && activeTab === 'groups' && filteredGroups.length === 0 && (
        <EmptyState
          icon={Users}
          title="No planning groups found"
          description={
            combinedDestinations.length === 0
              ? 'Add a destination or pick one to see public groups you can join.'
              : "No public planning groups match this destination right now."
          }
          actionLabel="Refresh"
          onAction={handleRefetch}
        />
      )}

      {!isActiveLoading && !activeError && activeTab === 'groups' && filteredGroups.length > 0 && (
        <motion.div className={styles.groupsList} variants={containerVariants}>
          {filteredGroups.map((group) => {
            const isPending = group.joinStatus === 'PENDING';
            const isRejected = group.joinStatus === 'REJECTED';
            const isApproved = group.joinStatus === 'APPROVED';
            const isFull = group.spotsLeft <= 0;

            return (
              <motion.div key={group.id} className={styles.groupCard} variants={itemVariants}>
                <div className={styles.groupHeader}>
                  <img
                    src={
                      group.imageUrl ||
                      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop'
                    }
                    alt={group.name}
                    className={styles.groupImage}
                  />
                  <div className={styles.groupInfo}>
                    <div className={styles.groupNameRow}>
                      <h3 className={styles.groupName}>{group.name}</h3>
                      {isPending && (
                        <Badge className={styles.pendingStatusBadge}>
                          <Clock size={12} />
                          Pending
                        </Badge>
                      )}
                      {isRejected && (
                        <Badge className={styles.rejectedStatusBadge}>
                          <XCircle size={12} />
                          Not Approved
                        </Badge>
                      )}
                      {isApproved && (
                        <Badge className={styles.approvedStatusBadge}>
                          <CheckCircle size={12} />
                          Approved
                        </Badge>
                      )}
                    </div>
                    <div className={styles.groupMeta}>
                      <span className={styles.groupMetaItem}>
                        <MapPin size={14} />
                        {normalizeDestination(group.destination) || 'Destination TBD'}
                      </span>
                      <span className={styles.groupMetaItem}>
                        <Calendar size={14} />
                        {group.travelDates}
                      </span>
                    </div>
                    <div className={styles.groupStats}>
                      <span>
                        {group.memberCount} members
                      </span>
                      <span className={styles.separator}>|</span>
                      <span>{group.spotsLeft} spots left</span>
                    </div>
                  </div>
                </div>

                <div className={styles.groupActions}>
                  {isFull ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className={styles.fullBadge}>Full</Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        This group has reached its maximum capacity.
                      </TooltipContent>
                    </Tooltip>
                  ) : isPending ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button className={styles.groupActionBtn} variant="outline" disabled>
                          <Clock size={16} />
                          Request Sent
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Awaiting approval from group admins.
                      </TooltipContent>
                    </Tooltip>
                  ) : isApproved ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button className={styles.groupActionBtn} variant="outline" disabled>
                          <CheckCircle size={16} />
                          Approved
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        You are already a member of this group.
                      </TooltipContent>
                    </Tooltip>
                  ) : isRejected ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          className={styles.groupActionBtn}
                          variant="outline"
                          onClick={() => handleRequestJoin(group.id)}
                          disabled={joiningGroupId === group.id}
                        >
                          {joiningGroupId === group.id ? (
                            <Loader2 size={16} className={styles.spinner} />
                          ) : (
                            <RefreshCw size={16} />
                          )}
                          Try Again
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Your previous request was not approved. You can submit a new request.
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Button
                      className={styles.groupActionBtn}
                      onClick={() => handleRequestJoin(group.id)}
                      disabled={joiningGroupId === group.id}
                    >
                      {joiningGroupId === group.id ? (
                        <Loader2 size={16} className={styles.spinner} />
                      ) : (
                        <UserCheck size={16} />
                      )}
                      Request to Join
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {!isActiveLoading && !activeError && activeTab === 'inbox' && filteredInbox.length === 0 && (
        <EmptyState
          icon={MessageCircle}
          title="No nearby conversations"
          description="Start a chat and it will show up here."
          actionLabel="Find Travellers"
          onAction={() => setActiveTab('travellers')}
        />
      )}

      {!isActiveLoading && !activeError && activeTab === 'inbox' && filteredInbox.length > 0 && (
        <motion.div className={styles.inboxList} variants={containerVariants}>
          {filteredInbox.map((item) => {
            const displayDestination = normalizeDestination(item.destination || '');
            const previewText = formatInboxPreview(item);
            const previewTime = formatInboxTimestamp(item.lastMessageAt);

            return (
              <motion.div key={item.conversationId} className={styles.inboxCard} variants={itemVariants}>
                <div className={styles.inboxTop}>
                  <img
                    src={item.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.userId}`}
                    alt={item.name}
                    className={styles.inboxAvatar}
                  />
                  <div className={styles.inboxInfo}>
                    <div className={styles.inboxNameRow}>
                      <button
                        type="button"
                        className={`${styles.inboxName} ${styles.nameButton}`}
                        onClick={() => handleOpenProfile(item.userId)}
                      >
                        {item.name}
                      </button>
                      {item.unreadCount > 0 && (
                        <span className={styles.unreadBadge}>{item.unreadCount}</span>
                      )}
                    </div>
                    <div className={styles.inboxMetaRow}>
                      <span className={styles.inboxMetaItem}>
                        <MapPin size={14} />
                        {displayDestination || 'Destination TBD'}
                      </span>
                      {item.travelDates && (
                        <span className={styles.inboxMetaItem}>
                          <Calendar size={14} />
                          {item.travelDates}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.inboxPreviewRow}>
                  <span className={styles.inboxPreview}>{previewText}</span>
                  {previewTime && <span className={styles.inboxTime}>{previewTime}</span>}
                </div>

                <div className={styles.inboxActions}>
                  <button
                    className={`btn btn-primary ${styles.actionBtn}`}
                    onClick={() => handleOpenMessage(
                      { userId: item.userId, name: item.name, profileImage: item.profileImage || '' },
                      item.conversationId
                    )}
                  >
                    <MessageCircle size={16} />
                    Open Chat
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <InviteToGroupModal
        isOpen={Boolean(inviteTarget)}
        onClose={() => setInviteTarget(null)}
        userId={inviteTarget?.userId ?? 0}
        userName={inviteTarget?.name ?? 'Traveller'}
      />
    </motion.div>
  );
}
