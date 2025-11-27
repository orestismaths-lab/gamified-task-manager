'use client';

import { motion } from 'framer-motion';
import { useTaskManager } from '@/context/TaskManagerContext';
import { useGamification } from '@/hooks/useGamification';
import { UserPlus } from 'lucide-react';

export function Sidebar() {
  const { members, selectedMemberId, setSelectedMember, addMember } = useTaskManager();
  const { getMemberProgress } = useGamification();

  const handleAddMember = () => {
    const name = prompt('Enter member name:');
    if (name && name.trim()) {
      addMember({ name: name.trim() });
    }
  };

  return (
    <div className="w-80 bg-white/95 backdrop-blur-md border-r border-gray-200 shadow-lg h-screen sticky top-0 overflow-y-auto flex-shrink-0 sidebar-scroll">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Members
          </h2>
          <p className="text-sm text-gray-500 mt-1">XP & Levels</p>
        </div>

        {/* Members List */}
        <div className="space-y-3">
          {members.map((member, index) => {
            const progress = getMemberProgress(member);
            const isSelected = member.id === selectedMemberId;

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedMember(member.id)}
                className={`
                  p-4 rounded-xl cursor-pointer transition-all
                  ${isSelected 
                    ? 'bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300 shadow-md' 
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }
                `}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 truncate">{member.name}</div>
                    <div className="text-xs text-gray-500">Level {member.level}</div>
                  </div>
                </div>

                <div className="w-full">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{member.xp} XP</span>
                    <span>{progress.xpForNextLevel} XP</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress.progress}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Add Member Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddMember}
            className="w-full p-4 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center gap-2 text-white font-semibold shadow-md hover:shadow-lg transition-shadow"
          >
            <UserPlus className="w-5 h-5" />
            Add Member
          </motion.button>
        </div>
      </div>
    </div>
  );
}

