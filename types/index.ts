// Core Data Types for the Gamified Task Manager

export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in-progress' | 'in-review' | 'blocked' | 'completed';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface RecurrenceConfig {
  type: RecurrenceType;
  interval?: number; // e.g., every 2 weeks
  endDate?: string; // ISO date string - when to stop recurring
  count?: number; // How many times to recur
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  ownerId: string; // Primary owner (legacy, kept for backward compatibility)
  priority: Priority;
  status: TaskStatus;
  dueDate: string; // ISO date string
  tags: string[];
  subtasks: Subtask[];
  completed: boolean; // Legacy field - kept for backward compatibility
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  recurrence?: RecurrenceConfig;
  parentRecurringTaskId?: string; // Link to the original recurring task template
  dependsOn?: string[]; // Array of task IDs this task depends on
  blocks?: string[]; // Array of task IDs this task blocks
  timeSpent?: number; // Total time spent in minutes
  timeEstimate?: number; // Estimated time in minutes
  timeEntries?: TimeEntry[]; // Individual time tracking entries
  comments?: TaskComment[]; // Comments/activity log
  // Multi-user support
  assignedTo?: string[]; // Array of member IDs assigned to this task
  createdBy?: string; // User ID who created this task (Firebase Auth UID)
}

export interface TimeEntry {
  id: string;
  startTime: string; // ISO date string
  endTime?: string; // ISO date string
  duration?: number; // Duration in minutes
  description?: string;
}

export interface TaskComment {
  id: string;
  authorId: string;
  content: string;
  createdAt: string; // ISO date string
  type?: 'comment' | 'activity'; // activity = system generated
}

export interface Member {
  id: string;
  name: string;
  xp: number;
  level: number;
  avatar?: string; // Optional avatar URL or emoji
  userId?: string; // Firebase Auth UID (for multi-user)
  email?: string; // User email (for multi-user)
}

export interface TaskManagerState {
  tasks: Task[];
  members: Member[];
  selectedMemberId: string | null;
}

// XP Calculation Constants
export const XP_CONSTANTS = {
  TASK_COMPLETE: 50,
  SUBTASK_COMPLETE: 10,
  XP_PER_LEVEL: 100, // Base XP needed per level (can be scaled)
} as const;

// Level calculation: level = floor(xp / XP_PER_LEVEL) + 1
export function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_CONSTANTS.XP_PER_LEVEL) + 1;
}

export function getXPForNextLevel(xp: number): number {
  const currentLevel = calculateLevel(xp);
  const xpForCurrentLevel = (currentLevel - 1) * XP_CONSTANTS.XP_PER_LEVEL;
  return currentLevel * XP_CONSTANTS.XP_PER_LEVEL - xp;
}

export function getXPProgress(xp: number): number {
  const currentLevel = calculateLevel(xp);
  const xpForCurrentLevel = (currentLevel - 1) * XP_CONSTANTS.XP_PER_LEVEL;
  const xpForNextLevel = currentLevel * XP_CONSTANTS.XP_PER_LEVEL;
  const progress = ((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
  return Math.max(0, Math.min(100, progress));
}

