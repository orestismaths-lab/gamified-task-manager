'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, CheckSquare, Users, Database, BarChart3, FileText, Calendar, Award, Moon, Sun, Bell, Link2, Download, UserCircle } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

type ViewType = 'tasks' | 'members' | 'data' | 'statistics' | 'templates' | 'calendar' | 'achievements' | 'notifications' | 'dependencies' | 'export' | 'profile';

interface SidebarMenuProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function SidebarMenu({ activeView, onViewChange }: SidebarMenuProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { isDark, toggleTheme } = useTheme();

  return (
    <>
      {/* Burger Button (always visible when closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed left-2 sm:left-4 top-2 sm:top-4 p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors z-50"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" />
        </button>
      )}

      <motion.div
        initial={{ width: 0 }}
        animate={{ width: isOpen ? 320 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-white/95 backdrop-blur-md border-r border-gray-200 shadow-xl flex-shrink-0 flex flex-col sidebar-scroll h-screen sticky top-0 overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-2 sm:right-4 top-2 sm:top-4 p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors z-10"
          aria-label="Close menu"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" />
        </button>

      {/* Menu Content */}
      <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Menu
          </h2>
        </div>

        <nav className="space-y-2">
          <motion.button
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onViewChange('tasks')}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left
              ${activeView === 'tasks'
                ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 shadow-md'
                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              }
            `}
          >
            <CheckSquare className={`w-5 h-5 ${activeView === 'tasks' ? 'text-purple-600' : 'text-gray-600'}`} />
            <span className={`font-semibold ${activeView === 'tasks' ? 'text-purple-700' : 'text-gray-700'}`}>
              Task Manager
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onViewChange('members')}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left
              ${activeView === 'members'
                ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 shadow-md'
                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              }
            `}
          >
            <Users className={`w-5 h-5 ${activeView === 'members' ? 'text-purple-600' : 'text-gray-600'}`} />
            <span className={`font-semibold ${activeView === 'members' ? 'text-purple-700' : 'text-gray-700'}`}>
              Members
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onViewChange('statistics')}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left
              ${activeView === 'statistics'
                ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 shadow-md'
                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              }
            `}
          >
            <BarChart3 className={`w-5 h-5 ${activeView === 'statistics' ? 'text-purple-600' : 'text-gray-600'}`} />
            <span className={`font-semibold ${activeView === 'statistics' ? 'text-purple-700' : 'text-gray-700'}`}>
              Statistics
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onViewChange('templates')}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left
              ${activeView === 'templates'
                ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 shadow-md'
                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              }
            `}
          >
            <FileText className={`w-5 h-5 ${activeView === 'templates' ? 'text-purple-600' : 'text-gray-600'}`} />
            <span className={`font-semibold ${activeView === 'templates' ? 'text-purple-700' : 'text-gray-700'}`}>
              Templates
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onViewChange('calendar')}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left
              ${activeView === 'calendar'
                ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 shadow-md'
                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              }
            `}
          >
            <Calendar className={`w-5 h-5 ${activeView === 'calendar' ? 'text-purple-600' : 'text-gray-600'}`} />
            <span className={`font-semibold ${activeView === 'calendar' ? 'text-purple-700' : 'text-gray-700'}`}>
              Calendar
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onViewChange('achievements')}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left
              ${activeView === 'achievements'
                ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 shadow-md'
                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              }
            `}
          >
            <Award className={`w-5 h-5 ${activeView === 'achievements' ? 'text-purple-600' : 'text-gray-600'}`} />
            <span className={`font-semibold ${activeView === 'achievements' ? 'text-purple-700' : 'text-gray-700'}`}>
              Achievements
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onViewChange('export')}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left
              ${activeView === 'export'
                ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 shadow-md'
                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              }
            `}
          >
            <Download className={`w-5 h-5 ${activeView === 'export' ? 'text-purple-600' : 'text-gray-600'}`} />
            <span className={`font-semibold ${activeView === 'export' ? 'text-purple-700' : 'text-gray-700'}`}>
              Export & Print
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onViewChange('data')}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left
              ${activeView === 'data'
                ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 shadow-md'
                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              }
            `}
          >
            <Database className={`w-5 h-5 ${activeView === 'data' ? 'text-purple-600' : 'text-gray-600'}`} />
            <span className={`font-semibold ${activeView === 'data' ? 'text-purple-700' : 'text-gray-700'}`}>
              Data Management
            </span>
          </motion.button>

          <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

          <motion.button
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onViewChange('notifications')}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left
              ${activeView === 'notifications'
                ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 shadow-md'
                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              }
            `}
          >
            <Bell className={`w-5 h-5 ${activeView === 'notifications' ? 'text-purple-600' : 'text-gray-600'}`} />
            <span className={`font-semibold ${activeView === 'notifications' ? 'text-purple-700' : 'text-gray-700'}`}>
              Notifications
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onViewChange('dependencies')}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left
              ${activeView === 'dependencies'
                ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 shadow-md'
                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              }
            `}
          >
            <Link2 className={`w-5 h-5 ${activeView === 'dependencies' ? 'text-purple-600' : 'text-gray-600'}`} />
            <span className={`font-semibold ${activeView === 'dependencies' ? 'text-purple-700' : 'text-gray-700'}`}>
              Dependencies
            </span>
          </motion.button>

          <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

          <motion.button
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onViewChange('profile')}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left
              ${activeView === 'profile'
                ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 shadow-md'
                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              }
            `}
          >
            <UserCircle className={`w-5 h-5 ${activeView === 'profile' ? 'text-purple-600' : 'text-gray-600'}`} />
            <span className={`font-semibold ${activeView === 'profile' ? 'text-purple-700' : 'text-gray-700'}`}>
              Profile
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
          </motion.button>
        </nav>
      </div>
      </motion.div>
    </>
  );
}

