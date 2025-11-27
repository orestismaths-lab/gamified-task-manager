'use client';

import { motion } from 'framer-motion';
import { useTaskManager } from '@/context/TaskManagerContext';
import { exportToCSV, exportToJSON, printTasks } from '@/lib/export';
import { Download, FileText, Printer } from 'lucide-react';

export function ExportOptions() {
  const { tasks, members } = useTaskManager();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Export & Print
        </h1>
        <p className="text-gray-600">Export your tasks or print them</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => exportToCSV(tasks, members)}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 cursor-pointer hover:shadow-xl transition-shadow"
        >
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
            <Download className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Export to CSV</h3>
          <p className="text-sm text-gray-600">Download tasks as a CSV file for Excel or Google Sheets</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => exportToJSON(tasks, members)}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 cursor-pointer hover:shadow-xl transition-shadow"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Export to JSON</h3>
          <p className="text-sm text-gray-600">Download all data as JSON for backup or import</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => printTasks(tasks, members)}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 cursor-pointer hover:shadow-xl transition-shadow"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
            <Printer className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Print Tasks</h3>
          <p className="text-sm text-gray-600">Open print dialog with formatted task list</p>
        </motion.div>
      </div>

      <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Export Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-2xl font-bold text-purple-600">{tasks.length}</div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{tasks.filter(t => t.completed).length}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{tasks.filter(t => !t.completed).length}</div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{members.length}</div>
            <div className="text-sm text-gray-600">Members</div>
          </div>
        </div>
      </div>
    </div>
  );
}

