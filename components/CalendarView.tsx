'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTaskManager } from '@/context/TaskManagerContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay, parseISO, isValid } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export function CalendarView() {
  const { tasks } = useTaskManager();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get first day of week (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = getDay(monthStart);
  // Adjust for Monday start (if first day is Sunday (0), make it 6)
  const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  // Add empty cells for days before month starts
  const emptyDays = Array(adjustedFirstDay).fill(null);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, typeof tasks>();
    tasks.forEach(task => {
      if (task.dueDate) {
        try {
          const parsedDate = parseISO(task.dueDate);
          if (!isValid(parsedDate)) return;
          const dateKey = format(parsedDate, 'yyyy-MM-dd');
          if (!map.has(dateKey)) {
            map.set(dateKey, []);
          }
          map.get(dateKey)!.push(task);
        } catch {
          // Invalid date, skip
        }
      }
    });
    return map;
  }, [tasks]);

  const getTasksForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return tasksByDate.get(dateKey) || [];
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Calendar View
        </h1>
        <p className="text-gray-600">View your tasks on a calendar</p>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </motion.button>

          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={goToToday}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-semibold hover:bg-purple-200 transition-colors"
            >
              Today
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </motion.button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Week day headers */}
          {weekDays.map(day => (
            <div key={day} className="text-center font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}

          {/* Empty cells for days before month starts */}
          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {/* Calendar days */}
          {daysInMonth.map((day, index) => {
            const dayTasks = getTasksForDate(day);
            const today = isToday(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <motion.div
                key={day.toISOString()}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                className={`
                  aspect-square border-2 rounded-xl p-2 cursor-pointer transition-all
                  ${today 
                    ? 'border-purple-500 bg-purple-50 shadow-md' 
                    : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }
                  ${!isCurrentMonth ? 'opacity-50' : ''}
                `}
              >
                <div className="flex flex-col h-full">
                  <div className={`
                    text-sm font-semibold mb-1
                    ${today ? 'text-purple-700' : 'text-gray-700'}
                  `}>
                    {format(day, 'd')}
                  </div>
                  <div className="flex-1 overflow-hidden space-y-1">
                    {dayTasks.slice(0, 3).map(task => (
                      <div
                        key={task.id}
                        className={`
                          text-xs px-1.5 py-0.5 rounded truncate
                          ${task.completed 
                            ? 'bg-gray-200 text-gray-600 line-through' 
                            : task.priority === 'high' 
                              ? 'bg-red-100 text-red-700' 
                              : task.priority === 'medium' 
                                ? 'bg-orange-100 text-orange-700' 
                                : 'bg-blue-100 text-blue-700'
                          }
                        `}
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-gray-500 font-semibold">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Task List for Selected Date (if needed) */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-purple-600" />
          All Tasks This Month
        </h3>
        <div className="space-y-2">
          {Array.from(tasksByDate.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([dateKey, dateTasks]) => (
              <div key={dateKey} className="border-l-4 border-purple-400 pl-4 py-2">
                <div className="font-semibold text-gray-700 mb-2">
                  {format(parseISO(dateKey), 'EEEE, dd/MM/yyyy')}
                </div>
                <div className="space-y-2">
                  {dateTasks.map(task => (
                    <div
                      key={task.id}
                      className={`
                        p-3 rounded-lg border-2
                        ${task.completed 
                          ? 'bg-gray-50 border-gray-200' 
                          : task.priority === 'high' 
                            ? 'bg-red-50 border-red-200' 
                            : task.priority === 'medium' 
                              ? 'bg-orange-50 border-orange-200' 
                              : 'bg-blue-50 border-blue-200'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className={`font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {task.title}
                          </div>
                          {task.description && (
                            <div className="text-sm text-gray-600 mt-1">{task.description}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {task.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          {tasksByDate.size === 0 && (
            <div className="text-center py-8 text-gray-500">
              No tasks with due dates this month
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

