'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTaskManager } from '@/context/TaskManagerContext';
import { ACHIEVEMENTS, achievementStorage, UnlockedAchievement } from '@/lib/achievements';
import { Award, Lock, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

export function Achievements() {
  const { members, tasks } = useTaskManager();
  const [unlocked, setUnlocked] = useState<UnlockedAchievement[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  useEffect(() => {
    setUnlocked(achievementStorage.getUnlocked());
  }, [members, tasks]);

  // Check for new achievements
  useEffect(() => {
    members.forEach(member => {
      ACHIEVEMENTS.forEach(achievement => {
        const memberUnlocked = achievementStorage.getMemberAchievements(member.id);
        if (!memberUnlocked.includes(achievement.id)) {
          if (achievement.condition(member, tasks)) {
            achievementStorage.unlockAchievement(achievement.id, member.id);
            setUnlocked(achievementStorage.getUnlocked());
            // Trigger confetti for new achievement
            if (typeof window !== 'undefined') {
              const event = new CustomEvent('achievement-unlocked', {
                detail: { achievement, member },
              });
              window.dispatchEvent(event);
            }
          }
        }
      });
    });
  }, [members, tasks]);

  const selectedMember = selectedMemberId 
    ? members.find(m => m.id === selectedMemberId)
    : null;

  const memberAchievements = useMemo(() => {
    if (!selectedMember) return [];
    const memberUnlocked = achievementStorage.getMemberAchievements(selectedMember.id);
    return ACHIEVEMENTS.map(achievement => ({
      achievement,
      unlocked: memberUnlocked.includes(achievement.id),
      unlockedAt: unlocked.find(
        u => u.achievementId === achievement.id && u.memberId === selectedMember.id
      )?.unlockedAt,
    }));
  }, [selectedMember, unlocked]);

  const achievementsByCategory = useMemo(() => {
    const categories: Record<string, typeof memberAchievements> = {
      tasks: [],
      xp: [],
      streak: [],
      special: [],
    };
    memberAchievements.forEach(ma => {
      categories[ma.achievement.category].push(ma);
    });
    return categories;
  }, [memberAchievements]);

  const totalUnlocked = memberAchievements.filter(ma => ma.unlocked).length;
  const totalAchievements = ACHIEVEMENTS.length;
  const progress = (totalUnlocked / totalAchievements) * 100;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Achievements & Badges
        </h1>
        <p className="text-gray-600">Unlock achievements by completing tasks and leveling up</p>
      </div>

      {/* Member Selector */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Member</label>
        <select
          value={selectedMemberId || ''}
          onChange={(e) => setSelectedMemberId(e.target.value || null)}
          className="w-full max-w-md px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors"
        >
          <option value="">-- Select a member --</option>
          {members.map(member => (
            <option key={member.id} value={member.id}>
              {member.name} (Level {member.level})
            </option>
          ))}
        </select>
      </div>

      {selectedMember ? (
        <>
          {/* Progress Overview */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Award className="w-6 h-6 text-purple-600" />
                {selectedMember.name}'s Achievements
              </h2>
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-600">
                  {totalUnlocked} / {totalAchievements}
                </div>
                <div className="text-sm text-gray-600">Unlocked</div>
              </div>
            </div>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1 }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              />
            </div>
            <div className="text-sm text-gray-600 mt-2">
              {progress.toFixed(1)}% Complete
            </div>
          </div>

          {/* Achievements by Category */}
          {Object.entries(achievementsByCategory).map(([category, achievements]) => {
            if (achievements.length === 0) return null;
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-6"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-4 capitalize">
                  {category} Achievements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map(({ achievement, unlocked, unlockedAt }, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`
                        p-4 rounded-xl border-2 transition-all
                        ${unlocked
                          ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300 shadow-md'
                          : 'bg-gray-50 border-gray-200 opacity-60'
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`
                          text-4xl p-2 rounded-lg
                          ${unlocked ? '' : 'grayscale opacity-50'}
                        `}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`
                              font-bold
                              ${unlocked ? 'text-gray-800' : 'text-gray-500'}
                            `}>
                              {achievement.name}
                            </h4>
                            {unlocked && (
                              <Sparkles className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {achievement.description}
                          </p>
                          {unlocked && unlockedAt && (
                            <p className="text-xs text-purple-600 font-semibold">
                              Unlocked: {format(new Date(unlockedAt), 'dd/MM/yyyy')}
                            </p>
                          )}
                          {!unlocked && (
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Lock className="w-3 h-3" />
                              Locked
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </>
      ) : (
        <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-200 text-center">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a Member</h3>
          <p className="text-gray-500">Choose a member to view their achievements</p>
        </div>
      )}
    </div>
  );
}

