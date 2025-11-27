'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTaskManager } from '@/context/TaskManagerContext';
import { Link2, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export function TaskDependencies() {
  const { tasks, updateTask } = useTaskManager();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) : null;

  const availableTasks = useMemo(() => {
    if (!selectedTaskId) return tasks;
    return tasks.filter(t => t.id !== selectedTaskId);
  }, [tasks, selectedTaskId]);

  const dependencyGraph = useMemo(() => {
    if (!selectedTask) return null;

    const dependsOn = selectedTask.dependsOn || [];
    const blocks = selectedTask.blocks || [];

    const blockingTasks = tasks.filter(t => t.dependsOn?.includes(selectedTask.id));
    const dependentTasks = tasks.filter(t => t.blocks?.includes(selectedTask.id));

    return {
      dependsOn: dependsOn.map(id => tasks.find(t => t.id === id)).filter(Boolean),
      blocks: blocks.map(id => tasks.find(t => t.id === id)).filter(Boolean),
      blockingTasks,
      dependentTasks,
    };
  }, [selectedTask, tasks]);

  const canComplete = useMemo(() => {
    if (!selectedTask || !selectedTask.dependsOn || selectedTask.dependsOn.length === 0) {
      return true;
    }
    const dependencies = tasks.filter(t => selectedTask.dependsOn?.includes(t.id));
    return dependencies.every(t => t.completed);
  }, [selectedTask, tasks]);

  const handleAddDependency = (dependencyId: string) => {
    if (!selectedTaskId) return;
    
    const task = tasks.find(t => t.id === selectedTaskId);
    if (!task) return;

    const currentDependsOn = task.dependsOn || [];
    if (currentDependsOn.includes(dependencyId)) return;

    // Prevent circular dependencies - check for direct and indirect cycles
    const dependencyTask = tasks.find(t => t.id === dependencyId);
    if (!dependencyTask) return;

    // Check direct circular dependency
    if (dependencyTask.dependsOn?.includes(selectedTaskId)) {
      alert('Circular dependency detected! This would create a loop.');
      return;
    }

    // Check for indirect circular dependency (A -> B -> C -> A)
    const checkCircularDependency = (taskId: string, visited: Set<string>): boolean => {
      if (visited.has(taskId)) return true; // Cycle detected
      visited.add(taskId);
      const currentTask = tasks.find(t => t.id === taskId);
      if (!currentTask || !currentTask.dependsOn) return false;
      return currentTask.dependsOn.some(depId => checkCircularDependency(depId, new Set(visited)));
    };

    if (checkCircularDependency(dependencyId, new Set([selectedTaskId]))) {
      alert('Circular dependency detected! This would create a loop.');
      return;
    }

    updateTask(selectedTaskId, {
      dependsOn: [...currentDependsOn, dependencyId],
    });
  };

  const handleRemoveDependency = (dependencyId: string) => {
    if (!selectedTaskId) return;
    
    const task = tasks.find(t => t.id === selectedTaskId);
    if (!task) return;

    const currentDependsOn = task.dependsOn || [];
    updateTask(selectedTaskId, {
      dependsOn: currentDependsOn.filter(id => id !== dependencyId),
    });
  };

  const handleAddBlocking = (blockingId: string) => {
    if (!selectedTaskId) return;
    
    const task = tasks.find(t => t.id === selectedTaskId);
    if (!task) return;

    const currentBlocks = task.blocks || [];
    if (currentBlocks.includes(blockingId)) return;

    // Prevent circular dependencies
    const blockingTask = tasks.find(t => t.id === blockingId);
    if (!blockingTask) return;

    // Check direct circular dependency
    if (blockingTask.blocks?.includes(selectedTaskId)) {
      alert('Circular dependency detected! This would create a loop.');
      return;
    }

    // Check if blocking task already depends on selected task (would create cycle)
    if (blockingTask.dependsOn?.includes(selectedTaskId)) {
      alert('Circular dependency detected! This would create a loop.');
      return;
    }

    // Also update the blocking task to depend on this one
    const blockingTaskCurrent = tasks.find(t => t.id === blockingId);
    if (blockingTaskCurrent) {
      const blockingDependsOn = blockingTaskCurrent.dependsOn || [];
      if (!blockingDependsOn.includes(selectedTaskId)) {
        updateTask(blockingId, {
          dependsOn: [...blockingDependsOn, selectedTaskId],
        });
      }
    }

    updateTask(selectedTaskId, {
      blocks: [...currentBlocks, blockingId],
    });
  };

  const handleRemoveBlocking = (blockingId: string) => {
    if (!selectedTaskId) return;
    
    const task = tasks.find(t => t.id === selectedTaskId);
    if (!task) return;

    const currentBlocks = task.blocks || [];
    updateTask(selectedTaskId, {
      blocks: currentBlocks.filter(id => id !== blockingId),
    });

    // Also remove from the blocking task's dependsOn
    const blockingTask = tasks.find(t => t.id === blockingId);
    if (blockingTask) {
      const blockingDependsOn = blockingTask.dependsOn || [];
      updateTask(blockingId, {
        dependsOn: blockingDependsOn.filter(id => id !== selectedTaskId),
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Task Dependencies
        </h1>
        <p className="text-gray-600">Manage task dependencies and relationships</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Selector */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Select Task</h2>
            <select
              value={selectedTaskId || ''}
              onChange={(e) => setSelectedTaskId(e.target.value || null)}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors"
            >
              <option value="">-- Select a task --</option>
              {tasks.map(task => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dependency View */}
        {selectedTask ? (
          <div className="lg:col-span-2 space-y-6">
            {/* Status */}
            <div className={`bg-white rounded-2xl p-6 shadow-lg border-2 ${
              canComplete ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-center gap-3">
                {canComplete ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                )}
                <div>
                  <h3 className="font-bold text-gray-800">
                    {canComplete ? 'Ready to Complete' : 'Blocked by Dependencies'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {canComplete
                      ? 'All dependencies are completed'
                      : 'Some dependencies are not yet completed'}
                  </p>
                </div>
              </div>
            </div>

            {/* Depends On */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-purple-600" />
                  Depends On
                </h3>
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddDependency(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="px-3 py-1 text-sm rounded-lg border border-gray-200 focus:border-purple-400 focus:outline-none"
                >
                  <option value="">Add dependency...</option>
                  {availableTasks
                    .filter(t => !selectedTask.dependsOn?.includes(t.id))
                    .map(task => (
                      <option key={task.id} value={task.id}>
                        {task.title}
                      </option>
                    ))}
                </select>
              </div>
              {dependencyGraph && dependencyGraph.dependsOn.length > 0 ? (
                <div className="space-y-2">
                  {dependencyGraph.dependsOn.map(task => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{task.title}</div>
                        <div className="text-sm text-gray-600">
                          {task.completed ? (
                            <span className="text-green-600">✓ Completed</span>
                          ) : (
                            <span className="text-red-600">✗ Not completed</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveDependency(task.id)}
                        className="px-3 py-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No dependencies</p>
              )}
            </div>

            {/* Blocks */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-purple-600" />
                  Blocks
                </h3>
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddBlocking(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="px-3 py-1 text-sm rounded-lg border border-gray-200 focus:border-purple-400 focus:outline-none"
                >
                  <option value="">Add blocking task...</option>
                  {availableTasks
                    .filter(t => !selectedTask.blocks?.includes(t.id))
                    .map(task => (
                      <option key={task.id} value={task.id}>
                        {task.title}
                      </option>
                    ))}
                </select>
              </div>
              {dependencyGraph && dependencyGraph.blocks.length > 0 ? (
                <div className="space-y-2">
                  {dependencyGraph.blocks.map(task => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{task.title}</div>
                        <div className="text-sm text-gray-600">This task must complete first</div>
                      </div>
                      <button
                        onClick={() => handleRemoveBlocking(task.id)}
                        className="px-3 py-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No blocking tasks</p>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-white rounded-2xl p-12 shadow-lg border border-gray-200 text-center">
            <Link2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a Task</h3>
            <p className="text-gray-500">Choose a task to manage its dependencies</p>
          </div>
        )}
      </div>
    </div>
  );
}

