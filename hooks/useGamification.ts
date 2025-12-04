// Hook for handling XP and level calculations
// Now uses database API instead of localStorage

import { useCallback } from 'react';
import { Member, XP_CONSTANTS, calculateLevel, getXPProgress } from '@/types';
import { API_ENDPOINTS } from '@/lib/constants';

export function useGamification() {
  const addXP = useCallback(async (memberId: string, xpAmount: number): Promise<Member | null> => {
    try {
      const res = await fetch(`${API_ENDPOINTS.MEMBERS}/${memberId}/xp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for session
        body: JSON.stringify({ amount: xpAmount }),
      });

      if (!res.ok) {
        console.error(`[addXP] Failed to update XP: ${res.status}`);
        return null;
      }

      const data = (await res.json()) as { member: Member; wasLevelUp: boolean };
      
      // Return member if level up, null otherwise
      return data.wasLevelUp ? data.member : null;
    } catch (error) {
      console.error('[addXP] Error updating XP:', error);
      return null;
    }
  }, []);

  const removeXP = useCallback(async (memberId: string, xpAmount: number): Promise<Member | null> => {
    return addXP(memberId, -xpAmount);
  }, [addXP]);

  const getMemberProgress = useCallback((member: Member) => {
    return {
      level: member.level,
      xp: member.xp,
      progress: getXPProgress(member.xp),
      xpForNextLevel: calculateLevel(member.xp) * XP_CONSTANTS.XP_PER_LEVEL,
    };
  }, []);

  return {
    addXP,
    removeXP,
    getMemberProgress,
    XP_CONSTANTS,
  };
}

