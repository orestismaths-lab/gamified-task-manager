'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, UserPlus, Save, X } from 'lucide-react';
import { useTaskManager } from '@/context/TaskManagerContext';
import { useGamification } from '@/hooks/useGamification';

export function MemberManagement() {
  const { members, selectedMemberId, setSelectedMember, addMember, updateMember, deleteMember } = useTaskManager();
  const { getMemberProgress } = useGamification();
  const [newMemberName, setNewMemberName] = useState('');
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Handle add member event
  useEffect(() => {
    const handleAddMemberEvent = (e: CustomEvent) => {
      const name = e.detail.name;
      if (name && name.trim()) {
        addMember({ name: name.trim() });
      }
    };

    window.addEventListener('add-member' as any, handleAddMemberEvent);

    return () => {
      window.removeEventListener('add-member' as any, handleAddMemberEvent);
    };
  }, [addMember]);

  const handleAddMember = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (newMemberName.trim()) {
      addMember({ name: newMemberName.trim() });
      setNewMemberName('');
    }
  };

  const handleStartEdit = (memberId: string, currentName: string) => {
    setEditingMemberId(memberId);
    setEditName(currentName);
  };

  const handleCancelEdit = () => {
    setEditingMemberId(null);
    setEditName('');
  };

  const handleSaveEdit = (memberId: string) => {
    if (editName.trim()) {
      updateMember(memberId, { name: editName.trim() });
      setEditingMemberId(null);
      setEditName('');
    }
  };

  const handleDeleteMember = (memberId: string) => {
    if (members.length <= 1) {
      alert('Cannot delete the last member!');
      return;
    }
    if (confirm('Are you sure you want to delete this member? All their tasks will also be deleted.')) {
      deleteMember(memberId);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Member Management
        </h1>
        <p className="text-gray-600 mt-1">Manage your team members and track their progress</p>
      </div>

      {/* Add Member Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 mb-8 relative z-10"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Member</h2>
        <div className="flex gap-3 relative z-10">
          <input
            type="text"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
            placeholder="Enter member name"
            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddMember}
            disabled={!newMemberName.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 relative z-10"
            type="button"
          >
            <UserPlus className="w-5 h-5" />
            Add Member
          </motion.button>
        </div>
      </motion.div>

      {/* Members List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">All Members ({members.length})</h2>

        {members.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white rounded-2xl shadow-md border border-gray-200"
          >
            <p className="text-gray-500 text-lg">No members yet. Add your first member above! 👥</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {members.map((member, index) => {
                const progress = getMemberProgress(member);
                const isSelected = member.id === selectedMemberId;
                const isEditing = editingMemberId === member.id;

                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                      bg-white rounded-2xl p-6 border-2 shadow-md transition-all
                      ${isSelected
                        ? 'border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50'
                        : 'border-gray-200 hover:shadow-lg'
                      }
                    `}
                  >
                    {isEditing ? (
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-400 focus:outline-none"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSaveEdit(member.id)}
                            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            Save
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCancelEdit}
                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </motion.button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-xl shadow-md">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-gray-800">{member.name}</h3>
                              <p className="text-sm text-gray-500">Level {member.level}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleStartEdit(member.id, member.name)}
                              className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteMember(member.id)}
                              disabled={members.length <= 1}
                              className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>{member.xp} XP</span>
                            <span>{progress.xpForNextLevel} XP for next level</span>
                          </div>
                          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress.progress}%` }}
                              transition={{ duration: 0.5, ease: 'easeOut' }}
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                            />
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedMember(isSelected ? null : member.id)}
                          className={`
                            w-full py-2 rounded-lg font-semibold transition-colors
                            ${isSelected
                              ? 'bg-purple-500 text-white hover:bg-purple-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }
                          `}
                        >
                          {isSelected ? 'Selected' : 'Select Member'}
                        </motion.button>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

