'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Check, User, Tag, FileText, Clock, AlertCircle } from 'lucide-react';
import { Task, Priority, TaskStatus } from '@/types';
import { useTaskManager } from '@/context/TaskManagerContext';
import { format } from 'date-fns';

interface TaskViewModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

const priorityColors: Record<Priority, string> = {
  high: 'bg-red-500 text-white',
  medium: 'bg-orange-500 text-white',
  low: 'bg-blue-500 text-white',
};

const statusColors: Record<TaskStatus, string> = {
  'todo': 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700',
  'in-progress': 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50',
  'in-review': 'bg-yellow-100 text-yellow-600 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800/50',
  'blocked': 'bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50',
  'completed': 'bg-green-100 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50',
};

const statusLabels: Record<TaskStatus, string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'in-review': 'In Review',
  'blocked': 'Blocked',
  'completed': 'Completed',
};

export function TaskViewModal({ task, isOpen, onClose }: TaskViewModalProps) {
  const { members, tasks } = useTaskManager();

  const owner = useMemo(() => members.find(m => m.id === task.ownerId), [members, task.ownerId]);
  const completedSubtasks = useMemo(() => (task.subtasks || []).filter(st => st.completed).length, [task.subtasks]);
  const totalSubtasks = (task.subtasks || []).length;
  const progress = useMemo(() => totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0, [completedSubtasks, totalSubtasks]);

  // Get dependency tasks
  const dependencyTasks = useMemo(() => {
    if (!task.dependsOn || task.dependsOn.length === 0) return [];
    return tasks.filter(t => task.dependsOn?.includes(t.id));
  }, [task.dependsOn, tasks]);

  // Get blocking tasks
  const blockingTasks = useMemo(() => {
    if (!task.blocks || task.blocks.length === 0) return [];
    return tasks.filter(t => task.blocks?.includes(t.id));
  }, [task.blocks, tasks]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
            style={{ zIndex: 99999 }}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative"
              style={{ zIndex: 100000 }}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Task Details</h2>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Title</label>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{task.title}</h3>
                </div>

                {/* Description */}
                {task.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Description
                    </label>
                    <div className="px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                      {task.description}
                    </div>
                  </div>
                )}

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Owner */}
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Owner
                    </label>
                    <div className="px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex items-center gap-2">
                      {owner && (
                        <>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-bold">
                            {owner.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-700">{owner.name}</span>
                        </>
                      )}
                      {!owner && <span className="text-gray-500">No owner</span>}
                    </div>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Priority</label>
                    <div className="px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${priorityColors[task.priority]}`}>
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Status</label>
                    <div className="px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${statusColors[task.status || 'todo']}`}>
                        {statusLabels[task.status || 'todo']}
                      </span>
                    </div>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Due Date
                    </label>
                    <div className="px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                      {task.dueDate ? (
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {format(new Date(task.dueDate), 'dd/MM/yyyy')}
                        </span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">No due date</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {task.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subtasks */}
                {totalSubtasks > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Subtasks ({completedSubtasks}/{totalSubtasks})
                    </label>
                    <div className="px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50">
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                          />
                        </div>
                      </div>
                      {/* Subtasks List */}
                      <div className="space-y-2">
                        {(task.subtasks || []).map((subtask) => (
                          <div key={subtask.id} className="flex items-center gap-2 p-2 bg-white rounded-lg">
                            <div className={`
                              w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                              ${subtask.completed
                                ? 'bg-green-500 border-green-500'
                                : 'border-gray-300'
                              }
                            `}>
                              {subtask.completed && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span
                              className={`flex-1 text-sm ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}
                            >
                              {subtask.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Dependencies */}
                {dependencyTasks.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Depends On
                    </label>
                    <div className="px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50">
                      <div className="space-y-2">
                        {dependencyTasks.map((depTask) => (
                          <div key={depTask.id} className="flex items-center gap-2 p-2 bg-white rounded-lg">
                            <div className={`
                              w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0
                              ${depTask.completed
                                ? 'bg-green-500 border-green-500'
                                : 'border-gray-300'
                              }
                            `}>
                              {depTask.completed && <Check className="w-2.5 h-2.5 text-white" />}
                            </div>
                            <span className={`text-sm ${depTask.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                              {depTask.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Blocking Tasks */}
                {blockingTasks.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Blocks
                    </label>
                    <div className="px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50">
                      <div className="space-y-2">
                        {blockingTasks.map((blockTask) => (
                          <div key={blockTask.id} className="flex items-center gap-2 p-2 bg-white rounded-lg">
                            <span className="text-sm text-gray-700 dark:text-gray-300">{blockTask.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div>
                      <span className="font-medium">Created:</span>{' '}
                      {task.createdAt ? format(new Date(task.createdAt), 'dd/MM/yyyy HH:mm') : 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Last Updated:</span>{' '}
                      {task.updatedAt ? format(new Date(task.updatedAt), 'dd/MM/yyyy HH:mm') : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Render modal in portal to body to ensure it's above everything
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
}

