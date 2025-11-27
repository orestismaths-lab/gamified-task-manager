'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Clock, CheckCircle } from 'lucide-react';
import { notificationStorage, NotificationSettings, requestNotificationPermission } from '@/lib/notifications';

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>(notificationStorage.getSettings());
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  useEffect(() => {
    notificationStorage.saveSettings(settings);
  }, [settings]);

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setPermissionStatus('granted');
    } else {
      setPermissionStatus('denied');
    }
  };

  const handleReminderMinutesChange = (index: number, value: string) => {
    const minutes = parseInt(value) || 0;
    if (minutes < 0) return;

    const newReminders = [...settings.reminderMinutes];
    newReminders[index] = minutes;
    setSettings({ ...settings, reminderMinutes: newReminders });
  };

  const addReminder = () => {
    setSettings({
      ...settings,
      reminderMinutes: [...settings.reminderMinutes, 60],
    });
  };

  const removeReminder = (index: number) => {
    setSettings({
      ...settings,
      reminderMinutes: settings.reminderMinutes.filter((_, i) => i !== index),
    });
  };

  const formatMinutes = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Notifications & Reminders
        </h1>
        <p className="text-gray-600">Configure task reminders and notifications</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-800">Browser Notifications</h2>
          </div>
          <div className="flex items-center gap-2">
            {permissionStatus === 'granted' && (
              <span className="text-sm text-green-600 font-semibold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Enabled
              </span>
            )}
            {permissionStatus !== 'granted' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRequestPermission}
                className="px-4 py-2 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-colors"
              >
                Enable Notifications
              </motion.button>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600">
          {permissionStatus === 'granted'
            ? 'Browser notifications are enabled. You will receive reminders for tasks.'
            : permissionStatus === 'denied'
            ? 'Notifications are blocked. Please enable them in your browser settings.'
            : 'Click the button above to enable browser notifications for task reminders.'}
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-800">Notification Settings</h2>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Enable Notifications</h3>
              <p className="text-sm text-gray-600">Turn notifications on or off</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Due Date Reminders</h3>
                <p className="text-sm text-gray-600">Get notified before tasks are due</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.dueDateReminder}
                  onChange={(e) => setSettings({ ...settings, dueDateReminder: e.target.checked })}
                  className="sr-only peer"
                  disabled={!settings.enabled}
                />
                <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 ${!settings.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
              </label>
            </div>

            {settings.dueDateReminder && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remind me before due date:
                </label>
                {settings.reminderMinutes.map((minutes, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="number"
                      value={minutes}
                      onChange={(e) => handleReminderMinutesChange(index, e.target.value)}
                      min="0"
                      className="w-24 px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-400 focus:outline-none"
                      disabled={!settings.enabled}
                    />
                    <span className="text-sm text-gray-600 w-32">
                      {formatMinutes(minutes)} before
                    </span>
                    {settings.reminderMinutes.length > 1 && (
                      <button
                        onClick={() => removeReminder(index)}
                        className="px-3 py-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={!settings.enabled}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addReminder}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  disabled={!settings.enabled}
                >
                  + Add Reminder Time
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

