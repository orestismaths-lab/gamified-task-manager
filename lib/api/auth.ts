/**
 * Authentication API Client
 * Provides methods for user authentication and session management
 */

import { API_CONFIG, PASSWORD_CONFIG } from '../constants';
import type { UserPublic } from '../types/auth';

export interface User {
  id: string;
  email: string;
  name?: string | null;
}

/**
 * Authentication API methods
 */
export const authAPI = {
  /**
   * Sign in with email and password
   * @throws {Error} If authentication fails
   */
  signIn: async (email: string, password: string): Promise<User> => {
    // Validate input
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address');
    }
    if (!password || password.length === 0) {
      throw new Error('Please enter your password');
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!res.ok) {
        let errorMessage = 'Login failed';
        try {
          const data = (await res.json()) as { error?: string; details?: string };
          errorMessage = data.error || data.details || 'Login failed';
          // Log full error for debugging
          console.error('Login error response:', {
            status: res.status,
            error: data.error,
            details: data.details,
            fullData: data,
          });
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = res.statusText || 'Login failed';
          console.error('Login error - failed to parse JSON:', e);
        }
        throw new Error(errorMessage);
      }

      const data = (await res.json()) as { user: User };
      return data.user;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred during login');
    }
  },

  /**
   * Register a new user account
   * @throws {Error} If registration fails
   */
  register: async (email: string, password: string, displayName: string): Promise<User> => {
    // Validate input
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address');
    }
    if (!password || password.length < PASSWORD_CONFIG.MIN_LENGTH) {
      throw new Error(`Password must be at least ${PASSWORD_CONFIG.MIN_LENGTH} characters`);
    }
    if (!displayName || displayName.trim().length === 0) {
      throw new Error('Please enter a display name');
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          name: displayName.trim(),
        }),
      });

      if (!res.ok) {
        let errorMessage = 'Registration failed';
        try {
          const data = (await res.json()) as { error?: string; details?: string };
          errorMessage = data.error || data.details || 'Registration failed';
        } catch (e) {
          errorMessage = res.statusText || 'Registration failed';
        }
        throw new Error(errorMessage);
      }

      const data = (await res.json()) as { user: User };
      return data.user;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred during registration');
    }
  },

  /**
   * Sign out the current user
   */
  signOut: async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Sign out error:', error);
      // Don't throw - sign out should always succeed from user perspective
    }
  },

  /**
   * Get the current authenticated user
   * @returns The current user or null if not authenticated
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) return null;
      const data = (await res.json()) as { user: User | null };
      return data.user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  /**
   * Listen to authentication state changes
   * @param callback Function to call when auth state changes
   * @returns Unsubscribe function
   */
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    // Simple polling implementation
    const checkAuth = async () => {
      try {
        const user = await authAPI.getCurrentUser();
        callback(user);
      } catch (error) {
        console.error('Auth state check error:', error);
        callback(null);
      }
    };

    // Check immediately
    checkAuth();

    // Then poll periodically
    const interval = setInterval(checkAuth, API_CONFIG.AUTH_POLL_INTERVAL_MS);

    // Return unsubscribe function
    return () => clearInterval(interval);
  },
};
