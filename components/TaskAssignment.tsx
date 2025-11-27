'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, X, Users } from 'lucide-react';
import { Member } from '@/types';

interface TaskAssignmentProps {
  members: Member[];
  assignedTo: string[];
  onChange: (memberIds: string[]) => void;
  className?: string;
}

export function TaskAssignment({ members, assignedTo, onChange, className = '' }: TaskAssignmentProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMember = (memberId: string) => {
    if (assignedTo.includes(memberId)) {
      onChange(assignedTo.filter(id => id !== memberId));
    } else {
      onChange([...assignedTo, memberId]);
    }
  };

  const assignedMembers = members.filter(m => assignedTo.includes(m.id));
  const unassignedMembers = members.filter(m => !assignedTo.includes(m.id));

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        <Users className="w-4 h-4 inline mr-2" />
        Assign To
      </label>

      {/* Selected Members Display */}
      <div className="flex flex-wrap gap-2 mb-2">
        {assignedMembers.map(member => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm"
          >
            <span>{member.name}</span>
            <button
              onClick={() => toggleMember(member.id)}
              className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-400 dark:focus:border-purple-500 focus:outline-none transition-colors flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            {assignedTo.length === 0 ? 'Assign to members...' : `${assignedTo.length} member(s) assigned`}
          </span>
          <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
        </button>

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-60 overflow-y-auto"
          >
            {unassignedMembers.length === 0 && assignedMembers.length > 0 ? (
              <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                All members assigned
              </div>
            ) : (
              unassignedMembers.map(member => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => {
                    toggleMember(member.id);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center gap-2"
                >
                  <div className={`w-4 h-4 rounded border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center ${assignedTo.includes(member.id) ? 'bg-purple-500 border-purple-500' : ''}`}>
                    {assignedTo.includes(member.id) && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">{member.name}</span>
                  {member.avatar && (
                    <span className="ml-auto text-lg">{member.avatar}</span>
                  )}
                </button>
              ))
            )}
          </motion.div>
        )}
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false);
            }
          }}
          role="button"
          tabIndex={-1}
          aria-label="Close dropdown"
        />
      )}
    </div>
  );
}

