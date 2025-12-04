// Members API - Using backend API for database storage

import { Member } from '@/types';
import { storage } from '@/lib/storage';
import { API_ENDPOINTS } from '@/lib/constants';

export const membersAPI = {
  // Get all members from database (NO localStorage fallback when logged in)
  getMembers: async (): Promise<Member[]> => {
    try {
      const res = await fetch(API_ENDPOINTS.MEMBERS, {
        credentials: 'include', // Include cookies for session
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[getMembers] Failed to fetch members: ${res.status} ${errorText}`);
        throw new Error(`Failed to fetch members: ${res.status}`);
      }
      const data = (await res.json()) as { members: Member[] };
      console.log(`[getMembers] Fetched ${data.members.length} members from database`);
      return data.members;
    } catch (error) {
      console.error('[getMembers] Error fetching members from API:', error);
      // NO localStorage fallback - throw error instead
      throw error;
    }
  },

  // Get single member from database
  getMember: async (memberId: string): Promise<Member | null> => {
    try {
      const res = await fetch(API_ENDPOINTS.MEMBER_BY_ID(memberId), {
        credentials: 'include', // Include cookies for session
      });
      if (!res.ok) {
        console.error(`[getMember] Failed to fetch member ${memberId}: ${res.status}`);
        return null;
      }
      const data = (await res.json()) as { member: Member };
      return data.member;
    } catch (error) {
      console.error(`[getMember] Error fetching member ${memberId}:`, error);
      return null;
    }
  },

  // Get member by userId (same as getMember since userId === memberId)
  getMemberByUserId: async (userId: string): Promise<Member | null> => {
    return membersAPI.getMember(userId);
  },

  // Create member - members are now users, so this is only for updating user profile
  // For creating new users, use auth/register endpoint
  createMember: async (member: Omit<Member, 'id' | 'xp' | 'level'>, userId?: string): Promise<string> => {
    if (!member.name || member.name.trim().length === 0) {
      throw new Error('Member name is required');
    }
    
    // If userId is provided, update the user's profile
    if (userId) {
      try {
        const res = await fetch(API_ENDPOINTS.MEMBER_BY_ID(userId), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: member.name.trim(),
            avatar: member.avatar,
          }),
        });
        
        if (!res.ok) {
          throw new Error('Failed to update member');
        }
        
        const data = (await res.json()) as { member: Member };
        return data.member.id;
      } catch (error) {
        console.error('[createMember] Error updating member:', error);
        throw error;
      }
    }
    
    // If no userId, this is a legacy case - members must be users now
    // Fallback to localStorage only for non-logged-in users
    const members = storage.getMembers();
    const newMember: Member = {
      ...member,
      id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: member.name.trim(),
      xp: 0,
      level: 1,
    };
    
    members.push(newMember);
    storage.saveMembers(members);
    return newMember.id;
  },

  // Update member in database
  updateMember: async (memberId: string, updates: Partial<Member>): Promise<void> => {
    if (!memberId || memberId.trim().length === 0) {
      throw new Error('Member ID is required');
    }
    
    try {
      const updateData: { name?: string; avatar?: string } = {};
      if (updates.name && typeof updates.name === 'string') {
        const trimmedName = updates.name.trim();
        if (trimmedName.length === 0) {
          throw new Error('Member name cannot be empty');
        }
        updateData.name = trimmedName;
      }
      if (updates.avatar !== undefined) {
        updateData.avatar = updates.avatar || null;
      }
      
      const res = await fetch(API_ENDPOINTS.MEMBER_BY_ID(memberId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[updateMember] Failed to update member: ${res.status} ${errorText}`);
        throw new Error(`Failed to update member: ${res.status}`);
      }
    } catch (error) {
      console.error('[updateMember] Error updating member:', error);
      throw error;
    }
  },

  // Delete member - members are users, so deletion should be done via admin/users endpoint
  // This is kept for backward compatibility but should not be used for logged-in users
  deleteMember: async (memberId: string): Promise<void> => {
    // For logged-in users, members are users and should be deleted via admin endpoint
    // For non-logged-in users, fallback to localStorage
    const members = storage.getMembers();
    const filtered = members.filter(m => m.id !== memberId);
    storage.saveMembers(filtered);
  },

  // Real-time listener (polls API every 2 seconds)
  subscribeToMembers: (callback: (members: Member[]) => void): (() => void) => {
    const fetchMembers = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.MEMBERS, {
          credentials: 'include', // Include cookies for session
        });
        if (!res.ok) {
          const errorText = await res.text();
          console.error(`[subscribeToMembers] Failed to fetch members: ${res.status} ${errorText}`);
          throw new Error(`Failed to fetch members: ${res.status}`);
        }
        const data = (await res.json()) as { members: Member[] };
        console.log(`[subscribeToMembers] Fetched ${data.members.length} members from database`);
        callback(data.members);
      } catch (error) {
        console.error('[subscribeToMembers] Error fetching members:', error);
        // NO localStorage fallback - return empty array instead
        callback([]);
      }
    };

    // Call immediately
    fetchMembers();
    
    // Poll every 2 seconds for changes
    const interval = setInterval(fetchMembers, 2000);
    
    return () => clearInterval(interval);
  },
};
