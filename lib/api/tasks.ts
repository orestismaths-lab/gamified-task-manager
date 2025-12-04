// Tasks API - Using localStorage (Firebase disabled)

import { Task } from '@/types';
import { storage } from '@/lib/storage';

export const tasksAPI = {
  // Get all tasks
  getTasks: async (): Promise<Task[]> => {
    return storage.getTasks();
  },

  // Get single task
  getTask: async (taskId: string): Promise<Task | null> => {
    const tasks = storage.getTasks();
    return tasks.find(t => t.id === taskId) || null;
  },

  // Create task
  createTask: async (task: Partial<Task>, userId: string): Promise<string> => {
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
  },

  // Update task
  updateTask: async (taskId: string, updates: Partial<Task>): Promise<void> => {
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
  },

  // Delete task
  deleteTask: async (taskId: string): Promise<void> => {
    const tasks = storage.getTasks();
    const filtered = tasks.filter(t => t.id !== taskId);
    storage.saveTasks(filtered);
  },

  // Real-time listener (simplified - just return current tasks)
  subscribeToTasks: (
    callback: (tasks: Task[]) => void,
    filter?: { assignedTo?: string }
  ): (() => void) => {
    // Call immediately with current tasks
    let tasks = storage.getTasks();
    if (filter?.assignedTo) {
      tasks = tasks.filter(t => t.assignedTo?.includes(filter.assignedTo!));
    }
    callback(tasks);
    
    // Poll every 2 seconds for changes (simplified real-time)
    const interval = setInterval(() => {
      let currentTasks = storage.getTasks();
      if (filter?.assignedTo) {
        currentTasks = currentTasks.filter(t => t.assignedTo?.includes(filter.assignedTo!));
      }
      callback(currentTasks);
    }, 2000);
    
    return () => clearInterval(interval);
  },
};
