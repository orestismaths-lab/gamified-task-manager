'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Tag, FileText, X, Repeat, Check, Trash2 } from 'lucide-react';
import { TaskAssignment } from './TaskAssignment';
import { useTaskManager } from '@/context/TaskManagerContext';
import { Priority, RecurrenceType, TaskStatus, Subtask } from '@/types';
import { format, parseISO } from 'date-fns';
import { templateStorage, TaskTemplate } from '@/lib/templates';

export function TaskInput() {
  const { members, selectedMemberId, addTask } = useTaskManager();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('none');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Set locale for date input to start week on Monday
  useEffect(() => {
    if (dateInputRef.current && typeof window !== 'undefined') {
      // Try to set locale to one that uses Monday as first day (e.g., en-GB, de-DE, etc.)
      // This is a workaround as HTML5 date input doesn't directly support week start
      // The actual calendar picker behavior depends on browser locale settings
    }
  }, []);

  // Load templates
  useEffect(() => {
    setTemplates(templateStorage.getTemplates());
  }, []);

  const handleUseTemplate = (template: TaskTemplate) => {
    const usedTemplate = templateStorage.useTemplate(template.id);
    if (!usedTemplate) return;

    setTemplates(templateStorage.getTemplates());

    // Fill form with template data
    setTitle(template.task.title);
    setDescription(template.task.description || '');
    setPriority(template.task.priority);
    setStatus(template.task.status || 'todo');
    setTags(template.task.tags.join(', '));
    
    // Set due date (use today if template doesn't have one)
    if (template.task.dueDate) {
      setDueDate(format(parseISO(template.task.dueDate), 'yyyy-MM-dd'));
    } else {
      setDueDate(format(new Date(), 'yyyy-MM-dd'));
    }

    // Set recurrence
    if (template.task.recurrence) {
      setRecurrenceType(template.task.recurrence.type);
      setRecurrenceInterval(template.task.recurrence.interval || 1);
      setRecurrenceEndDate(template.task.recurrence.endDate || '');
    } else {
      setRecurrenceType('none');
      setRecurrenceInterval(1);
      setRecurrenceEndDate('');
    }

    // Expand form to show all fields
    setIsExpanded(true);
    setShowTemplateSelector(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validation
    const trimmedTitle = title.trim();
    if (!trimmedTitle || trimmedTitle.length === 0) {
      alert('Please enter a task title');
      return;
    }
    
    if (assignedTo.length === 0 && !selectedMemberId) {
      alert('Please assign the task to at least one member');
      return;
    }

    const tagArray = tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);
    
    // Sanitize title (prevent XSS)
    const sanitizedTitle = trimmedTitle.replace(/[<>]/g, '');

    try {
      await addTask({
        title: sanitizedTitle,
        description: description || undefined, // Preserve whitespace and formatting (spaces, bullets, line breaks)
        ownerId: selectedMemberId || (assignedTo.length > 0 ? assignedTo[0] : ''),
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate).toISOString() : new Date().toISOString(),
        tags: tagArray,
        subtasks: subtasks,
        completed: status === 'completed',
        assignedTo: assignedTo.length > 0 ? assignedTo : (selectedMemberId ? [selectedMemberId] : []),
        recurrence: recurrenceType !== 'none' ? {
          type: recurrenceType,
          interval: recurrenceInterval,
          endDate: recurrenceEndDate || undefined,
        } : undefined,
      });
    } catch (error) {
      console.error('Error creating task:', error);
      alert(error instanceof Error ? error.message : 'Failed to create task');
      return;
    }

    // Reset form
    setTitle('');
    setDescription('');
    setPriority('medium');
    setStatus('todo');
    setDueDate('');
    setTags('');
    setSubtasks([]);
    setNewSubtaskTitle('');
    setRecurrenceType('none');
    setRecurrenceInterval(1);
    setRecurrenceEndDate('');
    setAssignedTo([]);
    setIsExpanded(false);
  };

  const handleAddSubtask = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent triggering parent form
    if (!newSubtaskTitle.trim()) return;

    const newSubtask: Subtask = {
      id: `subtask-${Date.now()}-${Math.random()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };

    setSubtasks([...subtasks, newSubtask]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (subtaskId: string) => {
    setSubtasks(subtasks.map(st => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    ));
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    setSubtasks(subtasks.filter(st => st.id !== subtaskId));
  };

  const selectedMember = members.find(m => m.id === selectedMemberId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6"
    >
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="flex-1 space-y-4">
            <div className="flex gap-2 relative">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-400 dark:focus:border-purple-500 focus:outline-none text-lg font-medium transition-colors"
                  required
                />
                {templates.length > 0 && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Use template"
                    >
                      <FileText className="w-5 h-5" />
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Template Selector Dropdown */}
              {showTemplateSelector && templates.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 z-20 w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl border-2 border-purple-200 dark:border-purple-700 p-4 max-h-96 overflow-y-auto mt-2"
                >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    Quick Add from Template
                  </h3>
                  <button
                    onClick={() => setShowTemplateSelector(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                <div className="space-y-2">
                  {templates.map(template => (
                    <motion.button
                      key={template.id}
                      type="button"
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleUseTemplate(template)}
                      className="w-full text-left p-3 bg-gray-50 hover:bg-purple-50 rounded-lg border-2 border-transparent hover:border-purple-300 transition-all"
                    >
                      <div className="font-semibold text-gray-800 dark:text-gray-200">{template.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{template.task.title}</div>
                      {template.category && (
                        <div className="text-xs text-purple-600 mt-1">Category: {template.category}</div>
                      )}
                    </motion.button>
                  ))}
                </div>
                </motion.div>
              )}
            </div>

            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyDown={(e) => {
                    // Explicitly allow all keys including space
                    // Don't prevent default for any character input
                    if (e.key === 'Escape') {
                      // Only handle Escape if needed
                      return;
                    }
                  }}
                  placeholder="Add description (optional)"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-400 dark:focus:border-purple-500 focus:outline-none resize-none transition-colors whitespace-pre-wrap"
                  style={{ whiteSpace: 'pre-wrap' }}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="min-w-0">
                    <TaskAssignment
                      members={members}
                      assignedTo={assignedTo.length > 0 ? assignedTo : (selectedMemberId ? [selectedMemberId] : [])}
                      onChange={(memberIds) => {
                        setAssignedTo(memberIds);
                        // Also update selectedMemberId for backward compatibility
                        if (memberIds.length > 0) {
                          const event = new CustomEvent('select-member', { detail: { memberId: memberIds[0] } });
                          window.dispatchEvent(event);
                        }
                      }}
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as Priority)}
                      className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-400 dark:focus:border-purple-500 focus:outline-none transition-colors"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as TaskStatus)}
                      className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-400 dark:focus:border-purple-500 focus:outline-none transition-colors"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="in-review">In Review</option>
                      <option value="blocked">Blocked</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Due Date
                    </label>
                    <div className="relative">
                      <input
                        ref={dateInputRef}
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        min={format(new Date(), 'yyyy-MM-dd')}
                        className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors pr-32"
                        lang="en-GB"
                      />
                      {dueDate && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-700/80 px-2 py-1 rounded">
                          {format(new Date(dueDate), 'dd/MM/yyyy')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Work, Home, Personal"
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors"
                  />
                </div>

                {/* Subtasks Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subtasks</label>
                  <div className="space-y-2 mb-3">
                    {subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
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
                            setSubtasks(subtasks.map(st => 
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
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      placeholder="Add subtask..."
                      className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-400 dark:focus:border-purple-500 focus:outline-none transition-colors"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.stopPropagation();
                          if (newSubtaskTitle.trim()) {
                            const newSubtask: Subtask = {
                              id: `subtask-${Date.now()}-${Math.random()}`,
                              title: newSubtaskTitle.trim(),
                              completed: false,
                            };
                            setSubtasks([...subtasks, newSubtask]);
                            setNewSubtaskTitle('');
                          }
                        }
                      }}
                    />
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddSubtask(e as any);
                      }}
                      className="px-4 py-2 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </motion.button>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Repeat className="w-4 h-4" />
                    Repeat Task
                  </label>
                  <div className="space-y-3">
                    <select
                      value={recurrenceType}
                      onChange={(e) => setRecurrenceType(e.target.value as RecurrenceType)}
                      className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-400 dark:focus:border-purple-500 focus:outline-none transition-colors"
                    >
                      <option value="none">Don&apos;t repeat</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>

                    {recurrenceType !== 'none' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-2 gap-3"
                      >
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Every</label>
                          <input
                            type="number"
                            min="1"
                            value={recurrenceInterval}
                            onChange={(e) => setRecurrenceInterval(parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Until (optional)</label>
                          <div className="relative">
                            <input
                              type="date"
                              value={recurrenceEndDate}
                              onChange={(e) => setRecurrenceEndDate(e.target.value)}
                              min={dueDate || format(new Date(), 'yyyy-MM-dd')}
                              className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors pr-28"
                              lang="en-GB"
                            />
                            {recurrenceEndDate && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-xs font-medium text-gray-700 bg-white/80 px-1.5 py-0.5 rounded">
                                {format(new Date(recurrenceEndDate), 'dd/MM/yyyy')}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                {isExpanded ? 'Less options' : 'More options'}
              </button>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!title.trim() || !selectedMemberId}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Task
              </motion.button>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
}

