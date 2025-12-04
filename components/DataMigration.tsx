/**
 * Data Migration Component
 * Allows users to migrate their localStorage data to the database
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { storage } from '@/lib/storage';
import type { Task, Member } from '@/types';

export function DataMigration() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; imported?: { tasks: number; members: number } } | null>(null);
  const [localData, setLocalData] = useState<{ tasks: Task[]; members: Member[] } | null>(null);

  // Load localStorage data
  const loadLocalData = () => {
    const tasks = storage.getTasks();
    const members = storage.getMembers();
    
    setLocalData({ tasks, members });
    
    return { tasks, members };
  };

  // Migrate data to database
  const handleMigrate = async () => {
    if (!user) {
      setResult({
        success: false,
        message: 'You must be logged in to migrate data',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Get data from localStorage
      const { tasks, members } = loadLocalData();

      if (tasks.length === 0 && members.length === 0) {
        setResult({
          success: false,
          message: 'No data found in localStorage to migrate',
        });
        setLoading(false);
        return;
      }

      // Send to migration endpoint
      const res = await fetch('/api/migrate-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tasks, members }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Migration failed');
      }

      setResult({
        success: true,
        message: data.message || 'Migration completed successfully',
        imported: data.imported,
      });

      // Clear localStorage after successful migration
      if (data.imported && (data.imported.tasks > 0 || data.imported.members > 0)) {
        storage.clearTasks();
        storage.clearMembers();
        console.log('[DataMigration] Cleared localStorage after successful migration');
      }
    } catch (error) {
      console.error('Migration error:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to migrate data',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadLocalData();
  }, []);

  const { tasks = [], members = [] } = localData || {};

  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Upload className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Data Migration
          </h2>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Migrate your tasks and member data from localStorage to the database. This ensures your data is safely stored and synced across devices.
        </p>

        {!user && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <p className="text-yellow-800 dark:text-yellow-300">
                You must be logged in to migrate data.
              </p>
            </div>
          </div>
        )}

        {/* Data Summary */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
            LocalStorage Data Found:
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Tasks:</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">{tasks.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Members:</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">{members.length}</span>
            </div>
          </div>
        </div>

        {/* Result Message */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-4 mb-6 ${
              result.success
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              )}
              <p
                className={
                  result.success
                    ? 'text-green-800 dark:text-green-300'
                    : 'text-red-800 dark:text-red-300'
                }
              >
                {result.message}
              </p>
            </div>
            {result.success && result.imported && (
              <div className="mt-3 text-sm text-green-700 dark:text-green-400">
                <p>✅ Imported {result.imported.tasks} tasks</p>
                <p>✅ Imported {result.imported.members} member profiles</p>
                {result.imported.tasks > 0 || result.imported.members > 0 ? (
                  <p className="mt-2 font-semibold">
                    LocalStorage has been cleared. Your data is now in the database!
                  </p>
                ) : null}
              </div>
            )}
          </motion.div>
        )}

        {/* Migrate Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleMigrate}
          disabled={loading || !user || (tasks.length === 0 && members.length === 0)}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Migrating...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Migrate to Database
            </>
          )}
        </motion.button>

        {/* Info */}
        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          <p className="mb-2">ℹ️ <strong>Note:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>This is a one-time migration</li>
            <li>Duplicate tasks will be skipped</li>
            <li>Your XP and level will be preserved</li>
            <li>LocalStorage will be cleared after successful migration</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}

