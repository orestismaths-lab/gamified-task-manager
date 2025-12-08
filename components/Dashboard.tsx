'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, X } from 'lucide-react';
import { useTaskManager } from '@/context/TaskManagerContext';
import { SidebarMenu } from './SidebarMenu';
import { TaskInput } from './TaskInput';
import { TaskCard } from './TaskCard';
import { KanbanBoard } from './KanbanBoard';
import { MemberManagement } from './MemberManagement';
import { DataManagement } from './DataManagement';
import { DataMigration } from './DataMigration';
import { StatisticsDashboard } from './StatisticsDashboard';
import { TaskTemplates } from './TaskTemplates';
import { CalendarView } from './CalendarView';
import { Achievements } from './Achievements';
import { NotificationSettings } from './NotificationSettings';
import { TaskDependencies } from './TaskDependencies';
import { ExportOptions } from './ExportOptions';
import { Profile } from './Profile';
import { Priority, TaskStatus } from '@/types';
import { triggerConfetti } from '@/lib/confetti';
import { setupNotificationCheck } from '@/lib/notifications';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from './AuthModal';
import { StorageIndicator } from './StorageIndicator';

type ViewType = 'tasks' | 'members' | 'data' | 'statistics' | 'templates' | 'calendar' | 'achievements' | 'notifications' | 'dependencies' | 'export' | 'profile';

export function Dashboard() {
  const { user, member, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>('tasks');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const [hasMigrated, setHasMigrated] = useState<boolean | null>(null); // null = loading, true/false = loaded
  const {
    filteredTasks,
    tasks,
    members,
    setSelectedMember,
    filterByOwner,
    filterByStatus,
    filterByPriority,
    setSearchQuery,
    activeFilters,
  } = useTaskManager();

  // Show auth modal if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthModal(true);
    }
  }, [user, authLoading]);

  // Check migration status when user is logged in
  useEffect(() => {
    if (user?.id && !authLoading) {
      fetch('/api/migration-status', {
        credentials: 'include',
      })
        .then(res => res.json())
        .then(data => {
          if (data.hasMigrated !== undefined) {
            setHasMigrated(data.hasMigrated);
          }
        })
        .catch(err => {
          console.error('Error checking migration status:', err);
          setHasMigrated(false); // Default to false on error
        });
    } else {
      setHasMigrated(null);
    }
  }, [user, authLoading]);

  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  // Handle member selection from TaskInput
  useEffect(() => {
    const handleSelectMember = (e: CustomEvent) => {
      setSelectedMember(e.detail.memberId);
    };

    window.addEventListener('select-member' as any, handleSelectMember);

    return () => {
      window.removeEventListener('select-member' as any, handleSelectMember);
    };
  }, [setSelectedMember]);

  // Handle achievement unlocked
  useEffect(() => {
    const handleAchievementUnlocked = (e: CustomEvent) => {
      triggerConfetti();
      // Show notification if possible
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Achievement Unlocked! 🎉', {
          body: `${e.detail.achievement.name}: ${e.detail.achievement.description}`,
          icon: '🎯',
        });
      }
    };

    window.addEventListener('achievement-unlocked' as any, handleAchievementUnlocked);

    return () => {
      window.removeEventListener('achievement-unlocked' as any, handleAchievementUnlocked);
    };
  }, []);

  // Setup notification checking (only in browser)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const cleanup = setupNotificationCheck(tasks);
    return cleanup;
  }, [tasks]);

  // Show loading or auth modal
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          if (user) setShowAuthModal(false);
        }}
        onSuccess={() => setShowAuthModal(false)}
      />
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
        {/* Burger Menu */}
        <SidebarMenu activeView={activeView} onViewChange={setActiveView} />

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden bg-gray-50 dark:bg-gray-900">
        {activeView === 'tasks' ? (
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header with Filters */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Task Manager
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Stay organized, level up! 🎮</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 flex-wrap w-full sm:w-auto">
            {/* Search Bar */}
            <div className="flex-1 min-w-[150px] sm:min-w-[200px] max-w-full sm:max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                placeholder="Search tasks..."
                className="w-full pl-10 pr-10 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-purple-400 dark:focus:border-purple-500 focus:outline-none transition-colors"
              />
              {searchInput && (
                <button
                  onClick={() => {
                    setSearchInput('');
                    setSearchQuery('');
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-xl shadow-md transition-all flex items-center gap-2 ${
                showFilters
                  ? 'bg-purple-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Filter className="w-5 h-5" />
              Filters
            </motion.button>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Owner Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Owner</label>
                  <select
                    value={activeFilters.ownerId || 'all'}
                    onChange={(e) => filterByOwner(e.target.value === 'all' ? null : e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-400 dark:focus:border-purple-500 focus:outline-none"
                  >
                    <option value="all">All Owners</option>
                    {members.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                  <select
                    value={activeFilters.status}
                    onChange={(e) => filterByStatus(e.target.value as 'all' | 'active' | 'completed')}
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-400 dark:focus:border-purple-500 focus:outline-none"
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                  <select
                    value={activeFilters.priority}
                    onChange={(e) => filterByPriority(e.target.value as Priority | 'all')}
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-400 dark:focus:border-purple-500 focus:outline-none"
                  >
                    <option value="all">All</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Task Input */}
        <TaskInput />

        {/* Task List */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Tasks ({filteredTasks.length} / {tasks.length} total)
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  viewMode === 'list'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Kanban
              </button>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700"
            >
              <p className="text-gray-500 dark:text-gray-400 text-lg">No tasks found. Create your first task above! 🚀</p>
            </motion.div>
          ) : viewMode === 'kanban' ? (
            <KanbanBoard />
          ) : (
            <div className="space-y-8">
              {(['todo', 'in-progress', 'in-review', 'blocked', 'completed'] as TaskStatus[]).map((status) => {
                const statusTasks = filteredTasks.filter(task => (task.status || 'todo') === status);
                if (statusTasks.length === 0) return null;

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

                return (
                  <motion.div
                    key={status}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                        {statusLabels[status]}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${statusColors[status]}`}>
                        {statusTasks.length}
                      </span>
                    </div>
                    <motion.div
                      layout
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                      <AnimatePresence mode="popLayout">
                        {statusTasks.map((task) => (
                          <TaskCard key={task.id} task={task} />
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
          </div>
        ) : activeView === 'members' ? (
          <MemberManagement />
        ) : activeView === 'statistics' ? (
          <StatisticsDashboard />
        ) : activeView === 'templates' ? (
          <TaskTemplates />
        ) : activeView === 'calendar' ? (
          <CalendarView />
        ) : activeView === 'achievements' ? (
          <Achievements />
        ) : activeView === 'notifications' ? (
          <NotificationSettings />
        ) : activeView === 'dependencies' ? (
          <TaskDependencies />
        ) : activeView === 'export' ? (
          <ExportOptions />
        ) : activeView === 'profile' ? (
          <Profile />
        ) : activeView === 'data' ? (
          <div className="space-y-8">
            {/* Only show DataMigration if migration hasn't been completed */}
            {hasMigrated === false && <DataMigration />}
            <DataManagement />
          </div>
        ) : null}
      </div>
      
      {/* Storage Indicator - Shows if tasks are in database or localStorage */}
      <StorageIndicator />
    </div>
    </>
  );
}

