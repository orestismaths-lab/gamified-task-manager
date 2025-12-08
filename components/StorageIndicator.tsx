'use client';

import { useEffect, useState } from 'react';
import { Database, HardDrive, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTaskManager } from '@/context/TaskManagerContext';
import { storage } from '@/lib/storage';

/**
 * Component that shows whether tasks are stored in database or localStorage
 * Helps users verify that their data is being saved to the database
 */
export function StorageIndicator() {
  const { user } = useAuth();
  const { tasks } = useTaskManager();
  const [storageType, setStorageType] = useState<'database' | 'localStorage' | 'unknown'>('unknown');
  const [localStorageTasks, setLocalStorageTasks] = useState(0);

  useEffect(() => {
    if (user?.id) {
      // User is logged in - check if tasks are from API (database) or localStorage
      const localTasks = storage.getTasks();
      setLocalStorageTasks(localTasks.length);
      
      // If user is logged in and we have tasks, they should be from database
      // (unless localStorage still has old data)
      if (tasks.length > 0) {
        // Check if tasks have IDs that look like database IDs (cuid format) vs localStorage IDs
        // Database IDs are typically longer and more complex
        const hasDatabaseIds = tasks.some(t => t.id && t.id.length > 20);
        const hasLocalStorageData = localTasks.length > 0;
        
        if (hasDatabaseIds && !hasLocalStorageData) {
          setStorageType('database');
        } else if (hasLocalStorageData && localTasks.length === tasks.length) {
          // If localStorage has same number of tasks, might be using localStorage
          setStorageType('localStorage');
        } else {
          setStorageType('database'); // Default to database if logged in
        }
      } else {
        setStorageType('database'); // If no tasks, assume database (empty state)
      }
    } else {
      // Not logged in - must be localStorage
      setStorageType('localStorage');
    }
  }, [user, tasks]);

  if (!user) {
    return null; // Don't show if not logged in
  }

  const isDatabase = storageType === 'database';
  const hasLocalStorageData = localStorageTasks > 0;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`
        bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 p-3
        ${isDatabase ? 'border-green-500' : 'border-yellow-500'}
        transition-all duration-300
      `}>
        <div className="flex items-center gap-2">
          {isDatabase ? (
            <>
              <Database className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <div className="text-sm font-semibold text-green-700 dark:text-green-300">
                  Database Storage
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Tasks saved to database
                </div>
              </div>
            </>
          ) : (
            <>
              <HardDrive className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <div className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                  Local Storage
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Tasks saved locally
                </div>
              </div>
            </>
          )}
        </div>
        
        {hasLocalStorageData && isDatabase && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
              <AlertCircle className="w-3 h-3" />
              <span>{localStorageTasks} old task(s) in localStorage</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Debug component to test database storage
 * Shows instructions and a button to clear localStorage and reload
 */
export function DatabaseStorageTest() {
  const { user } = useAuth();
  const { tasks } = useTaskManager();
  const [testResult, setTestResult] = useState<string | null>(null);

  const testDatabaseStorage = () => {
    if (!user) {
      setTestResult('Please log in first');
      return;
    }

    // Get current task count
    const currentTaskCount = tasks.length;
    const localStorageTasks = storage.getTasks();
    
    if (localStorageTasks.length > 0) {
      setTestResult(`Found ${localStorageTasks.length} task(s) in localStorage. Clearing...`);
    }
    
    // Clear localStorage
    storage.clearTasks();
    storage.clearMembers();
    
    // Reload page
    setTestResult(`✅ Cleared localStorage. Reloading page... If you see ${currentTaskCount} task(s) after reload, they are stored in the database!`);
    
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <Database className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
            Test Database Storage
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
            To verify that your tasks are stored in the database (not localStorage):
          </p>
          <ol className="text-sm text-blue-700 dark:text-blue-400 list-decimal list-inside space-y-1 mb-3">
            <li>Create a new task (if you haven&apos;t already)</li>
            <li>Note how many tasks you have: <strong>{tasks.length}</strong></li>
            <li>Click the button below to clear localStorage</li>
            <li>After the page reloads, check if your tasks are still visible</li>
            <li>If tasks are visible → They are in the database ✅</li>
            <li>If tasks are gone → They were in localStorage ❌</li>
          </ol>
          <div className="mb-3 p-2 bg-blue-100 dark:bg-blue-800 rounded text-xs text-blue-800 dark:text-blue-200">
            <strong>Alternative method:</strong> Open browser DevTools (F12) → Network tab → Create a task → Look for POST request to <code>/api/tasks</code>. If you see it, tasks are saved to database!
          </div>
          {testResult && (
            <div className="mb-3 p-2 bg-blue-100 dark:bg-blue-800 rounded text-sm text-blue-800 dark:text-blue-200">
              {testResult}
            </div>
          )}
          <button
            onClick={testDatabaseStorage}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Clear localStorage & Reload (Test)
          </button>
        </div>
      </div>
    </div>
  );
}

