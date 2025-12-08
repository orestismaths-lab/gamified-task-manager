'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, Database, AlertCircle, CheckCircle } from 'lucide-react';
import { backup } from '@/lib/backup';
import { storage } from '@/lib/storage';
import { DatabaseStorageTest } from './StorageIndicator';

export function DataManagement() {
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storageInfo = backup.getStorageInfo();

  const handleExport = () => {
    backup.downloadBackup();
    setImportStatus({ type: 'success', message: 'Backup downloaded successfully!' });
    setTimeout(() => setImportStatus({ type: null, message: '' }), 3000);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = backup.importData(text);
      
      if (result.success) {
        setImportStatus({ type: 'success', message: 'Data imported successfully! Please refresh the page.' });
        // Reload after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setImportStatus({ type: 'error', message: result.error || 'Failed to import data' });
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
          Download a backup file containing all your tasks, members, and settings. 
          Keep this file safe - you can use it to restore your data later.
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleExport}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Download Backup
        </motion.button>
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

