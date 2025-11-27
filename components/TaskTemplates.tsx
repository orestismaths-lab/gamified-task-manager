'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTaskManager } from '@/context/TaskManagerContext';
import { templateStorage, TaskTemplate } from '@/lib/templates';
import { Plus, Trash2, Copy, FileText, Edit2, X, Save, Tag as TagIcon, Folder } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Priority, RecurrenceType, TaskStatus } from '@/types';

type CreateMode = 'from-task' | 'manual' | null;

export function TaskTemplates() {
  const { addTask, members, selectedMemberId, tasks } = useTaskManager();
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [createMode, setCreateMode] = useState<CreateMode>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TaskTemplate>>({});

  // Create from task state
  const [templateName, setTemplateName] = useState('');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [templateCategory, setTemplateCategory] = useState('');
  const [templateTags, setTemplateTags] = useState('');

  // Manual create state
  const [manualForm, setManualForm] = useState({
    name: '',
    title: '',
    description: '',
    priority: 'medium' as Priority,
    status: 'todo' as TaskStatus,
    tags: '',
    category: '',
    templateTags: '',
    ownerId: selectedMemberId || '',
    subtasks: [] as { title: string }[],
    recurrenceType: 'none' as RecurrenceType,
    recurrenceInterval: 1,
    recurrenceEndDate: '',
  });

  useEffect(() => {
    setTemplates(templateStorage.getTemplates());
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    templates.forEach(t => {
      if (t.category) cats.add(t.category);
    });
    return Array.from(cats).sort();
  }, [templates]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      if (selectedCategory !== 'all' && template.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = template.name.toLowerCase().includes(query);
        const matchesTaskTitle = template.task.title.toLowerCase().includes(query);
        const matchesTags = template.tags.some(t => t.toLowerCase().includes(query));
        if (!matchesName && !matchesTaskTitle && !matchesTags) return false;
      }
      return true;
    });
  }, [templates, selectedCategory, searchQuery]);

  const handleCreateFromTask = () => {
    if (!selectedTask || !templateName.trim()) return;

    const task = tasks.find(t => t.id === selectedTask);
    if (!task) return;

    const tagArray = templateTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const newTemplate = templateStorage.addTemplate({
      name: templateName.trim(),
      task: {
        title: task.title,
        description: task.description,
        ownerId: task.ownerId,
        priority: task.priority,
        status: task.status || 'todo',
        dueDate: task.dueDate,
        tags: task.tags,
        subtasks: task.subtasks,
        recurrence: task.recurrence,
      },
      category: templateCategory.trim() || undefined,
      tags: tagArray,
    });

    setTemplates([...templates, newTemplate]);
    resetCreateForm();
  };

  const handleCreateManual = () => {
    if (!manualForm.name.trim() || !manualForm.title.trim()) return;

    const tagArray = manualForm.tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const templateTagArray = manualForm.templateTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const subtasks = manualForm.subtasks.map(st => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      title: st.title,
      completed: false,
    }));

    const newTemplate = templateStorage.addTemplate({
      name: manualForm.name.trim(),
      task: {
        title: manualForm.title.trim(),
        description: manualForm.description || undefined, // Preserve whitespace and formatting (spaces, bullets, line breaks)
        ownerId: manualForm.ownerId || selectedMemberId || members[0]?.id || '',
        priority: manualForm.priority,
        status: manualForm.status || 'todo',
        dueDate: '',
        tags: tagArray,
        subtasks,
        recurrence: manualForm.recurrenceType !== 'none' ? {
          type: manualForm.recurrenceType,
          interval: manualForm.recurrenceInterval,
          endDate: manualForm.recurrenceEndDate || undefined,
        } : undefined,
      },
      category: manualForm.category.trim() || undefined,
      tags: templateTagArray,
    });

    setTemplates([...templates, newTemplate]);
    resetManualForm();
  };

  const resetCreateForm = () => {
    setTemplateName('');
    setSelectedTask(null);
    setTemplateCategory('');
    setTemplateTags('');
    setCreateMode(null);
  };

  const resetManualForm = () => {
    setManualForm({
      name: '',
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      tags: '',
      category: '',
      templateTags: '',
      ownerId: selectedMemberId || '',
      subtasks: [],
      recurrenceType: 'none',
      recurrenceInterval: 1,
      recurrenceEndDate: '',
    });
    setCreateMode(null);
  };

  const handleUseTemplate = (template: TaskTemplate) => {
    const usedTemplate = templateStorage.useTemplate(template.id);
    if (!usedTemplate) return;

    setTemplates(templateStorage.getTemplates());

    // Use template's dueDate if exists, otherwise use current date as ISO string
    const dueDate = template.task.dueDate 
      ? template.task.dueDate
      : new Date().toISOString();

    addTask({
      ...template.task,
      ownerId: selectedMemberId || template.task.ownerId,
      dueDate,
      completed: false,
      status: template.task.status || 'todo',
    });
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      templateStorage.deleteTemplate(id);
      setTemplates(templateStorage.getTemplates());
    }
  };

  const handleStartEdit = (template: TaskTemplate) => {
    setEditingId(template.id);
    setEditForm({
      name: template.name,
      category: template.category || '',
      tags: template.tags || [],
    });
  };

  const handleSaveEdit = () => {
    if (!editingId || !editForm.name?.trim()) return;

    const tagsValue: string | string[] | undefined = editForm.tags as string | string[] | undefined;
    const tagArray: string[] = tagsValue 
      ? (typeof tagsValue === 'string'
          ? tagsValue.split(',').map(t => t.trim()).filter(t => t.length > 0)
          : Array.isArray(tagsValue) ? [...tagsValue] : [])
      : [];

    templateStorage.updateTemplate(editingId, {
      name: editForm.name.trim(),
      category: editForm.category?.trim() || undefined,
      tags: tagArray,
    });

    setTemplates(templateStorage.getTemplates());
    setEditingId(null);
    setEditForm({});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleAddSubtask = () => {
    setManualForm({
      ...manualForm,
      subtasks: [...manualForm.subtasks, { title: '' }],
    });
  };

  const handleUpdateSubtask = (index: number, title: string) => {
    const newSubtasks = [...manualForm.subtasks];
    newSubtasks[index].title = title;
    setManualForm({ ...manualForm, subtasks: newSubtasks });
  };

  const handleRemoveSubtask = (index: number) => {
    setManualForm({
      ...manualForm,
      subtasks: manualForm.subtasks.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Task Templates
          </h1>
          <p className="text-gray-600 mt-1">Save and reuse common task configurations</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCreateMode('from-task')}
            className="px-4 py-2 bg-purple-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            From Task
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCreateMode('manual')}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Manual
          </motion.button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Create Template from Task Form */}
      {createMode === 'from-task' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Create Template from Task</h2>
            <button
              onClick={resetCreateForm}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Template Name *</label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Weekly Review, Morning Routine"
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Task *</label>
              <select
                value={selectedTask || ''}
                onChange={(e) => setSelectedTask(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors"
              >
                <option value="">-- Select a task --</option>
                {tasks.map(task => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Folder className="w-4 h-4" />
                  Category
                </label>
                <input
                  type="text"
                  value={templateCategory}
                  onChange={(e) => setTemplateCategory(e.target.value)}
                  placeholder="e.g., Work, Personal"
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <TagIcon className="w-4 h-4" />
                  Template Tags
                </label>
                <input
                  type="text"
                  value={templateTags}
                  onChange={(e) => setTemplateTags(e.target.value)}
                  placeholder="comma-separated"
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateFromTask}
                disabled={!templateName.trim() || !selectedTask}
                className="px-6 py-2 bg-purple-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Template
              </motion.button>
              <button
                onClick={resetCreateForm}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Manual Create Form */}
      {createMode === 'manual' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Create Template Manually</h2>
            <button
              onClick={resetManualForm}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template Name *</label>
                <input
                  type="text"
                  value={manualForm.name}
                  onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                  placeholder="Template name"
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Title *</label>
                <input
                  type="text"
                  value={manualForm.title}
                  onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                  placeholder="Task title"
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={manualForm.description}
                onChange={(e) => setManualForm({ ...manualForm, description: e.target.value })}
                placeholder="Task description"
                rows={3}
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors resize-none whitespace-pre-wrap"
                style={{ whiteSpace: 'pre-wrap' }}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={manualForm.priority}
                  onChange={(e) => setManualForm({ ...manualForm, priority: e.target.value as Priority })}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Owner</label>
                <select
                  value={manualForm.ownerId}
                  onChange={(e) => setManualForm({ ...manualForm, ownerId: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors"
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Tags</label>
                <input
                  type="text"
                  value={manualForm.tags}
                  onChange={(e) => setManualForm({ ...manualForm, tags: e.target.value })}
                  placeholder="comma-separated"
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Folder className="w-4 h-4" />
                  Category
                </label>
                <input
                  type="text"
                  value={manualForm.category}
                  onChange={(e) => setManualForm({ ...manualForm, category: e.target.value })}
                  placeholder="e.g., Work, Personal"
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <TagIcon className="w-4 h-4" />
                  Template Tags
                </label>
                <input
                  type="text"
                  value={manualForm.templateTags}
                  onChange={(e) => setManualForm({ ...manualForm, templateTags: e.target.value })}
                  placeholder="comma-separated"
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subtasks</label>
              <div className="space-y-2">
                {manualForm.subtasks.map((st, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={st.title}
                      onChange={(e) => handleUpdateSubtask(index, e.target.value)}
                      placeholder="Subtask title"
                      className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors"
                    />
                    <button
                      onClick={() => handleRemoveSubtask(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleAddSubtask}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  + Add Subtask
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateManual}
                disabled={!manualForm.name.trim() || !manualForm.title.trim()}
                className="px-6 py-2 bg-purple-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Template
              </motion.button>
              <button
                onClick={resetManualForm}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-200 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {templates.length === 0 ? 'No Templates Yet' : 'No Templates Match Your Filters'}
          </h3>
          <p className="text-gray-500 mb-6">
            {templates.length === 0 
              ? 'Create your first template to quickly add common tasks'
              : 'Try adjusting your search or category filter'
            }
          </p>
          {templates.length === 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCreateMode('manual')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
            >
              Create Your First Template
            </motion.button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, index) => {
            const owner = members.find(m => m.id === template.task.ownerId);
            const isEditing = editingId === template.id;

            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border-2 border-purple-300 focus:border-purple-500 focus:outline-none font-semibold"
                    />
                    <input
                      type="text"
                      value={editForm.category || ''}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      placeholder="Category"
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-400 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={Array.isArray(editForm.tags) ? editForm.tags.join(', ') : editForm.tags || ''}
                      onChange={(e) => setEditForm({ ...editForm, tags: e.target.value as any })}
                      placeholder="Template tags (comma-separated)"
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-400 focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 flex items-center justify-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{template.name}</h3>
                        <p className="text-sm text-gray-500">
                          Used {template.useCount || 0} {template.useCount === 1 ? 'time' : 'times'}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleStartEdit(template)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {template.category && (
                        <div className="flex items-center gap-2">
                          <Folder className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-semibold text-purple-700">{template.category}</span>
                        </div>
                      )}
                      <div className="text-sm text-gray-700">
                        <span className="font-semibold">Task:</span> {template.task.title}
                      </div>
                      {template.task.description && (
                        <div className="text-sm text-gray-600 line-clamp-2">
                          {template.task.description}
                        </div>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                          template.task.priority === 'high' ? 'bg-red-100 text-red-700' :
                          template.task.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {template.task.priority}
                        </span>
                        {template.task.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                      {template.tags.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <TagIcon className="w-3 h-3 text-gray-500" />
                          {template.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {template.task.subtasks.length > 0 && (
                        <div className="text-xs text-gray-500">
                          {template.task.subtasks.length} subtasks
                        </div>
                      )}
                      {owner && (
                        <div className="text-xs text-gray-500">
                          Owner: {owner.name}
                        </div>
                      )}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleUseTemplate(template)}
                      className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Use Template
                    </motion.button>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
