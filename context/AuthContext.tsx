'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, User } from '@/lib/api/auth';
import { membersAPI } from '@/lib/api/members';
import { Member } from '@/types';

interface AuthContextType {
  user: User | null;
  member: Member | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
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
    
    const unsubscribe = authAPI.onAuthStateChanged(async (apiUser) => {
      if (!isMounted) return;
      
      setUser(apiUser);
      
      if (apiUser) {
        // Load member profile (don't create automatically - user must select during sign up)
        try {
          const userMember = await membersAPI.getMemberByUserId(apiUser.id);
          
          if (isMounted) {
            setMember(userMember || null);
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

