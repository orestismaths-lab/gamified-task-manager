// Backup and restore utilities for data safety

import { Task, Member } from '@/types';
import { storage } from './storage';

export const backup = {
  // Export all data as JSON
  exportData: (): string => {
    const tasks = storage.getTasks();
    const members = storage.getMembers();
    const selectedMemberId = storage.getSelectedMemberId();

    const data = {
      tasks,
      members,
      selectedMemberId,
      exportDate: new Date().toISOString(),
      version: '1.0',
    };

    return JSON.stringify(data, null, 2);
  },

  // Import data from JSON
  importData: (jsonData: string): { success: boolean; error?: string } => {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.tasks && Array.isArray(data.tasks)) {
        storage.saveTasks(data.tasks);
      }
      
      if (data.members && Array.isArray(data.members)) {
        storage.saveMembers(data.members);
      }
      
      if (data.selectedMemberId) {
        storage.saveSelectedMemberId(data.selectedMemberId);
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  // Download data as file
  downloadBackup: (): void => {
    const data = backup.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Get storage info
  getStorageInfo: () => {
    if (typeof window === 'undefined') return null;

    const tasks = storage.getTasks();
    const members = storage.getMembers();
    
    let totalSize = 0;
    const keys = [
      'gamified-task-manager-tasks',
      'gamified-task-manager-members',
      'gamified-task-manager-selected-member',
    ];

    keys.forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        totalSize += new Blob([item]).size;
      }
    });

    return {
      tasksCount: tasks.length,
      membersCount: members.length,
      totalSizeBytes: totalSize,
      totalSizeKB: (totalSize / 1024).toFixed(2),
      lastBackup: null, // Could be stored in localStorage
    };
  },
};

