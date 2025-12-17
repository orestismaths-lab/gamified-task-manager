'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, User } from '@/lib/api/auth';
import { membersAPI } from '@/lib/api/members';
import { Member } from '@/types';
import { USE_API } from '@/lib/constants';

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

  // Listen to auth state changes (only if API is enabled)
  useEffect(() => {
    let isMounted = true;
    
    // If API is disabled, skip all auth checks and set loading to false
    if (!USE_API) {
      setUser(null);
      setMember(null);
      setLoading(false);
      return;
    }
    
    const unsubscribe = authAPI.onAuthStateChanged(async (apiUser) => {
      if (!isMounted) return;
      
      setUser(apiUser);
      
      if (apiUser) {
        // Load member profile (automatically created during sign-up)
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
    if (!USE_API) {
      throw new Error('Authentication is disabled. Please enable USE_API in lib/constants/index.ts to use authentication.');
    }
    await authAPI.signIn(email, password);
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    if (!USE_API) {
      throw new Error('Authentication is disabled. Please enable USE_API in lib/constants/index.ts to use authentication.');
    }
    await authAPI.register(email, password, displayName);
  };

  const signOut = async () => {
    if (!USE_API) {
      setUser(null);
      setMember(null);
      return;
    }
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

