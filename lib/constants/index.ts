/**
 * Application-wide constants
 */

export const APP_NAME = 'Task Manager';

export const SESSION_CONFIG = {
  COOKIE_NAME: 'task_manager_session',
  DURATION_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
  DURATION_SECONDS: 7 * 24 * 60 * 60, // 7 days in seconds
} as const;

export const PASSWORD_CONFIG = {
  MIN_LENGTH: 6,
  MAX_LENGTH: 128,
  BCRYPT_ROUNDS: 10,
} as const;

export const VALIDATION_CONFIG = {
  EMAIL_MAX_LENGTH: 255,
  NAME_MAX_LENGTH: 100,
  NAME_MIN_LENGTH: 1,
} as const;

export const API_CONFIG = {
  AUTH_POLL_INTERVAL_MS: 5000, // 5 seconds
  MAX_REQUEST_SIZE: 1024 * 1024, // 1MB
} as const;

export const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  ME: '/api/auth/me',
  ADMIN_USERS: '/api/admin/users',
  MEMBERS: '/api/members',
  MEMBER_BY_ID: (id: string) => `/api/members/${id}`,
  MEMBER_XP: (id: string) => `/api/members/${id}/xp`,
  TASKS: '/api/tasks',
  TASK_BY_ID: (id: string) => `/api/tasks/${id}`,
  MIGRATE: '/api/migrate',
} as const;

/**
 * Feature flag: Enable/disable backend API usage
 * 
 * When false:
 * - All data is stored in browser localStorage only
 * - No API calls are made (auth, tasks, members)
 * - Works offline and doesn't require a backend database
 * 
 * When true:
 * - Uses backend API for authentication and data storage
 * - Requires a working backend with database
 * 
 * To switch back to API mode, change this to `true`
 */
export const USE_API = true;

