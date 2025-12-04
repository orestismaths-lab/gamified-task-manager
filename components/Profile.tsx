'use client';

import { motion } from 'framer-motion';
import { User, Mail, LogOut, Award, TrendingUp, Calendar, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTaskManager } from '@/context/TaskManagerContext';
import { format } from 'date-fns';

export function Profile() {
  const { user, member, signOut } = useAuth();
  const { tasks, members } = useTaskManager();

  // Calculate stats
  const userTasks = tasks.filter(task => 
    task.assignedTo?.includes(member?.id || '') || 
    task.ownerId === member?.id ||
    task.createdBy === user?.id
  );
  const completedTasks = userTasks.filter(task => task.completed || task.status === 'completed');
  const inProgressTasks = userTasks.filter(task => task.status === 'in-progress');
  
  // Calculate XP needed for next level
  // XP needed for next level = (currentLevel + 1) * 100 - currentXP
  const xpForNextLevel = member ? Math.max(0, ((member.level + 1) * 100) - member.xp) : 0;
  const xpProgress = member ? Math.min(1, (member.xp % 100) / 100) : 0;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                {member?.avatar ? (
                  <span className="text-2xl sm:text-3xl">{member.avatar}</span>
                ) : (
                  <User className="w-6 h-6 sm:w-8 sm:h-8" />
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-3xl font-bold truncate">
                  {member?.name || user?.name || 'User'}
                </h1>
                <p className="text-purple-100 text-xs sm:text-sm mt-1 truncate">
                  {user?.email || 'No email'}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSignOut}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Sign Out</span>
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Authentication Status */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-semibold text-green-800 dark:text-green-300">
                  {user ? '✅ Logged In' : '❌ Not Logged In'}
                </p>
                {user && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Authenticated as: {user.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">Email</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">{user?.email || 'N/A'}</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">Display Name</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {member?.name || user?.name || 'N/A'}
              </p>
            </div>


            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">User ID</h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 font-mono break-all">
                {user?.id || 'N/A'}
              </p>
            </div>
          </div>

          {/* Gamification Stats */}
          {member && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <Award className="w-6 h-6 text-purple-600" />
                  Gamification Stats
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <h3 className="font-semibold text-purple-700 dark:text-purple-300">Level</h3>
                    </div>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {member.level}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-semibold text-blue-700 dark:text-blue-300">XP</h3>
                    </div>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {member.xp}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <h3 className="font-semibold text-green-700 dark:text-green-300">Completed Tasks</h3>
                    </div>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {completedTasks.length}
                    </p>
                  </div>
                </div>

                {/* XP Progress Bar */}
                <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Progress to Level {member.level + 1}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {member.xp % 100} / 100 XP
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${xpProgress * 100}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {xpForNextLevel} XP needed for next level
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Task Stats */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Task Statistics
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">
                  Total Tasks
                </h3>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {userTasks.length}
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                <h3 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-1">
                  Completed
                </h3>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {completedTasks.length}
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
                <h3 className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-1">
                  In Progress
                </h3>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {inProgressTasks.length}
                </p>
              </div>
            </div>
          </div>

          {/* Member Info (if different from user) */}
          {member && member.userId && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                Member Profile
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Member ID:</strong> {member.id}
                </p>
                {member.email && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <strong>Email:</strong> {member.email}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

