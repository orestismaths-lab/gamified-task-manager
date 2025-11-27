// LocalStorage utilities for persistence

import { Task, Member } from '@/types';

const STORAGE_KEYS = {
  TASKS: 'gamified-task-manager-tasks',
  MEMBERS: 'gamified-task-manager-members',
  SELECTED_MEMBER: 'gamified-task-manager-selected-member',
} as const;

export const storage = {
  // Tasks
  getTasks: (): Task[] => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
      return [];
    }
  },

  saveTasks: (tasks: Task[]): void => {
    if (typeof window === 'undefined') return;
    try {
      const serialized = JSON.stringify(tasks);
      localStorage.setItem(STORAGE_KEYS.TASKS, serialized);
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
      // Try to handle quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('LocalStorage quota exceeded. Consider exporting data.');
      }
    }
  },

  // Members
  getMembers: (): Member[] => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading members from localStorage:', error);
      return [];
    }
  },

  saveMembers: (members: Member[]): void => {
    if (typeof window === 'undefined') return;
    try {
      const serialized = JSON.stringify(members);
      localStorage.setItem(STORAGE_KEYS.MEMBERS, serialized);
    } catch (error) {
      console.error('Error saving members to localStorage:', error);
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('LocalStorage quota exceeded. Consider exporting data.');
      }
    }
  },

  // Selected Member
  getSelectedMemberId: (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(STORAGE_KEYS.SELECTED_MEMBER);
    } catch (error) {
      console.error('Error loading selected member from localStorage:', error);
      return null;
    }
  },

  saveSelectedMemberId: (memberId: string | null): void => {
    if (typeof window === 'undefined') return;
    try {
      if (memberId) {
        localStorage.setItem(STORAGE_KEYS.SELECTED_MEMBER, memberId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.SELECTED_MEMBER);
      }
    } catch (error) {
      console.error('Error saving selected member to localStorage:', error);
    }
  },

  // Clear all data (for testing/reset)
  clearAll: (): void => {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },
};

