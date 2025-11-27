import { Task } from '@/types';
import { parseISO, isBefore, addMinutes, differenceInMinutes, isValid } from 'date-fns';

export interface NotificationSettings {
  enabled: boolean;
  dueDateReminder: boolean;
  reminderMinutes: number[]; // e.g., [60, 15] = 1 hour and 15 minutes before
  dailyDigest: boolean;
  digestTime: string; // HH:mm format
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  dueDateReminder: true,
  reminderMinutes: [1440, 60, 15], // 1 day, 1 hour, 15 minutes
  dailyDigest: false,
  digestTime: '09:00',
};

const NOTIFICATION_SETTINGS_KEY = 'task-manager-notification-settings';

export const notificationStorage = {
  getSettings: (): NotificationSettings => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const data = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error loading notification settings:', error);
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings: (settings: NotificationSettings): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  },
};

export function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return Promise.resolve(false);
  }

  if (Notification.permission === 'granted') {
    return Promise.resolve(true);
  }

  if (Notification.permission !== 'denied') {
    return Notification.requestPermission().then(permission => {
      return permission === 'granted';
    });
  }

  return Promise.resolve(false);
}

export function showNotification(title: string, options?: NotificationOptions) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '🎯',
      badge: '🎯',
      ...options,
    });
  }
}

export function checkTaskReminders(tasks: Task[]): void {
  if (typeof window === 'undefined') return;

  const settings = notificationStorage.getSettings();
  if (!settings.enabled || !settings.dueDateReminder) return;

  const now = new Date();
  const activeTasks = tasks.filter(t => !t.completed && t.dueDate);

  activeTasks.forEach(task => {
    if (!task.dueDate) return;

    let dueDate: Date;
    try {
      dueDate = parseISO(task.dueDate);
      if (!isValid(dueDate)) return; // Invalid date
    } catch {
      return; // Invalid date format
    }
    const dueDateTime = new Date(dueDate);
    dueDateTime.setHours(9, 0, 0, 0); // Set to 9 AM

    settings.reminderMinutes.forEach(minutes => {
      const reminderTime = addMinutes(dueDateTime, -minutes);
      const timeDiff = differenceInMinutes(reminderTime, now);

      // Check if we're within 1 minute of the reminder time
      if (timeDiff >= 0 && timeDiff < 1) {
        const timeText = minutes >= 60 
          ? `${Math.floor(minutes / 60)} hour${Math.floor(minutes / 60) > 1 ? 's' : ''}`
          : `${minutes} minute${minutes > 1 ? 's' : ''}`;
        
        showNotification(`Task Reminder: ${task.title}`, {
          body: `Due in ${timeText}`,
          tag: `task-reminder-${task.id}-${minutes}`,
        });
      }
    });

    // Check if task is overdue
    if (isBefore(dueDateTime, now)) {
      showNotification(`Overdue Task: ${task.title}`, {
        body: 'This task is past its due date',
        tag: `task-overdue-${task.id}`,
      });
    }
  });
}

export function setupNotificationCheck(tasks: Task[]): (() => void) | undefined {
  if (typeof window === 'undefined') return undefined;
  
  // Check immediately
  checkTaskReminders(tasks);

  // Check every minute
  const interval = setInterval(() => {
    checkTaskReminders(tasks);
  }, 60000); // 1 minute

  return () => {
    if (interval) {
      clearInterval(interval);
    }
  };
}

