// Firebase Authentication API

import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  Auth
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

const googleProvider = new GoogleAuthProvider();

export const authAPI = {
  // Sign in with email/password
  signIn: async (email: string, password: string): Promise<User> => {
    // Validate inputs
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address');
    }
    if (!password || password.length === 0) {
      throw new Error('Please enter your password');
    }
    
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    return userCredential.user;
  },

  // Register with email/password
  register: async (email: string, password: string, displayName: string): Promise<User> => {
    // Validate inputs
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    if (!displayName || displayName.trim().length === 0) {
      throw new Error('Please enter a display name');
    }
    
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    // Note: displayName is stored in Firestore member document, not Firebase Auth profile
    return userCredential.user;
  },

  // Sign in with Google
  signInWithGoogle: async (): Promise<User> => {
    const userCredential = await signInWithPopup(auth, googleProvider);
    return userCredential.user;
  },

  // Sign out
  signOut: async (): Promise<void> => {
    await signOut(auth);
  },

  // Get current user
  getCurrentUser: (): User | null => {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },
};

