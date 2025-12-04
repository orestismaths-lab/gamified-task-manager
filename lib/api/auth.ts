// New Backend Authentication API (no Firebase)

export interface User {
  id: string;
  email: string;
  name?: string | null;
}

export const authAPI = {
  // Sign in with email/password
  signIn: async (email: string, password: string): Promise<User> => {
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address');
    }
    if (!password || password.length === 0) {
      throw new Error('Please enter your password');
    }

    const res = await fetch(`/api/auth/login`, {
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
  },

  // Register with email/password
  register: async (email: string, password: string, displayName: string): Promise<User> => {
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    if (!displayName || displayName.trim().length === 0) {
      throw new Error('Please enter a display name');
    }

    const res = await fetch(`/api/auth/register`, {
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
  },

  // Sign out
  signOut: async (): Promise<void> => {
    await fetch(`/api/auth/logout`, { method: 'POST' });
  },

  // Get current user
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const res = await fetch(`/api/auth/me`);
      if (!res.ok) return null;
      const data = (await res.json()) as { user: User | null };
      return data.user;
    } catch {
      return null;
    }
  },

  // Listen to auth state changes (simplified - just poll)
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    // Simple polling implementation
    const checkAuth = async () => {
      const user = await authAPI.getCurrentUser();
      callback(user);
    };

    checkAuth();
    const interval = setInterval(checkAuth, 5000); // Check every 5 seconds

    // Return unsubscribe function
    return () => clearInterval(interval);
  },
};
