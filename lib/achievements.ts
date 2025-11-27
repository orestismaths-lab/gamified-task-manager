import { Member, Task } from '@/types';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji or icon name
  category: 'tasks' | 'xp' | 'streak' | 'special';
  condition: (member: Member, tasks: Task[]) => boolean;
  unlockedAt?: string;
  unlockedBy?: string; // member id
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-task',
    name: 'First Steps',
    description: 'Complete your first task',
    icon: '🎯',
    category: 'tasks',
    condition: (member, tasks) => {
      return tasks.filter(t => t.ownerId === member.id && t.completed).length >= 1;
    },
  },
  {
    id: 'ten-tasks',
    name: 'Getting Started',
    description: 'Complete 10 tasks',
    icon: '⭐',
    category: 'tasks',
    condition: (member, tasks) => {
      return tasks.filter(t => t.ownerId === member.id && t.completed).length >= 10;
    },
  },
  {
    id: 'fifty-tasks',
    name: 'Task Master',
    description: 'Complete 50 tasks',
    icon: '🏆',
    category: 'tasks',
    condition: (member, tasks) => {
      return tasks.filter(t => t.ownerId === member.id && t.completed).length >= 50;
    },
  },
  {
    id: 'hundred-tasks',
    name: 'Centurion',
    description: 'Complete 100 tasks',
    icon: '👑',
    category: 'tasks',
    condition: (member, tasks) => {
      return tasks.filter(t => t.ownerId === member.id && t.completed).length >= 100;
    },
  },
  {
    id: 'level-5',
    name: 'Rising Star',
    description: 'Reach level 5',
    icon: '⭐',
    category: 'xp',
    condition: (member) => {
      return member.level >= 5;
    },
  },
  {
    id: 'level-10',
    name: 'Expert',
    description: 'Reach level 10',
    icon: '🌟',
    category: 'xp',
    condition: (member) => {
      return member.level >= 10;
    },
  },
  {
    id: 'level-20',
    name: 'Master',
    description: 'Reach level 20',
    icon: '💎',
    category: 'xp',
    condition: (member) => {
      return member.level >= 20;
    },
  },
  {
    id: 'level-50',
    name: 'Legend',
    description: 'Reach level 50',
    icon: '🏅',
    category: 'xp',
    condition: (member) => {
      return member.level >= 50;
    },
  },
  {
    id: 'thousand-xp',
    name: 'XP Collector',
    description: 'Earn 1000 XP',
    icon: '💯',
    category: 'xp',
    condition: (member) => {
      return member.xp >= 1000;
    },
  },
  {
    id: 'five-thousand-xp',
    name: 'XP Master',
    description: 'Earn 5000 XP',
    icon: '🔥',
    category: 'xp',
    condition: (member) => {
      return member.xp >= 5000;
    },
  },
  {
    id: 'high-priority',
    name: 'High Priority Hero',
    description: 'Complete 10 high priority tasks',
    icon: '⚡',
    category: 'tasks',
    condition: (member, tasks) => {
      return tasks.filter(t => t.ownerId === member.id && t.completed && t.priority === 'high').length >= 10;
    },
  },
  {
    id: 'subtask-master',
    name: 'Detail Oriented',
    description: 'Complete 50 subtasks',
    icon: '📋',
    category: 'tasks',
    condition: (member, tasks) => {
      const memberTasks = tasks.filter(t => t.ownerId === member.id);
      const completedSubtasks = memberTasks.reduce((count, task) => {
        return count + task.subtasks.filter(st => st.completed).length;
      }, 0);
      return completedSubtasks >= 50;
    },
  },
  {
    id: 'tag-master',
    name: 'Organized',
    description: 'Use tags in 20 tasks',
    icon: '🏷️',
    category: 'tasks',
    condition: (member, tasks) => {
      return tasks.filter(t => t.ownerId === member.id && t.tags.length > 0).length >= 20;
    },
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Complete 5 tasks before their due date',
    icon: '🌅',
    category: 'special',
    condition: (member, tasks) => {
      const now = new Date();
      return tasks.filter(t => {
        if (t.ownerId !== member.id || !t.completed || !t.dueDate) return false;
        const completedDate = new Date(t.updatedAt);
        const dueDate = new Date(t.dueDate);
        return completedDate < dueDate;
      }).length >= 5;
    },
  },
];

const ACHIEVEMENT_STORAGE_KEY = 'gamified-task-manager-achievements';

export interface UnlockedAchievement {
  achievementId: string;
  memberId: string;
  unlockedAt: string;
}

export const achievementStorage = {
  getUnlocked: (): UnlockedAchievement[] => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(ACHIEVEMENT_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading achievements from localStorage:', error);
      return [];
    }
  },

  saveUnlocked: (unlocked: UnlockedAchievement[]): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(ACHIEVEMENT_STORAGE_KEY, JSON.stringify(unlocked));
    } catch (error) {
      console.error('Error saving achievements to localStorage:', error);
    }
  },

  unlockAchievement: (achievementId: string, memberId: string): void => {
    const unlocked = achievementStorage.getUnlocked();
    const exists = unlocked.some(u => u.achievementId === achievementId && u.memberId === memberId);
    if (!exists) {
      unlocked.push({
        achievementId,
        memberId,
        unlockedAt: new Date().toISOString(),
      });
      achievementStorage.saveUnlocked(unlocked);
    }
  },

  getMemberAchievements: (memberId: string): string[] => {
    const unlocked = achievementStorage.getUnlocked();
    return unlocked
      .filter(u => u.memberId === memberId)
      .map(u => u.achievementId);
  },
};

