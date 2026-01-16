import { useState, useCallback } from 'react';
import { groupsAPI } from '@/features/travellers/travellersAPI';
import type { Group, InviteMember, Proposal, ProposalFormData } from '@/types/travellers';

/**
 * Hook for managing groups
 */
export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<InviteMember[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async (status?: 'PLANNING' | 'ON_TOUR' | 'COMPLETED') => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await groupsAPI.getGroups(status);
      setGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch groups');
      console.error('fetchGroups error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchGroupDetails = useCallback(async (groupId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch group details first (required)
      const group = await groupsAPI.getGroupDetails(groupId);
      setCurrentGroup(group);

      // Fetch members and polls separately - these can fail without breaking the page
      const [groupMembers, polls] = await Promise.all([
        groupsAPI.getGroupMembers(groupId).catch((err) => {
          console.warn('Failed to fetch members:', err);
          return [];
        }),
        groupsAPI.getPolls(groupId).catch((err) => {
          console.warn('Failed to fetch polls:', err);
          return [];
        }),
      ]);
      // API returns { members: [...], pagination: {...} } - extract the members array
      const membersArray = Array.isArray(groupMembers) ? groupMembers : (groupMembers?.members || []);
      setMembers(membersArray);
      setProposals(Array.isArray(polls) ? polls : []);
    } catch (err) {
      setError('Failed to fetch group details');
      console.error('fetchGroupDetails error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createGroup = useCallback(async (groupData: Omit<Group, 'id' | 'inviteCode' | 'createdBy'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const newGroup = await groupsAPI.createGroup(groupData);
      setGroups((prev) => [...prev, newGroup]);
      return newGroup;
    } catch (err) {
      setError('Failed to create group');
      console.error('createGroup error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateGroup = useCallback(async (groupId: string, groupData: Partial<Group>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await groupsAPI.updateGroup(groupId, groupData);
      setGroups((prev) => prev.map((g) => (g.id === groupId ? updated : g)));
      if (currentGroup?.id === groupId) {
        setCurrentGroup(updated);
      }
      return updated;
    } catch (err) {
      setError('Failed to update group');
      console.error('updateGroup error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentGroup]);

  const deleteGroup = useCallback(async (groupId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await groupsAPI.deleteGroup(groupId);
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      if (currentGroup?.id === groupId) {
        setCurrentGroup(null);
      }
    } catch (err) {
      setError('Failed to delete group');
      console.error('deleteGroup error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentGroup]);

  const inviteMember = useCallback(async (groupId: string, email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const newMember = await groupsAPI.inviteMember(groupId, email);
      setMembers((prev) => [...prev, newMember]);
      return newMember;
    } catch (err) {
      setError('Failed to invite member');
      console.error('inviteMember error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeMember = useCallback(async (groupId: string, memberId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await groupsAPI.removeMember(groupId, memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err) {
      setError('Failed to remove member');
      console.error('removeMember error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const leaveGroup = useCallback(async (groupId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await groupsAPI.leaveGroup(groupId);
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      if (currentGroup?.id === groupId) {
        setCurrentGroup(null);
      }
    } catch (err) {
      setError('Failed to leave group');
      console.error('leaveGroup error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentGroup]);

  const createProposal = useCallback(async (groupId: string, proposalData: ProposalFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const newProposal = await groupsAPI.createProposal(groupId, proposalData);
      setProposals((prev) => [...prev, newProposal]);
      return newProposal;
    } catch (err) {
      setError('Failed to create proposal');
      console.error('createProposal error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const voteOnProposal = useCallback(async (groupId: string, pollId: string, optionId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await groupsAPI.voteOnProposal(groupId, pollId, optionId);
      setProposals((prev) => prev.map((p) => (p.id === pollId ? updated : p)));
      return updated;
    } catch (err) {
      setError('Failed to vote on proposal');
      console.error('voteOnProposal error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchGroups = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await groupsAPI.searchGroups(query);
      return Array.isArray(results) ? results : [];
    } catch (err) {
      setError('Failed to search groups');
      console.error('searchGroups error:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestToJoin = useCallback(async (groupId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await groupsAPI.requestToJoin(groupId);
    } catch (err) {
      setError('Failed to request to join group');
      console.error('requestToJoin error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    groups,
    currentGroup,
    members,
    proposals,
    isLoading,
    error,
    fetchGroups,
    fetchGroupDetails,
    createGroup,
    updateGroup,
    deleteGroup,
    inviteMember,
    removeMember,
    leaveGroup,
    createProposal,
    voteOnProposal,
    searchGroups,
    requestToJoin,
  };
}
