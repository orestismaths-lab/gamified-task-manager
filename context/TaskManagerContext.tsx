'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Task, Member, Priority, Subtask, RecurrenceType, TaskStatus } from '@/types';
import { addDays, addWeeks, addMonths, parseISO, format } from 'date-fns';
import { storage } from '@/lib/storage';
import { useGamification } from '@/hooks/useGamification';
import { debounce } from '@/lib/debounce';

interface TaskManagerContextType {
  // State
  tasks: Task[];
  members: Member[];
  selectedMemberId: string | null;
  
  // Task operations
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  
  // Subtask operations
  addSubtask: (taskId: string, subtask: Omit<Subtask, 'id'>) => void;
  updateSubtask: (taskId: string, subtaskId: string, updates: Partial<Subtask>) => void;
  toggleSubtaskComplete: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  
  // Member operations
  addMember: (member: Omit<Member, 'id' | 'xp' | 'level'>) => void;
  updateMember: (id: string, updates: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  setSelectedMember: (memberId: string | null) => void;
  
  // Computed values
  selectedMember: Member | null;
  filteredTasks: Task[];
  filterByOwner: (ownerId: string | null) => void;
  filterByStatus: (status: 'all' | 'active' | 'completed') => void;
  filterByPriority: (priority: Priority | 'all') => void;
  
  // Filters
  activeFilters: {
    ownerId: string | null;
    status: 'all' | 'active' | 'completed';
    priority: Priority | 'all';
    searchQuery: string;
  };
  
  // Search
  setSearchQuery: (query: string) => void;
}

const TaskManagerContext = createContext<TaskManagerContextType | undefined>(undefined);

export function TaskManagerProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    ownerId: null as string | null,
    status: 'all' as 'all' | 'active' | 'completed',
    priority: 'all' as Priority | 'all',
    searchQuery: '',
  });

  const { addXP, removeXP } = useGamification();

  // Load data from localStorage on mount
  useEffect(() => {
    const loadedTasks = storage.getTasks();
    const loadedMembers = storage.getMembers();
    const loadedSelectedMember = storage.getSelectedMemberId();

    // Migrate old tasks to include status field
    const migratedTasks = loadedTasks.map(task => {
      if (!task.status) {
        return {
          ...task,
          status: (task.completed ? 'completed' : 'todo') as TaskStatus,
        };
      }
      return task;
    });

    if (migratedTasks.length !== loadedTasks.length || migratedTasks.some((t, i) => t.status !== loadedTasks[i]?.status)) {
      setTasks(migratedTasks);
      storage.saveTasks(migratedTasks);
    } else {
      setTasks(loadedTasks);
    }

    setMembers(loadedMembers);
    setSelectedMemberId(loadedSelectedMember);

    // Initialize with default member if none exist
    if (loadedMembers.length === 0) {
      const defaultMember: Member = {
        id: 'default-1',
        name: 'You',
        xp: 0,
        level: 1,
      };
      setMembers([defaultMember]);
      storage.saveMembers([defaultMember]);
      setSelectedMemberId(defaultMember.id);
      storage.saveSelectedMemberId(defaultMember.id);
    }
  }, []);

  // Debounced save functions to avoid excessive localStorage writes
  const debouncedSaveTasks = useMemo(
    () => debounce((tasksToSave: Task[]) => {
      storage.saveTasks(tasksToSave);
    }, 500),
    []
  );

  const debouncedSaveMembers = useMemo(
    () => debounce((membersToSave: Member[]) => {
      storage.saveMembers(membersToSave);
    }, 500),
    []
  );

  const debouncedSaveSelectedMember = useMemo(
    () => debounce((memberId: string | null) => {
      storage.saveSelectedMemberId(memberId);
    }, 300),
    []
  );

  // Save to localStorage whenever state changes (debounced)
  useEffect(() => {
    debouncedSaveTasks(tasks);
  }, [tasks, debouncedSaveTasks]);

  useEffect(() => {
    debouncedSaveMembers(members);
  }, [members, debouncedSaveMembers]);

  useEffect(() => {
    debouncedSaveSelectedMember(selectedMemberId);
  }, [selectedMemberId, debouncedSaveSelectedMember]);

  // Generate unique ID
  const generateId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }, []);

  // Task operations
  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...taskData,
      status: taskData.status || (taskData.completed ? 'completed' : 'todo'),
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setTasks(prev => [...prev, newTask]);
  }, [generateId]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, ...updates, updatedAt: new Date().toISOString() }
        : task
    ));
  }, []);

  const deleteTask = useCallback((id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task?.completed && task.ownerId) {
      // Remove XP for completed task
      removeXP(task.ownerId, -50);
      // Remove XP for completed subtasks
      task.subtasks.filter(st => st.completed).forEach(() => {
        removeXP(task.ownerId, -10);
      });
    }
    setTasks(prev => prev.filter(task => task.id !== id));
  }, [tasks, removeXP]);

  const toggleTaskComplete = useCallback((id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newCompleted = !task.completed;
    // When completing, set to 'completed'. When uncompleting, restore to previous status or default to 'todo'
    const newStatus: TaskStatus = newCompleted 
      ? 'completed' 
      : (task.status && task.status !== 'completed' ? task.status : 'todo');
    updateTask(id, { completed: newCompleted, status: newStatus });

    if (task.ownerId) {
      if (newCompleted) {
        // Add XP for completing task
        addXP(task.ownerId, 50);
        // Add XP for already completed subtasks
        task.subtasks.filter(st => st.completed).forEach(() => {
          addXP(task.ownerId!, 10);
        });

        // Handle recurring tasks - create next occurrence
        if (task.recurrence && task.recurrence.type !== 'none' && !task.parentRecurringTaskId) {
          let dueDate: Date;
          try {
            dueDate = parseISO(task.dueDate);
            if (isNaN(dueDate.getTime())) return; // Invalid date
          } catch {
            return; // Invalid date format
          }
          let nextDueDate: Date;

          switch (task.recurrence.type) {
            case 'daily':
              nextDueDate = addDays(dueDate, task.recurrence.interval || 1);
              break;
            case 'weekly':
              nextDueDate = addWeeks(dueDate, task.recurrence.interval || 1);
              break;
            case 'monthly':
              nextDueDate = addMonths(dueDate, task.recurrence.interval || 1);
              break;
            default:
              return;
          }

          // Check if we should stop recurring
          if (task.recurrence.endDate) {
            try {
              const endDate = parseISO(task.recurrence.endDate);
              if (!isNaN(endDate.getTime()) && endDate < nextDueDate) {
                return; // Stop recurring
              }
            } catch {
              // Invalid endDate, continue recurring
            }
          }

          // Create next occurrence
          const now = new Date().toISOString();
          const nextTask: Task = {
            ...task,
            id: generateId(),
            completed: false,
            dueDate: nextDueDate.toISOString(),
            createdAt: now,
            updatedAt: now,
            parentRecurringTaskId: task.id,
            subtasks: task.subtasks.map(st => ({ ...st, completed: false })), // Reset subtasks
          };
          setTasks(prev => [...prev, nextTask]);
        }
      } else {
        // Remove XP for uncompleting task
        removeXP(task.ownerId, 50);
        // Remove XP for completed subtasks
        task.subtasks.filter(st => st.completed).forEach(() => {
          removeXP(task.ownerId, 10);
        });
      }
    }
  }, [tasks, updateTask, addXP, removeXP, generateId]);

  // Subtask operations
  const addSubtask = useCallback((taskId: string, subtaskData: Omit<Subtask, 'id'>) => {
    const subtask: Subtask = {
      ...subtaskData,
      id: generateId(),
    };
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, subtasks: [...task.subtasks, subtask], updatedAt: new Date().toISOString() }
        : task
    ));
  }, [generateId]);

  const updateSubtask = useCallback((taskId: string, subtaskId: string, updates: Partial<Subtask>) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? {
            ...task,
            subtasks: task.subtasks.map(st =>
              st.id === subtaskId ? { ...st, ...updates } : st
            ),
            updatedAt: new Date().toISOString(),
          }
        : task
    ));
  }, []);

  const toggleSubtaskComplete = useCallback((taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const subtask = task.subtasks.find(st => st.id === subtaskId);
    if (!subtask) return;

    const newCompleted = !subtask.completed;
    updateSubtask(taskId, subtaskId, { completed: newCompleted });

    if (task.ownerId) {
      if (newCompleted) {
        addXP(task.ownerId, 10);
      } else {
        removeXP(task.ownerId, 10);
      }
    }
  }, [tasks, updateSubtask, addXP, removeXP]);

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const subtask = task.subtasks.find(st => st.id === subtaskId);
    if (subtask?.completed && task.ownerId) {
      removeXP(task.ownerId, 10);
    }

    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? {
            ...t,
            subtasks: t.subtasks.filter(st => st.id !== subtaskId),
            updatedAt: new Date().toISOString(),
          }
        : t
    ));
  }, [tasks, removeXP]);

  // Member operations
  const addMember = useCallback((memberData: Omit<Member, 'id' | 'xp' | 'level'>) => {
    const newMember: Member = {
      ...memberData,
      id: generateId(),
      xp: 0,
      level: 1,
    };
    setMembers(prev => [...prev, newMember]);
  }, [generateId]);

  const updateMember = useCallback((id: string, updates: Partial<Member>) => {
    setMembers(prev => prev.map(member =>
      member.id === id ? { ...member, ...updates } : member
    ));
  }, []);

  const deleteMember = useCallback((id: string) => {
    // Don't allow deleting if it's the only member
    if (members.length <= 1) return;
    
    // Delete all tasks owned by this member
    setTasks(prev => prev.filter(task => task.ownerId !== id));
    
    // If this was the selected member, select another one
    if (selectedMemberId === id) {
      const otherMember = members.find(m => m.id !== id);
      setSelectedMemberId(otherMember?.id || null);
    }
    
    setMembers(prev => prev.filter(member => member.id !== id));
  }, [members, selectedMemberId]);

  const setSelectedMember = useCallback((memberId: string | null) => {
    setSelectedMemberId(memberId);
  }, []);

  // Computed values
  const selectedMember = useMemo(() => {
    return members.find(m => m.id === selectedMemberId) || null;
  }, [members, selectedMemberId]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Filter by owner
      if (filters.ownerId && task.ownerId !== filters.ownerId) {
        return false;
      }

      // Filter by status
      const taskStatus = task.status || (task.completed ? 'completed' : 'todo');
      if (filters.status === 'active' && (task.completed || taskStatus === 'completed')) {
        return false;
      }
      if (filters.status === 'completed' && (!task.completed && taskStatus !== 'completed')) {
        return false;
      }

      // Filter by priority
      if (filters.priority !== 'all' && task.priority !== filters.priority) {
        return false;
      }

      // Search filter
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDescription = task.description?.toLowerCase().includes(query) || false;
        const matchesTags = task.tags.some(tag => tag.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDescription && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, filters]);

  // Filter setters
  const filterByOwner = useCallback((ownerId: string | null) => {
    setFilters(prev => ({ ...prev, ownerId }));
  }, []);

  const filterByStatus = useCallback((status: 'all' | 'active' | 'completed') => {
    setFilters(prev => ({ ...prev, status }));
  }, []);

  const filterByPriority = useCallback((priority: Priority | 'all') => {
    setFilters(prev => ({ ...prev, priority }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const value: TaskManagerContextType = {
    tasks,
    members,
    selectedMemberId,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    addSubtask,
    updateSubtask,
    toggleSubtaskComplete,
    deleteSubtask,
    addMember,
    updateMember,
    deleteMember,
    setSelectedMember,
    selectedMember,
    filteredTasks,
    filterByOwner,
    filterByStatus,
    filterByPriority,
    setSearchQuery,
    activeFilters: filters,
  };

  return (
    <TaskManagerContext.Provider value={value}>
      {children}
    </TaskManagerContext.Provider>
  );
}

export function useTaskManager() {
  const context = useContext(TaskManagerContext);
  if (context === undefined) {
    throw new Error('useTaskManager must be used within a TaskManagerProvider');
  }
  return context;
}

