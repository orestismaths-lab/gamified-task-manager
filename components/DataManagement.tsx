'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, Database, AlertCircle, CheckCircle, Server } from 'lucide-react';
import { backup } from '@/lib/backup';
import { storage } from '@/lib/storage';
import { DatabaseStorageTest } from './StorageIndicator';
import { useAuth } from '@/context/AuthContext';
import { USE_API } from '@/lib/constants';

export function DataManagement() {
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storageInfo = backup.getStorageInfo();
  const { user } = useAuth();
  const isApiMode = USE_API && !!user;

  const handleExport = async () => {
    // If in API mode and logged in, export from database
    if (USE_API && user) {
      await handleExportFromDatabase();
      return;
    }
    
    // Otherwise export from localStorage
    backup.downloadBackup();
    setImportStatus({ type: 'success', message: 'Backup downloaded successfully!' });
    setTimeout(() => setImportStatus({ type: null, message: '' }), 3000);
  };

  const handleExportFromDatabase = async () => {
    if (!user) {
      setImportStatus({ type: 'error', message: 'You must be logged in to export from database.' });
      return;
    }

    setIsExporting(true);
    setImportStatus({ type: null, message: '' });

    try {
      console.log('[Export] Starting export from database...');
      const response = await fetch('/api/export', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Export failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('[Export] Received data:', { 
        tasksCount: data.tasks?.length || 0, 
        membersCount: data.members?.length || 0 
      });

      // Create download
      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `task-manager-database-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setImportStatus({ 
        type: 'success', 
        message: `Database export downloaded! ${data.tasks?.length || 0} tasks, ${data.members?.length || 0} members.` 
      });
      setTimeout(() => setImportStatus({ type: null, message: '' }), 5000);
    } catch (error) {
      console.error('[Export] Export error:', error);
      setImportStatus({ 
        type: 'error', 
        message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.json')) {
      setImportStatus({ type: 'error', message: 'Please select a JSON file (.json)' });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      setImportStatus({ type: 'error', message: 'Failed to read file. Please try again.' });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.onload = (e) => {
      try {
        console.log('[Import] FileReader onload triggered');
        const text = e.target?.result as string;
        console.log('[Import] File content length:', text?.length || 0);
        
        if (!text || text.trim().length === 0) {
          console.error('[Import] File is empty');
          setImportStatus({ type: 'error', message: 'File is empty or invalid.' });
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }

        // Validate JSON structure before importing
        let parsedData;
        try {
          parsedData = JSON.parse(text);
          console.log('[Import] JSON parsed successfully');
          console.log('[Import] Parsed data keys:', Object.keys(parsedData));
          console.log('[Import] Tasks count:', parsedData.tasks?.length || 0);
          console.log('[Import] Members count:', parsedData.members?.length || 0);
        } catch (parseError) {
          console.error('[Import] JSON parse error:', parseError);
          setImportStatus({ 
            type: 'error', 
            message: `Invalid JSON format: ${parseError instanceof Error ? parseError.message : 'Unknown error'}` 
          });
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }

        // Validate that it has the expected structure
        if (!parsedData || typeof parsedData !== 'object') {
          console.error('[Import] Invalid data structure');
          setImportStatus({ type: 'error', message: 'Invalid backup file format: file must be a JSON object.' });
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }

        // Check if it has at least tasks or members
        if (!parsedData.tasks && !parsedData.members) {
          console.error('[Import] No tasks or members found');
          setImportStatus({ type: 'error', message: 'Backup file must contain at least tasks or members.' });
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }

        // Validate arrays
        if (parsedData.tasks && !Array.isArray(parsedData.tasks)) {
          console.error('[Import] Tasks is not an array:', typeof parsedData.tasks);
          setImportStatus({ type: 'error', message: 'Invalid backup file: tasks must be an array.' });
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }

        if (parsedData.members && !Array.isArray(parsedData.members)) {
          console.error('[Import] Members is not an array:', typeof parsedData.members);
          setImportStatus({ type: 'error', message: 'Invalid backup file: members must be an array.' });
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }

        // Now try to import
        console.log('[Import] Calling backup.importData...');
        const result = backup.importData(text);
        console.log('[Import] Import result:', result);
        
        if (result.success) {
          const importedTasks = parsedData.tasks?.length || 0;
          const importedMembers = parsedData.members?.length || 0;
          console.log('[Import] Success! Imported:', { importedTasks, importedMembers });
          
          // Verify data was saved
          const savedTasks = storage.getTasks();
          const savedMembers = storage.getMembers();
          console.log('[Import] Verification - Saved tasks:', savedTasks.length);
          console.log('[Import] Verification - Saved members:', savedMembers.length);
          
          setImportStatus({ 
            type: 'success', 
            message: `Data imported successfully! ${importedTasks} tasks, ${importedMembers} members. Refreshing...` 
          });
          
          // Reload after 1.5 seconds to refresh the context
          setTimeout(() => {
            console.log('[Import] Reloading page...');
            window.location.reload();
          }, 1500);
        } else {
          console.error('[Import] Import failed:', result.error);
          setImportStatus({ type: 'error', message: result.error || 'Failed to import data' });
        }
      } catch (error) {
        console.error('[Import] Unexpected error:', error);
        setImportStatus({ 
          type: 'error', 
          message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
        });
      } finally {
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Data Management
        </h1>
        <p className="text-gray-600 mt-1">Backup, restore, and manage your data</p>
      </div>

      {/* Database Storage Test */}
      <DatabaseStorageTest />

      {/* Storage Info */}
      {storageInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-800">Storage Information</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500">Tasks</div>
              <div className="text-2xl font-bold text-gray-800">{storageInfo.tasksCount}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Members</div>
              <div className="text-2xl font-bold text-gray-800">{storageInfo.membersCount}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Storage Used</div>
              <div className="text-2xl font-bold text-gray-800">{storageInfo.totalSizeKB} KB</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Location</div>
              <div className="text-sm font-medium text-gray-700">Browser LocalStorage</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Backup Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 mb-6"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Backup Your Data</h2>
        <p className="text-gray-600 mb-4">
          {USE_API 
            ? 'Download a backup file containing all your tasks and members from the database. Keep this file safe - you can use it to restore your data later.'
            : 'Download a backup file containing all your tasks, members, and settings. Keep this file safe - you can use it to restore your data later.'
          }
        </p>
        <div className="flex flex-wrap gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExport}
            disabled={isExporting}
            className={`px-6 py-3 ${USE_API ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'} text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {USE_API ? <Server className="w-5 h-5" /> : <Download className="w-5 h-5" />}
            {isExporting ? 'Exporting...' : (USE_API ? 'Download Backup (from Database)' : 'Download Backup')}
          </motion.button>
        </div>
        {USE_API && (
          <p className="text-sm text-purple-600 mt-3 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Connected to database - backup will include all your data from the server
          </p>
        )}
      </motion.div>

      {/* Restore Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 mb-6"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Restore from Backup</h2>
        <p className="text-gray-600 mb-4">
          Upload a previously downloaded backup file to restore your data. 
          <strong className="text-red-600"> Warning: This will replace all current data!</strong>
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
          id="import-file"
        />
        <motion.label
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          htmlFor="import-file"
          className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
        >
          <Upload className="w-5 h-5" />
          Upload Backup File
        </motion.label>
      </motion.div>

      {/* Status Message */}
      {importStatus.type && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl flex items-center gap-3 ${
            importStatus.type === 'success'
              ? 'bg-green-50 border-2 border-green-200'
              : 'bg-red-50 border-2 border-red-200'
          }`}
        >
          {importStatus.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span className={importStatus.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {importStatus.message}
          </span>
        </motion.div>
      )}

      {/* Important Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6"
      >
        <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Important: Where Your Data is Stored
        </h3>
        <ul className="space-y-2 text-sm text-yellow-700">
          <li>• <strong>Location:</strong> Browser LocalStorage (client-side only)</li>
          <li>• <strong>Storage Keys:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>- gamified-task-manager-tasks</li>
              <li>- gamified-task-manager-members</li>
              <li>- gamified-task-manager-selected-member</li>
            </ul>
          </li>
          <li>• <strong>Data can be lost if:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>- You clear browser data/cache</li>
              <li>- You use incognito/private mode</li>
              <li>- Browser storage quota is exceeded</li>
              <li>- You switch browsers or devices</li>
            </ul>
          </li>
          <li>• <strong>Recommendation:</strong> Download regular backups to keep your data safe!</li>
        </ul>
      </motion.div>
    </div>
  );
}

