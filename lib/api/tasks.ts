// Firestore Tasks API

import { 
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Task } from '@/types';

const TASKS_COLLECTION = 'tasks';

// Convert Firestore timestamp to ISO string
const timestampToISO = (timestamp: any): string => {
  if (timestamp?.toDate) {
    return timestamp.toDate().toISOString();
  }
  return timestamp || new Date().toISOString();
};

// Convert Task to Firestore format
const taskToFirestore = (task: Partial<Task>): any => {
  const { id, ...taskData } = task;
  return {
    ...taskData,
    dueDate: task.dueDate || new Date().toISOString(),
    createdAt: task.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

// Convert Firestore document to Task
const firestoreToTask = (doc: DocumentData): Task => {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title || '',
    description: data.description,
    ownerId: data.ownerId || '',
    priority: data.priority || 'medium',
    status: data.status || 'todo',
    dueDate: timestampToISO(data.dueDate),
    tags: data.tags || [],
    subtasks: data.subtasks || [],
    completed: data.completed || false,
    createdAt: timestampToISO(data.createdAt),
    updatedAt: timestampToISO(data.updatedAt),
    recurrence: data.recurrence,
    parentRecurringTaskId: data.parentRecurringTaskId,
    dependsOn: data.dependsOn || [],
    blocks: data.blocks || [],
    timeSpent: data.timeSpent,
    timeEstimate: data.timeEstimate,
    timeEntries: data.timeEntries,
    comments: data.comments,
    // Multi-user fields
    assignedTo: data.assignedTo || [data.ownerId].filter(Boolean),
    createdBy: data.createdBy || data.ownerId,
  };
};

export const tasksAPI = {
  // Get all tasks (with optional filters)
  getTasks: async (filters?: {
    ownerId?: string;
    assignedTo?: string;
    status?: string;
  }): Promise<Task[]> => {
    const tasksRef = collection(db, TASKS_COLLECTION);
    let q = query(tasksRef, orderBy('createdAt', 'desc'));

    if (filters?.ownerId) {
      q = query(q, where('ownerId', '==', filters.ownerId));
    }
    if (filters?.assignedTo) {
      q = query(q, where('assignedTo', 'array-contains', filters.assignedTo));
    }
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(firestoreToTask);
  },

  // Get single task
  getTask: async (taskId: string): Promise<Task | null> => {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    const snapshot = await getDoc(taskRef);
    if (!snapshot.exists()) return null;
    return firestoreToTask(snapshot);
  },

  // Create task
  createTask: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<string> => {
    // Validate required fields
    if (!task.title || task.title.trim().length === 0) {
      throw new Error('Task title is required');
    }
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    const tasksRef = collection(db, TASKS_COLLECTION);
    const taskData = {
      ...taskToFirestore(task),
      createdBy: userId,
      assignedTo: task.assignedTo && task.assignedTo.length > 0 
        ? task.assignedTo 
        : [task.ownerId].filter(Boolean),
    };
    
    // Ensure at least one assignee
    if (!taskData.assignedTo || taskData.assignedTo.length === 0) {
      throw new Error('Task must be assigned to at least one member');
    }
    
    const docRef = await addDoc(tasksRef, taskData);
    return docRef.id;
  },

  // Update task
  updateTask: async (taskId: string, updates: Partial<Task>): Promise<void> => {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    const updateData: any = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    // Remove id if present
    delete updateData.id;
    await updateDoc(taskRef, updateData);
  },

  // Delete task
  deleteTask: async (taskId: string): Promise<void> => {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    await deleteDoc(taskRef);
  },

  // Real-time listener
  subscribeToTasks: (
    callback: (tasks: Task[]) => void,
    filters?: {
      ownerId?: string;
      assignedTo?: string;
      status?: string;
    }
  ): (() => void) => {
    const tasksRef = collection(db, TASKS_COLLECTION);
    let q = query(tasksRef, orderBy('createdAt', 'desc'));

    if (filters?.ownerId) {
      q = query(q, where('ownerId', '==', filters.ownerId));
    }
    if (filters?.assignedTo) {
      q = query(q, where('assignedTo', 'array-contains', filters.assignedTo));
    }
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }

    return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const tasks = snapshot.docs.map(firestoreToTask);
      callback(tasks);
    });
  },
};

