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
      console.log('[backup.importData] Starting import, data length:', jsonData?.length || 0);
      
      if (!jsonData || typeof jsonData !== 'string' || jsonData.trim().length === 0) {
        console.error('[backup.importData] Empty or invalid JSON data');
        return { success: false, error: 'Empty or invalid JSON data' };
      }

      let data;
      try {
        data = JSON.parse(jsonData);
        console.log('[backup.importData] JSON parsed, keys:', Object.keys(data || {}));
      } catch (parseError) {
        console.error('[backup.importData] JSON parse error:', parseError);
        return { 
          success: false, 
          error: `Invalid JSON format: ${parseError instanceof Error ? parseError.message : 'Parse error'}` 
        };
      }

      if (!data || typeof data !== 'object') {
        console.error('[backup.importData] Data is not an object');
        return { success: false, error: 'Invalid backup file: data must be an object' };
      }

      // Import tasks if present
      if (data.tasks !== undefined) {
        console.log('[backup.importData] Found tasks array, length:', data.tasks?.length || 0);
        if (!Array.isArray(data.tasks)) {
          console.error('[backup.importData] Tasks is not an array:', typeof data.tasks);
          return { success: false, error: 'Invalid backup file: tasks must be an array' };
        }
        try {
          console.log('[backup.importData] Saving tasks to localStorage...');
          storage.saveTasks(data.tasks);
          const savedTasks = storage.getTasks();
          console.log('[backup.importData] Tasks saved, verification count:', savedTasks.length);
        } catch (saveError) {
          console.error('[backup.importData] Error saving tasks:', saveError);
          return { 
            success: false, 
            error: `Failed to save tasks: ${saveError instanceof Error ? saveError.message : 'Unknown error'}` 
          };
        }
      } else {
        console.log('[backup.importData] No tasks found in backup');
      }
      
      // Import members if present
      if (data.members !== undefined) {
        console.log('[backup.importData] Found members array, length:', data.members?.length || 0);
        if (!Array.isArray(data.members)) {
          console.error('[backup.importData] Members is not an array:', typeof data.members);
          return { success: false, error: 'Invalid backup file: members must be an array' };
        }
        try {
          console.log('[backup.importData] Saving members to localStorage...');
          storage.saveMembers(data.members);
          const savedMembers = storage.getMembers();
          console.log('[backup.importData] Members saved, verification count:', savedMembers.length);
        } catch (saveError) {
          console.error('[backup.importData] Error saving members:', saveError);
          return { 
            success: false, 
            error: `Failed to save members: ${saveError instanceof Error ? saveError.message : 'Unknown error'}` 
          };
        }
      } else {
        console.log('[backup.importData] No members found in backup');
      }
      
      // Import selected member ID if present
      if (data.selectedMemberId !== undefined) {
        console.log('[backup.importData] Saving selected member ID:', data.selectedMemberId);
        try {
          storage.saveSelectedMemberId(data.selectedMemberId);
        } catch (saveError) {
          // This is not critical, so we just log it
          console.warn('[backup.importData] Failed to save selected member ID:', saveError);
        }
      }

      console.log('[backup.importData] Import completed successfully');
      return { success: true };
    } catch (error) {
      console.error('[backup.importData] Unexpected error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during import' 
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

