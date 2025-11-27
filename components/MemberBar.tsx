'use client';

import { motion } from 'framer-motion';
import { useTaskManager } from '@/context/TaskManagerContext';
import { useGamification } from '@/hooks/useGamification';
import { User } from 'lucide-react';

export function MemberBar() {
  const { members, selectedMemberId, setSelectedMember } = useTaskManager();
  const { getMemberProgress } = useGamification();

  return (
    <div className="w-full bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {members.map((member, index) => {
            const progress = getMemberProgress(member);
            const isSelected = member.id === selectedMemberId;

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedMember(member.id)}
                className={`
                  flex-shrink-0 flex flex-col gap-2 p-4 rounded-xl cursor-pointer transition-all
                  ${isSelected 
                    ? 'bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300 shadow-md' 
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold shadow-md">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{member.name}</div>
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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white text-2xl font-bold shadow-md hover:shadow-lg transition-shadow"
            onClick={() => {
              const name = prompt('Enter member name:');
              if (name) {
                // This will be handled by the Dashboard component
                window.dispatchEvent(new CustomEvent('add-member', { detail: { name } }));
              }
            }}
          >
            +
          </motion.button>
        </div>
      </div>
    </div>
  );
}

