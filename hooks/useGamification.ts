// Hook for handling XP and level calculations

import { useCallback } from 'react';
import { Member, XP_CONSTANTS, calculateLevel, getXPProgress } from '@/types';
import { storage } from '@/lib/storage';

export function useGamification() {
  const addXP = useCallback((memberId: string, xpAmount: number): Member | null => {
    const members = storage.getMembers();
    const member = members.find(m => m.id === memberId);
    
    if (!member) return null;

    const newXP = Math.max(0, member.xp + xpAmount);
    const newLevel = calculateLevel(newXP);
    const wasLevelUp = newLevel > member.level;

    const updatedMember: Member = {
      ...member,
      xp: newXP,
      level: newLevel,
    };

    const updatedMembers = members.map(m => 
      m.id === memberId ? updatedMember : m
    );

    storage.saveMembers(updatedMembers);

    return wasLevelUp ? updatedMember : null;
  }, []);

  const removeXP = useCallback((memberId: string, xpAmount: number): Member | null => {
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

