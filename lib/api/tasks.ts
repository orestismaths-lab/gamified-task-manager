// Tasks API - Using backend API for multi-device sync

import { Task } from '@/types';
import { storage } from '@/lib/storage';
import { API_ENDPOINTS } from '@/lib/constants';

export const tasksAPI = {
  // Get all tasks from backend API
  getTasks: async (): Promise<Task[]> => {
    try {
      const res = await fetch(API_ENDPOINTS.TASKS || '/api/tasks');
      if (!res.ok) {
        console.error('Failed to fetch tasks from API, falling back to localStorage');
        return storage.getTasks();
      }
      const data = (await res.json()) as { tasks: Task[] };
      return data.tasks;
    } catch (error) {
      console.error('Error fetching tasks from API:', error);
      // Fallback to localStorage for offline support
      return storage.getTasks();
    }
  },

  // Get single task from backend API
  getTask: async (taskId: string): Promise<Task | null> => {
    try {
      const res = await fetch(`${API_ENDPOINTS.TASKS || '/api/tasks'}/${taskId}`);
      if (!res.ok) {
        console.error('Failed to fetch task from API, falling back to localStorage');
        const tasks = storage.getTasks();
        return tasks.find(t => t.id === taskId) || null;
      }
      const data = (await res.json()) as { task: Task };
      return data.task;
    } catch (error) {
      console.error('Error fetching task from API:', error);
      // Fallback to localStorage
      const tasks = storage.getTasks();
      return tasks.find(t => t.id === taskId) || null;
    }
  },

  // Create task via backend API
  createTask: async (task: Partial<Task>, userId: string): Promise<string> => {
    try {
      const res = await fetch(API_ENDPOINTS.TASKS || '/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      
      if (!res.ok) {
        throw new Error('Failed to create task');
      }
      
      const data = (await res.json()) as { task: Task };
      return data.task.id;
    } catch (error) {
      console.error('Error creating task via API:', error);
      // Fallback to localStorage
      const tasks = storage.getTasks();
      const now = new Date().toISOString();
      const newTask: Task = {
        ...task,
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: task.title || '',
        ownerId: task.ownerId || userId,
        createdBy: userId,
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        dueDate: task.dueDate || now,
        tags: task.tags || [],
        subtasks: task.subtasks || [],
        completed: task.completed || false,
        createdAt: now,
        updatedAt: now,
      } as Task;
      
      tasks.push(newTask);
      storage.saveTasks(tasks);
      return newTask.id;
    }
  },

  // Update task via backend API
  updateTask: async (taskId: string, updates: Partial<Task>): Promise<void> => {
    try {
      const res = await fetch(`${API_ENDPOINTS.TASKS || '/api/tasks'}/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!res.ok) {
        throw new Error('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task via API:', error);
      // Fallback to localStorage
      const tasks = storage.getTasks();
      const index = tasks.findIndex(t => t.id === taskId);
      if (index === -1) {
        throw new Error('Task not found');
      }
      
      tasks[index] = {
        ...tasks[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      storage.saveTasks(tasks);
    }
  },

  // Delete task via backend API
  deleteTask: async (taskId: string): Promise<void> => {
    try {
      const res = await fetch(`${API_ENDPOINTS.TASKS || '/api/tasks'}/${taskId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        throw new Error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task via API:', error);
      // Fallback to localStorage
      const tasks = storage.getTasks();
      const filtered = tasks.filter(t => t.id !== taskId);
      storage.saveTasks(filtered);
    }
  },

  // Real-time listener (fetches from API)
  subscribeToTasks: (
    callback: (tasks: Task[]) => void,
    filter?: { assignedTo?: string }
  ): (() => void) => {
    const fetchAndCallback = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.TASKS || '/api/tasks');
        if (!res.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const data = (await res.json()) as { tasks: Task[] };
        // Backend already filters by user.id, so we get all tasks for the logged-in user
        callback(data.tasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        // Fallback to localStorage
        let tasks = storage.getTasks();
        if (filter?.assignedTo) {
          tasks = tasks.filter(t => t.assignedTo?.includes(filter.assignedTo!));
        }
        callback(tasks);
      }
    };
    
    // Call immediately
    fetchAndCallback();
    
    // Poll every 2 seconds for changes
    const interval = setInterval(fetchAndCallback, 2000);
    
    return () => clearInterval(interval);
  },
};
