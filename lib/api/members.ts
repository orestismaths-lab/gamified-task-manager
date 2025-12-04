// Members API - Using localStorage (Firebase disabled)

import { Member } from '@/types';
import { storage } from '@/lib/storage';

export const membersAPI = {
  // Get all members
  getMembers: async (): Promise<Member[]> => {
    return storage.getMembers();
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

  // Create member
  createMember: async (member: Omit<Member, 'id' | 'xp' | 'level'>, userId: string): Promise<string> => {
    if (!member.name || member.name.trim().length === 0) {
      throw new Error('Member name is required');
    }
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
    
    const members = storage.getMembers();
    const newMember: Member = {
      ...member,
      id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: member.name.trim(),
      userId,
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

  // Real-time listener (simplified - just return current members)
  subscribeToMembers: (callback: (members: Member[]) => void): (() => void) => {
    // Call immediately with current members
    const members = storage.getMembers();
    callback(members);
    
    // Poll every 2 seconds for changes (simplified real-time)
    const interval = setInterval(() => {
      const currentMembers = storage.getMembers();
      callback(currentMembers);
    }, 2000);
    
    return () => clearInterval(interval);
  },
};
