'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, AlertCircle } from 'lucide-react';
import { membersAPI } from '@/lib/api/members';
import { useAuth } from '@/context/AuthContext';
import type { Member } from '@/types';

interface MemberSelectionModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

/**
 * Mandatory Member Selection Modal
 * This modal appears when a user is logged in but doesn't have a member profile.
 * It cannot be closed until the user selects or creates a member.
 */
export function MemberSelectionModal({ isOpen, onComplete }: MemberSelectionModalProps) {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [newMemberName, setNewMemberName] = useState('');
  const [createNewMember, setCreateNewMember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load members when modal opens
  useEffect(() => {
    if (isOpen) {
      loadMembers();
    }
  }, [isOpen]);

  const loadMembers = async () => {
    try {
      const allMembers = await membersAPI.getMembers();
      setMembers(allMembers);
    } catch (err) {
      console.error('Error loading members:', err);
      setError('Failed to load members. Please refresh the page.');
    }
  };

  const handleMemberSelection = async () => {
    if (!user) {
      setError('User not found. Please try logging in again.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (createNewMember) {
        if (!newMemberName.trim()) {
          setError('Please enter a member name');
          setLoading(false);
          return;
        }
        
        // Create new member profile
        const memberId = await membersAPI.createMember(
          {
            name: newMemberName.trim(),
            email: user.email,
          },
          user.id
        );
        setSelectedMemberId(memberId);
      }

      if (!selectedMemberId) {
        setError('Please select or create a member');
        setLoading(false);
        return;
      }

      // Member is now linked to user
      // Reload the page to refresh auth context
      window.location.reload();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 sm:mx-6 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6" />
              <h2 className="text-xl sm:text-2xl font-bold">
                Member Profile Required
              </h2>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                You need to select or create a member profile to continue. This links your account to a member profile for task management.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Existing Members */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  Select Existing Member
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {members.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No existing members found.
                    </p>
                  ) : (
                    members.map((member) => (
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
                    ))
                  )}
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
                      autoFocus
                    />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleMemberSelection}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Please wait...' : 'Continue'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

