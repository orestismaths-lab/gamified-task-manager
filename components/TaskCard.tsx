'use client';

import { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Plus, Trash2, ChevronDown, ChevronUp, Edit2, Calendar } from 'lucide-react';
import { useTaskManager } from '@/context/TaskManagerContext';
import { Task, Priority, TaskStatus } from '@/types';
import { format } from 'date-fns';
import { triggerConfetti } from '@/lib/confetti';
import { EditTaskModal } from './EditTaskModal';
import { TaskViewModal } from './TaskViewModal';

interface TaskCardProps {
  task: Task;
  disableClick?: boolean; // Disable onClick when used in Kanban
}

const priorityColors: Record<Priority, string> = {
  high: 'from-red-50 to-pink-50 border-red-200 dark:from-red-900/30 dark:to-pink-900/30 dark:border-red-700/50',
  medium: 'from-orange-50 to-amber-50 border-orange-200 dark:from-orange-900/30 dark:to-amber-900/30 dark:border-orange-700/50',
  low: 'from-blue-50 to-cyan-50 border-blue-200 dark:from-blue-900/30 dark:to-cyan-900/30 dark:border-blue-700/50',
};

const priorityBadgeColors: Record<Priority, string> = {
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

function TaskCardComponent({ task, disableClick = false }: TaskCardProps) {
  const {
    tasks,
    toggleTaskComplete,
    deleteTask,
    members,
  } = useTaskManager();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const owner = useMemo(() => members.find(m => m.id === task.ownerId), [members, task.ownerId]);
  const completedSubtasks = useMemo(() => (task.subtasks || []).filter(st => st.completed).length, [task.subtasks]);
  const totalSubtasks = (task.subtasks || []).length;
  const progress = useMemo(() => totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0, [completedSubtasks, totalSubtasks]);


  const handleToggleComplete = useCallback(() => {
    // Check if task has incomplete dependencies
    if (!task.completed && task.dependsOn && task.dependsOn.length > 0) {
      const dependencies = tasks.filter(t => t && task.dependsOn?.includes(t.id));
      const incompleteDeps = dependencies.filter(t => t && !t.completed);
      if (incompleteDeps.length > 0) {
        alert(`Cannot complete task. The following dependencies are not completed:\n${incompleteDeps.map(t => `- ${t.title}`).join('\n')}`);
        return;
      }
    }
    toggleTaskComplete(task.id);
    if (!task.completed) {
      triggerConfetti();
    }
  }, [task.completed, task.dependsOn, task.id, tasks, toggleTaskComplete]);


  const handleDeleteTask = useCallback(() => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id);
    }
  }, [task.id, deleteTask]);

  const handleStartEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsEditModalOpen(true);
  }, []);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    // Don't open view modal if clicking on buttons
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[data-no-drag]')) {
      return;
    }
    e.stopPropagation();
    setIsViewModalOpen(true);
  }, []);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: task.completed ? 0.6 : 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`
          bg-gradient-to-br ${priorityColors[task.priority]} rounded-lg p-2.5 border-2 shadow-sm
          transition-all hover:shadow-md relative
          ${task.completed ? 'line-through' : ''}
        `}
      onClick={disableClick ? undefined : (e) => {
        // Don't expand if clicking on buttons or if dragging
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('[data-no-drag]') || target.closest('[data-draggable]')) {
          return;
        }
        setIsExpanded(!isExpanded);
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Action Buttons - Absolute positioned */}
      <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-20" data-no-drag onClick={(e) => e.stopPropagation()}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleStartEdit}
          className="p-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors shadow-sm pointer-events-auto"
          title="Edit task"
        >
          <Edit2 className="w-3 h-3" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleDeleteTask();
          }}
          className="p-1 rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors shadow-sm pointer-events-auto"
          title="Delete task"
        >
          <Trash2 className="w-3 h-3" />
        </motion.button>
      </div>

      <div className="flex items-start gap-2 pr-12">
        {/* Checkbox */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            handleToggleComplete();
          }}
          className={`
            w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5
            ${task.completed
              ? 'bg-green-500 border-green-500'
              : 'border-gray-300 hover:border-green-400'
            }
          `}
        >
          {task.completed && <Check className="w-2.5 h-2.5 text-white" />}
        </motion.button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-1.5">
            <h3 className={`font-semibold text-sm text-gray-800 dark:text-gray-200 leading-tight ${task.completed ? 'line-through' : ''}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-1 whitespace-pre-wrap">{task.description}</p>
            )}
          </div>

          {/* Badges Row */}
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            {/* Owner Avatar */}
            {owner && (
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                {owner.name.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Status Badge */}
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${statusColors[task.status || 'todo']}`}>
              {statusLabels[task.status || 'todo']}
            </span>

            {/* Priority Badge */}
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${priorityBadgeColors[task.priority]}`}>
              {task.priority.toUpperCase()}
            </span>
          </div>

          {/* Tags and Due Date - Compact */}
          <div className="flex items-center gap-2 flex-wrap">
            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className="px-1.5 py-0.5 bg-white/60 dark:bg-gray-800/60 rounded text-[10px] font-medium text-gray-700 dark:text-gray-300"
                  >
                    #{tag}
                  </span>
                ))}
                {task.tags.length > 2 && (
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">+{task.tags.length - 2}</span>
                )}
              </div>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <div className="flex items-center gap-1 text-[10px] text-gray-600 dark:text-gray-400">
                <Calendar className="w-3 h-3" />
                <span>{format(new Date(task.dueDate), 'dd/MM/yyyy')}</span>
              </div>
            )}
          </div>

          {/* Subtask Progress - Compact */}
          {totalSubtasks > 0 && (
            <div className="mb-1">
                <div className="flex items-center justify-between text-[10px] text-gray-600 dark:text-gray-400 mb-0.5">
                <span>{completedSubtasks}/{totalSubtasks}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-1 bg-white/60 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                />
              </div>
            </div>
          )}

          {/* Expandable Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="mt-4 pt-4 border-t border-white/40"
              >
                {/* Subtasks - Read Only */}
                {task.subtasks.length > 0 && (
                  <div className="space-y-2">
                    {task.subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center gap-2">
                        <div
                          className={`
                            w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                            ${subtask.completed
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-300'
                            }
                          `}
                        >
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
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expand/Collapse Indicator */}
          {totalSubtasks > 0 && (
            <div className="flex items-center justify-end mt-1">
              {isExpanded ? (
                <ChevronUp className="w-3 h-3 text-gray-500" />
              ) : (
                <ChevronDown className="w-3 h-3 text-gray-500" />
              )}
            </div>
          )}
        </div>
      </div>

      </motion.div>

      {/* Edit Modal - Rendered outside the card via portal */}
      <EditTaskModal
        task={task}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* View Modal - Rendered outside the card via portal */}
      <TaskViewModal
        task={task}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      />
    </>
  );
}

// Memoize component to prevent unnecessary re-renders
export const TaskCard = memo(TaskCardComponent, (prevProps, nextProps) => {
  // Only re-render if task data actually changed
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.title === nextProps.task.title &&
    prevProps.task.completed === nextProps.task.completed &&
    prevProps.task.updatedAt === nextProps.task.updatedAt &&
    prevProps.task.subtasks.length === nextProps.task.subtasks.length &&
    JSON.stringify(prevProps.task.tags) === JSON.stringify(nextProps.task.tags)
  );
});

