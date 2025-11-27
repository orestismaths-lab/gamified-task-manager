'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { authAPI } from '@/lib/api/auth';
import { membersAPI } from '@/lib/api/members';
import { Member } from '@/types';

interface AuthContextType {
  user: User | null;
  member: Member | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to auth state changes
  useEffect(() => {
    let isMounted = true;
    
    const unsubscribe = authAPI.onAuthStateChanged(async (firebaseUser) => {
      if (!isMounted) return;
      
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Load or create member profile
        try {
          let userMember = await membersAPI.getMemberByUserId(firebaseUser.uid);
          
          if (!userMember) {
            // Create member profile if doesn't exist
            const memberId = await membersAPI.createMember({
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email || undefined,
            }, firebaseUser.uid);
            
            userMember = await membersAPI.getMember(memberId);
          }
          
          if (isMounted) {
            setMember(userMember);
          }
        } catch (error) {
          console.error('Error loading member:', error);
          if (isMounted) {
            setMember(null);
          }
        }
      } else {
        setMember(null);
      }
      
      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    await authAPI.signIn(email, password);
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    await authAPI.register(email, password, displayName);
  };

  const signInWithGoogle = async () => {
    await authAPI.signInWithGoogle();
  };

  const signOut = async () => {
    await authAPI.signOut();
    setMember(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        member,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

