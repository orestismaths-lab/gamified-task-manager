// Members API - Using backend API for multi-user support

import { Member } from '@/types';
import { storage } from '@/lib/storage';
import { API_ENDPOINTS } from '@/lib/constants';

export const membersAPI = {
  // Get all members: users from API + members from localStorage (without userId)
  getMembers: async (): Promise<Member[]> => {
    try {
      const res = await fetch(API_ENDPOINTS.MEMBERS);
      if (!res.ok) {
        console.error('Failed to fetch members from API, falling back to localStorage');
        return storage.getMembers();
      }
      const data = (await res.json()) as { members: Member[] };
      const apiMembers = data.members;
      
      // Get members from localStorage (may include members without userId)
      const localMembers = storage.getMembers();
      
      // Merge: API members (users with userId) + local members without userId
      const apiMemberIds = new Set(apiMembers.map(m => m.id));
      const membersWithoutUserId = localMembers.filter(m => !m.userId || !apiMemberIds.has(m.id));
      
      // Combine: API members + local members that don't have userId or aren't in API
      return [...apiMembers, ...membersWithoutUserId];
    } catch (error) {
      console.error('Error fetching members from API:', error);
      // Fallback to localStorage for offline support
      return storage.getMembers();
    }
  },

  // Get single member
  getMember: async (memberId: string): Promise<Member | null> => {
    const members = storage.getMembers();
    return members.find(m => m.id === memberId) || null;
  },

  // Get member by userId
  getMemberByUserId: async (userId: string): Promise<Member | null> => {
    const members = storage.getMembers();
    return members.find(m => m.userId === userId) || null;
  },

  // Create member (userId is optional - allows creating members without user accounts)
  createMember: async (member: Omit<Member, 'id' | 'xp' | 'level'>, userId?: string): Promise<string> => {
    if (!member.name || member.name.trim().length === 0) {
      throw new Error('Member name is required');
    }
    
    const members = storage.getMembers();
    const newMember: Member = {
      ...member,
      id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: member.name.trim(),
      userId: userId || undefined, // Optional - allows members without user accounts
      xp: 0,
      level: 1,
    };
    
    members.push(newMember);
    storage.saveMembers(members);
    return newMember.id;
  },

  // Update member
  updateMember: async (memberId: string, updates: Partial<Member>): Promise<void> => {
    if (!memberId || memberId.trim().length === 0) {
      throw new Error('Member ID is required');
    }
    
    const members = storage.getMembers();
    const index = members.findIndex(m => m.id === memberId);
    if (index === -1) {
      throw new Error('Member not found');
    }
    
    if (updates.name && typeof updates.name === 'string') {
      const trimmedName = updates.name.trim();
      if (trimmedName.length === 0) {
        throw new Error('Member name cannot be empty');
      }
      updates.name = trimmedName;
    }
    
    members[index] = { ...members[index], ...updates };
    storage.saveMembers(members);
  },

  // Delete member
  deleteMember: async (memberId: string): Promise<void> => {
    const members = storage.getMembers();
    const filtered = members.filter(m => m.id !== memberId);
    storage.saveMembers(filtered);
  },

  // Real-time listener (simplified - polls API every 2 seconds)
  subscribeToMembers: (callback: (members: Member[]) => void): (() => void) => {
    // Helper function to fetch members
    const fetchMembers = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.MEMBERS);
        if (!res.ok) {
          throw new Error('Failed to fetch members');
        }
        const data = (await res.json()) as { members: Member[] };
        return data.members;
      } catch (error) {
        console.error('Error fetching members:', error);
        // Fallback to localStorage on error
        return storage.getMembers();
      }
    };

    // Call immediately with current members from API
    fetchMembers().then(callback);
    
    // Poll every 2 seconds for changes
    const interval = setInterval(() => {
      fetchMembers().then(callback);
    }, 2000);
    
    return () => clearInterval(interval);
  },
};
