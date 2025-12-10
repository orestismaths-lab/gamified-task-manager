'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskStatus } from '@/types';
import { useTaskManager } from '@/context/TaskManagerContext';
import { TaskCard } from './TaskCard';

const statusOrder: TaskStatus[] = ['todo', 'in-progress', 'in-review', 'blocked', 'completed'];

const statusLabels: Record<TaskStatus, string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'in-review': 'In Review',
  'blocked': 'Blocked',
  'completed': 'Completed',
};

const statusColors: Record<TaskStatus, string> = {
  'todo': 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700',
  'in-progress': 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50',
  'in-review': 'bg-yellow-100 text-yellow-600 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800/50',
  'blocked': 'bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50',
  'completed': 'bg-green-100 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50',
};

interface SortableTaskCardProps {
  task: Task;
}

function SortableTaskCard({ task }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="relative"
    >
      {/* Make entire card draggable */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
        style={{ 
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none'
        }}
      >
        <TaskCard task={task} disableClick={true} />
      </div>
    </div>
  );
}

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
}

function KanbanColumn({ status, tasks }: KanbanColumnProps) {
  const taskIds = useMemo(() => tasks.map(t => t.id), [tasks]);
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: 'column',
      status: status,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col h-full min-h-[500px] transition-colors ${
        isOver ? 'bg-gray-100' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
          {statusLabels[status]}
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${statusColors[status]}`}>
          {tasks.length}
        </span>
      </div>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-2 overflow-y-auto min-h-0">
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} />
          ))}
          {tasks.length === 0 && (
                  <div className="text-center py-4 text-gray-400 dark:text-gray-500 text-xs">
              No tasks
            </div>
          )}
        </div>
      </SortableContext>
      {/* Empty drop zone when column is empty */}
      {tasks.length === 0 && (
        <div className="flex-1 min-h-[200px]" />
      )}
    </div>
  );
}

export function KanbanBoard() {
  const { filteredTasks, updateTask } = useTaskManager();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before starting drag
      },
    })
    // Removed KeyboardSensor to prevent interference with input/textarea keyboard events
    // Users can still drag with mouse/touch
  );

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      'todo': [],
      'in-progress': [],
      'in-review': [],
      'blocked': [],
      'completed': [],
    };

    filteredTasks.forEach(task => {
      const status = (task.status || 'todo') as TaskStatus;
      // Ensure status is valid, default to 'todo' if not
      if (grouped[status]) {
        grouped[status].push(task);
      } else {
        // Fallback to 'todo' if status is invalid
        grouped['todo'].push(task);
      }
    });

    return grouped;
  }, [filteredTasks]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id as string;
    
    // Find the task
    const task = filteredTasks.find(t => t.id === taskId);
    if (!task) return;

    // Determine the target status
    let newStatus: TaskStatus | null = null;
    
    // First check if over.data indicates it's a column
    if (over.data?.current?.type === 'column' && over.data?.current?.status) {
      newStatus = over.data.current.status as TaskStatus;
    }
    // Check if over.id is a valid TaskStatus (dropped on column)
    else if (statusOrder.includes(over.id as TaskStatus)) {
      newStatus = over.id as TaskStatus;
    } 
    // Dropped on a task - find which column that task belongs to
    else {
      const targetTask = filteredTasks.find(t => t.id === over.id);
      if (targetTask && targetTask.status) {
        newStatus = targetTask.status;
      }
    }

    // If we couldn't determine the status, abort
    if (!newStatus) return;

    // Only update if status changed
    if (task.status !== newStatus) {
      updateTask(taskId, {
        status: newStatus,
        completed: newStatus === 'completed',
      });
    }
  };

  const activeTask = activeId ? filteredTasks.find(t => t.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 h-full">
        {statusOrder.map((status) => (
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700 flex flex-col"
          >
            <KanbanColumn status={status} tasks={tasksByStatus[status]} />
          </motion.div>
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="opacity-90 rotate-3">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

