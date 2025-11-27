'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Calendar, Plus, Check, Trash2 } from 'lucide-react';
import { Task, Priority, TaskStatus, Subtask } from '@/types';
import { useTaskManager } from '@/context/TaskManagerContext';
import { format } from 'date-fns';
import { TaskAssignment } from './TaskAssignment';

interface EditTaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export function EditTaskModal({ task, isOpen, onClose }: EditTaskModalProps) {
  const { members, updateTask } = useTaskManager();

  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editPriority, setEditPriority] = useState<Priority>(task.priority);
  const [editStatus, setEditStatus] = useState<TaskStatus>(task.status || 'todo');
  const [editDueDate, setEditDueDate] = useState(
    task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : ''
  );
  const [editTags, setEditTags] = useState(task.tags.join(', '));
  const [editOwnerId, setEditOwnerId] = useState(task.ownerId);
  const [editAssignedTo, setEditAssignedTo] = useState<string[]>(task.assignedTo || [task.ownerId].filter(Boolean));
  const [editSubtasks, setEditSubtasks] = useState<Subtask[]>(task.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Reset form when task changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setEditTitle(task.title);
      setEditDescription(task.description || '');
      setEditPriority(task.priority);
      setEditStatus(task.status || 'todo');
      setEditDueDate(task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '');
      setEditTags(task.tags.join(', '));
      setEditOwnerId(task.ownerId);
      setEditAssignedTo(task.assignedTo || [task.ownerId].filter(Boolean));
      setEditSubtasks(task.subtasks || []);
      setNewSubtaskTitle('');
    }
  }, [task, isOpen]);

  const handleAddSubtask = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const newSubtask: Subtask = {
      id: `subtask-${Date.now()}-${Math.random()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };

    setEditSubtasks([...editSubtasks, newSubtask]);
    setNewSubtaskTitle('');
  }, [newSubtaskTitle, editSubtasks]);

  const handleToggleSubtask = useCallback((subtaskId: string) => {
    setEditSubtasks(editSubtasks.map(st => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    ));
  }, [editSubtasks]);

  const handleDeleteSubtask = useCallback((subtaskId: string) => {
    setEditSubtasks(editSubtasks.filter(st => st.id !== subtaskId));
  }, [editSubtasks]);

  const handleSave = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle || trimmedTitle.length === 0) {
      alert('Please enter a task title');
      return;
    }

    const tagArray = editTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    // Sanitize title
    const sanitizedTitle = trimmedTitle.replace(/[<>]/g, '');

    // Update the task with all changes including subtasks
    // The updateTask function handles everything in one operation
    try {
      await updateTask(task.id, {
        title: sanitizedTitle,
        description: editDescription || undefined, // Preserve whitespace and formatting (spaces, bullets, line breaks)
        priority: editPriority,
        status: editStatus,
        dueDate: editDueDate ? new Date(editDueDate).toISOString() : task.dueDate,
        tags: tagArray,
        ownerId: editOwnerId,
        assignedTo: editAssignedTo.length > 0 ? editAssignedTo : [editOwnerId].filter(Boolean),
        completed: editStatus === 'completed',
        subtasks: editSubtasks,
      });
    } catch (error) {
      console.error('Error updating task:', error);
      alert(error instanceof Error ? error.message : 'Failed to update task');
      return;
    }

    onClose();
  }, [editTitle, editDescription, editPriority, editStatus, editDueDate, editTags, editOwnerId, editAssignedTo, editSubtasks, task.id, task.dueDate, updateTask, onClose]);

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
            style={{ 
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                maxWidth: '42rem',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
                zIndex: 100000
              }}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Edit Task</h2>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-400 dark:focus:border-purple-500 focus:outline-none"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-400 dark:focus:border-purple-500 focus:outline-none resize-none whitespace-pre-wrap"
                    style={{ whiteSpace: 'pre-wrap' }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <TaskAssignment
                      members={members}
                      assignedTo={editAssignedTo}
                      onChange={(memberIds) => {
                        setEditAssignedTo(memberIds);
                        // Also update ownerId for backward compatibility
                        if (memberIds.length > 0) {
                          setEditOwnerId(memberIds[0]);
                        }
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value as Priority)}
                      className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-400 dark:focus:border-purple-500 focus:outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
                      className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-400 dark:focus:border-purple-500 focus:outline-none"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="in-review">In Review</option>
                      <option value="blocked">Blocked</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Due Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-400 dark:focus:border-purple-500 focus:outline-none pr-32"
                        lang="en-GB"
                      />
                      {editDueDate && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-700/80 px-2 py-1 rounded">
                          {format(new Date(editDueDate), 'dd/MM/yyyy')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    placeholder="Work, Home, Personal"
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-400 dark:focus:border-purple-500 focus:outline-none"
                  />
                </div>

                {/* Subtasks Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subtasks</label>
                  <div className="space-y-2 mb-3">
                    {editSubtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleToggleSubtask(subtask.id)}
                          className={`
                            w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                            ${subtask.completed
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-300 hover:border-green-400'
                            }
                          `}
                        >
                          {subtask.completed && <Check className="w-3 h-3 text-white" />}
                        </motion.button>
                        <input
                          type="text"
                          value={subtask.title}
                          onChange={(e) => {
                            setEditSubtasks(editSubtasks.map(st => 
                              st.id === subtask.id ? { ...st, title: e.target.value } : st
                            ));
                          }}
                          className={`
                            flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-purple-400 focus:outline-none
                            ${subtask.completed ? 'line-through text-gray-500' : ''}
                          `}
                        />
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteSubtask(subtask.id)}
                          className="p-1 rounded text-red-500 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleAddSubtask} className="flex gap-2">
                    <input
                      type="text"
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      placeholder="Add subtask..."
                      className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none"
                    />
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </motion.button>
                  </form>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClose}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </motion.button>
                </div>
              </form>
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

