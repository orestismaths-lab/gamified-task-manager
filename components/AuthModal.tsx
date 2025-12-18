'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, LogIn, Users, Plus } from 'lucide-react';
import { authAPI } from '@/lib/api/auth';
import { membersAPI } from '@/lib/api/members';
import type { Member } from '@/types';
import { USE_API } from '@/lib/constants';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type AuthStep = 'login' | 'register' | 'selectMember';

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [step, setStep] = useState<AuthStep>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Member selection state
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [newMemberName, setNewMemberName] = useState('');
  const [createNewMember, setCreateNewMember] = useState(false);
  const [memberLoading, setMemberLoading] = useState(false);

  // Load members when entering member selection step
  useEffect(() => {
    if (step === 'selectMember') {
      loadMembers();
    }
  }, [step]);

  const loadMembers = async () => {
    if (!USE_API) {
      // In localStorage mode, don't load members from API
      setMembers([]);
      return;
    }
    try {
      const allMembers = await membersAPI.getMembers();
      setMembers(allMembers);
    } catch (err) {
      console.error('Error loading members:', err);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // If API is disabled, close modal and show message
    if (!USE_API) {
      setError('Authentication is disabled. The app is running in localStorage-only mode. You can use it without logging in.');
      setTimeout(() => {
        onClose();
        onSuccess(); // Allow app to continue
      }, 2000);
      return;
    }
    
    setLoading(true);

    try {
      if (step === 'login') {
        await authAPI.signIn(email, password);
        onSuccess();
        onClose();
      } else {
        // Register user
        await authAPI.register(email, password, displayName);
        // Move to member selection step
        setStep('selectMember');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMemberSelection = async () => {
    setError('');
    
    // If API is disabled, close modal
    if (!USE_API) {
      onSuccess();
      onClose();
      return;
    }
    
    setMemberLoading(true);

    try {
      if (createNewMember) {
        if (!newMemberName.trim()) {
          setError('Please enter a member name');
          setMemberLoading(false);
          return;
        }
        // Get current user to create member with userId
        const currentUser = await authAPI.getCurrentUser();
        if (!currentUser) {
          setError('User not found. Please try logging in again.');
          setMemberLoading(false);
          return;
        }
        // Create new member
        const memberId = await membersAPI.createMember(
          {
            name: newMemberName.trim(),
            email: currentUser.email,
          },
          currentUser.id
        );
        setSelectedMemberId(memberId);
      }

      if (!selectedMemberId) {
        setError('Please select or create a member');
        setMemberLoading(false);
        return;
      }

      // Member is now linked to user (via userId in member)
      onSuccess();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setMemberLoading(false);
    }
  };

  // Auto-close if API is disabled
  useEffect(() => {
    if (isOpen && !USE_API) {
      // Close modal after a brief moment to show message
      const timer = setTimeout(() => {
        onClose();
        onSuccess();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, onSuccess]);

  if (!isOpen) return null;

  // If API is disabled, show a simple message
  if (!USE_API) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 sm:mx-6 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold">Local Mode</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Authentication is disabled. The app is running in localStorage-only mode.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                You can use the app without logging in. All data will be stored in your browser.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onSuccess();
                }}
                className="mt-4 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Continue
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 sm:mx-6 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold">
                {step === 'login' && 'Welcome Back!'}
                {step === 'register' && 'Create Account'}
                {step === 'selectMember' && 'Select Your Member Profile'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {step === 'selectMember' ? (
            <div className="p-4 sm:p-6 space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Select an existing member profile or create a new one to link with your account.
                </p>

                {/* Existing Members */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Users className="w-4 h-4 inline mr-2" />
                    Select Existing Member
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {members.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => {
                          setSelectedMemberId(member.id);
                          setCreateNewMember(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors ${
                          selectedMemberId === member.id && !createNewMember
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                        }`}
                      >
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {member.name}
                        </div>
                        {member.email && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {member.email}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">OR</span>
                  </div>
                </div>

                {/* Create New Member */}
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setCreateNewMember(true);
                      setSelectedMemberId('');
                    }}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-colors flex items-center gap-2 ${
                      createNewMember
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                    }`}
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-semibold">Create New Member</span>
                  </button>

                  {createNewMember && (
                    <div className="mt-3">
                      <input
                        type="text"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        placeholder="Enter member name"
                        className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-400 dark:focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleMemberSelection}
                  disabled={memberLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {memberLoading ? 'Please wait...' : 'Continue'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleAuthSubmit} className="p-4 sm:p-6 space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {step === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-400 dark:focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-400 dark:focus:border-purple-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-400 dark:focus:border-purple-500 focus:outline-none"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              {loading ? 'Please wait...' : (step === 'login' ? 'Sign In' : 'Sign Up')}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">OR</span>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
              {step === 'login' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setStep('register')}
                    className="text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setStep('login')}
                    className="text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

