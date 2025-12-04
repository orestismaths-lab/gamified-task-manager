// Tasks API - Using backend API for multi-device sync

import { Task } from '@/types';
import { storage } from '@/lib/storage';
import { API_ENDPOINTS } from '@/lib/constants';

export const tasksAPI = {
  // Get all tasks from backend API (NO localStorage fallback - always use database)
  getTasks: async (): Promise<Task[]> => {
    try {
      const res = await fetch(API_ENDPOINTS.TASKS || '/api/tasks', {
        credentials: 'include', // Include cookies for session
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[getTasks] Failed to fetch tasks: ${res.status} ${errorText}`);
        throw new Error(`Failed to fetch tasks: ${res.status}`);
      }
      const data = (await res.json()) as { tasks: Task[] };
      console.log(`[getTasks] Fetched ${data.tasks.length} tasks from database`);
      return data.tasks;
    } catch (error) {
      console.error('[getTasks] Error fetching tasks from API:', error);
      // NO localStorage fallback - throw error instead
      throw error;
    }
  },

  // Get single task from backend API (NO localStorage fallback - always use database)
  getTask: async (taskId: string): Promise<Task | null> => {
    try {
      const res = await fetch(API_ENDPOINTS.TASK_BY_ID(taskId), {
        credentials: 'include', // Include cookies for session
      });
      if (!res.ok) {
        console.error(`[getTask] Failed to fetch task ${taskId}: ${res.status}`);
        return null;
      }
      const data = (await res.json()) as { task: Task };
      return data.task;
    } catch (error) {
      console.error(`[getTask] Error fetching task ${taskId}:`, error);
      // NO localStorage fallback - return null instead
      return null;
    }
  },

  // Create task via backend API (NO localStorage fallback - always use database)
  createTask: async (task: Partial<Task>, userId: string): Promise<string> => {
    try {
      const res = await fetch(API_ENDPOINTS.TASKS || '/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for session
        body: JSON.stringify(task),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[createTask] Failed to create task: ${res.status} ${errorText}`);
        throw new Error(`Failed to create task: ${res.status}`);
      }
      
      const data = (await res.json()) as { task: Task };
      console.log(`[createTask] Created task "${data.task.title}" with ID ${data.task.id} in database`);
      return data.task.id;
    } catch (error) {
      console.error('[createTask] Error creating task via API:', error);
      // NO localStorage fallback - throw error instead
      throw error;
    }
  },

  // Update task via backend API (NO localStorage fallback - always use database)
  updateTask: async (taskId: string, updates: Partial<Task>): Promise<void> => {
    try {
      const res = await fetch(`${API_ENDPOINTS.TASKS || '/api/tasks'}/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for session
        body: JSON.stringify(updates),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[updateTask] Failed to update task ${taskId}: ${res.status} ${errorText}`);
        throw new Error(`Failed to update task: ${res.status}`);
      }
      console.log(`[updateTask] Updated task ${taskId} in database`);
    } catch (error) {
      console.error(`[updateTask] Error updating task ${taskId}:`, error);
      // NO localStorage fallback - throw error instead
      throw error;
    }
  },

  // Delete task via backend API (NO localStorage fallback - always use database)
  deleteTask: async (taskId: string): Promise<void> => {
    try {
      const res = await fetch(`${API_ENDPOINTS.TASKS || '/api/tasks'}/${taskId}`, {
        method: 'DELETE',
        credentials: 'include', // Include cookies for session
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[deleteTask] Failed to delete task ${taskId}: ${res.status} ${errorText}`);
        throw new Error(`Failed to delete task: ${res.status}`);
      }
      console.log(`[deleteTask] Deleted task ${taskId} from database`);
    } catch (error) {
      console.error(`[deleteTask] Error deleting task ${taskId}:`, error);
      // NO localStorage fallback - throw error instead
      throw error;
    }
  },

  // Real-time listener (fetches from API)
  subscribeToTasks: (
    callback: (tasks: Task[]) => void,
    filter?: { assignedTo?: string }
  ): (() => void) => {
    const fetchAndCallback = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.TASKS || '/api/tasks', {
          credentials: 'include', // Include cookies for session
        });
        if (!res.ok) {
          const errorText = await res.text();
          console.error(`[subscribeToTasks] Failed to fetch tasks: ${res.status} ${errorText}`);
          throw new Error(`Failed to fetch tasks: ${res.status}`);
        }
        const data = (await res.json()) as { tasks: Task[] };
        // Backend already filters by user.id, so we get all tasks for the logged-in user
        console.log(`[subscribeToTasks] Fetched ${data.tasks.length} tasks from API`);
        callback(data.tasks);
      } catch (error) {
        console.error('[subscribeToTasks] Error fetching tasks:', error);
        // NO localStorage fallback - return empty array instead
        // All tasks must be stored in database, not localStorage
        console.warn('[subscribeToTasks] Failed to fetch from database, returning empty array (no localStorage fallback)');
        callback([]);
      }
    };
    
    // Call immediately
    fetchAndCallback();
    
    // Poll every 2 seconds for changes
    const interval = setInterval(fetchAndCallback, 2000);
    
    return () => clearInterval(interval);
  },
};
