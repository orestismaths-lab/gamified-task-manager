'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTaskManager } from '@/context/TaskManagerContext';
import { 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Award, 
  Target,
  Calendar,
  BarChart3,
  Users
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO, isValid } from 'date-fns';

export function StatisticsDashboard() {
  const { tasks, members } = useTaskManager();

  const stats = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Overall stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const activeTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // This week stats
    const tasksThisWeek = tasks.filter(task => {
      if (!task.createdAt) return false;
      const taskDate = parseISO(task.createdAt);
      return isWithinInterval(taskDate, { start: weekStart, end: weekEnd });
    });
    const completedThisWeek = tasks.filter(task => {
      if (!task.updatedAt || !task.completed) return false;
      const taskDate = parseISO(task.updatedAt);
      return isWithinInterval(taskDate, { start: weekStart, end: weekEnd }) && task.completed;
    });

    // This month stats
    const tasksThisMonth = tasks.filter(task => {
      if (!task.createdAt) return false;
      const taskDate = parseISO(task.createdAt);
      return isWithinInterval(taskDate, { start: monthStart, end: monthEnd });
    });
    const completedThisMonth = tasks.filter(task => {
      if (!task.updatedAt || !task.completed) return false;
      const taskDate = parseISO(task.updatedAt);
      return isWithinInterval(taskDate, { start: monthStart, end: monthEnd }) && task.completed;
    });

    // Priority breakdown
    const highPriority = tasks.filter(t => t.priority === 'high').length;
    const mediumPriority = tasks.filter(t => t.priority === 'medium').length;
    const lowPriority = tasks.filter(t => t.priority === 'low').length;

    // Overdue tasks
    const overdueTasks = tasks.filter(task => {
      if (task.completed || !task.dueDate) return false;
      try {
        const dueDate = parseISO(task.dueDate);
        if (!isValid(dueDate)) return false;
        return dueDate < now;
      } catch {
        return false;
      }
    });

    // Member stats
    const memberStats = members.map(member => {
      const memberTasks = tasks.filter(t => t.ownerId === member.id);
      const memberCompleted = memberTasks.filter(t => t.completed).length;
      return {
        member,
        totalTasks: memberTasks.length,
        completedTasks: memberCompleted,
        completionRate: memberTasks.length > 0 ? (memberCompleted / memberTasks.length) * 100 : 0,
        xp: member.xp,
        level: member.level,
      };
    }).sort((a, b) => b.completedTasks - a.completedTasks);

    // Tags usage
    const tagCounts: Record<string, number> = {};
    tasks.forEach(task => {
      task.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      totalTasks,
      completedTasks,
      activeTasks,
      completionRate,
      tasksThisWeek: tasksThisWeek.length,
      completedThisWeek: completedThisWeek.length,
      tasksThisMonth: tasksThisMonth.length,
      completedThisMonth: completedThisMonth.length,
      highPriority,
      mediumPriority,
      lowPriority,
      overdueTasks: overdueTasks.length,
      memberStats,
      topTags,
    };
  }, [tasks, members]);

  const StatCard = ({ 
    icon: Icon, 
    title, 
    value, 
    subtitle, 
    color = 'purple' 
  }: { 
    icon: any; 
    title: string; 
    value: string | number; 
    subtitle?: string;
    color?: 'purple' | 'green' | 'blue' | 'orange' | 'red';
  }) => {
    const colorClasses = {
      purple: 'from-purple-500 to-pink-500',
      green: 'from-green-500 to-emerald-500',
      blue: 'from-blue-500 to-cyan-500',
      orange: 'from-orange-500 to-amber-500',
      red: 'from-red-500 to-pink-500',
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-md`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-800 mb-1">{value}</div>
        <div className="text-sm font-medium text-gray-600">{title}</div>
        {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
      </motion.div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Statistics & Analytics
        </h1>
        <p className="text-gray-600 mt-1">Track your productivity and progress</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Target}
          title="Total Tasks"
          value={stats.totalTasks}
          subtitle={`${stats.completedTasks} completed`}
          color="purple"
        />
        <StatCard
          icon={CheckCircle2}
          title="Completion Rate"
          value={`${stats.completionRate.toFixed(1)}%`}
          subtitle={`${stats.activeTasks} active`}
          color="green"
        />
        <StatCard
          icon={Calendar}
          title="This Week"
          value={stats.completedThisWeek}
          subtitle={`${stats.tasksThisWeek} created`}
          color="blue"
        />
        <StatCard
          icon={Clock}
          title="Overdue"
          value={stats.overdueTasks}
          subtitle="Tasks past due date"
          color="red"
        />
      </div>

      {/* Priority Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-purple-600" />
          Priority Distribution
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-xl">
            <div className="text-3xl font-bold text-red-600">{stats.highPriority}</div>
            <div className="text-sm text-gray-600 mt-1">High Priority</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-xl">
            <div className="text-3xl font-bold text-orange-600">{stats.mediumPriority}</div>
            <div className="text-sm text-gray-600 mt-1">Medium Priority</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="text-3xl font-bold text-blue-600">{stats.lowPriority}</div>
            <div className="text-sm text-gray-600 mt-1">Low Priority</div>
          </div>
        </div>
      </motion.div>

      {/* Member Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="w-6 h-6 text-purple-600" />
          Member Leaderboard
        </h2>
        <div className="space-y-3">
          {stats.memberStats.map((stat, index) => (
            <motion.div
              key={stat.member.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="text-2xl font-bold text-gray-400 w-8">#{index + 1}</div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold shadow-md">
                  {stat.member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{stat.member.name}</div>
                  <div className="text-sm text-gray-500">Level {stat.member.level} • {stat.member.xp} XP</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-800">{stat.completedTasks} tasks</div>
                <div className="text-sm text-gray-500">{stat.completionRate.toFixed(0)}% completion</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Top Tags */}
      {stats.topTags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-purple-600" />
            Most Used Tags
          </h2>
          <div className="flex flex-wrap gap-3">
            {stats.topTags.map(([tag, count], index) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl border-2 border-purple-200"
              >
                <span className="font-semibold text-purple-700">{tag}</span>
                <span className="ml-2 text-sm text-purple-600">({count})</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Monthly Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-purple-600" />
          This Month Progress
        </h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Tasks Completed</span>
              <span>{stats.completedThisMonth} / {stats.tasksThisMonth}</span>
            </div>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.tasksThisMonth > 0 ? (stats.completedThisMonth / stats.tasksThisMonth) * 100 : 0}%` }}
                transition={{ duration: 1, delay: 0.6 }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">{stats.tasksThisMonth}</div>
              <div className="text-sm text-gray-600">Created</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">{stats.completedThisMonth}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

