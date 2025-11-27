import { Task } from '@/types';
import { storage } from './storage';

const TEMPLATE_STORAGE_KEY = 'gamified-task-manager-templates';

export interface TaskTemplate {
  id: string;
  name: string;
  task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>;
  createdAt: string;
  lastUsed?: string;
  useCount: number;
  category?: string;
  tags: string[];
}

export const templateStorage = {
  getTemplates: (): TaskTemplate[] => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(TEMPLATE_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading templates from localStorage:', error);
      return [];
    }
  },

  saveTemplates: (templates: TaskTemplate[]): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
    } catch (error) {
      console.error('Error saving templates to localStorage:', error);
    }
  },

  addTemplate: (template: Omit<TaskTemplate, 'id' | 'createdAt' | 'useCount'>): TaskTemplate => {
    const templates = templateStorage.getTemplates();
    const newTemplate: TaskTemplate = {
      ...template,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      createdAt: new Date().toISOString(),
      useCount: 0,
      tags: template.tags || [],
      category: template.category,
    };
    templates.push(newTemplate);
    templateStorage.saveTemplates(templates);
    return newTemplate;
  },

  updateTemplate: (id: string, updates: Partial<TaskTemplate>): void => {
    const templates = templateStorage.getTemplates();
    const updated = templates.map(t => 
      t.id === id ? { ...t, ...updates } : t
    );
    templateStorage.saveTemplates(updated);
  },

  deleteTemplate: (id: string): void => {
    const templates = templateStorage.getTemplates();
    templateStorage.saveTemplates(templates.filter(t => t.id !== id));
  },

  useTemplate: (id: string): TaskTemplate | null => {
    const templates = templateStorage.getTemplates();
    const template = templates.find(t => t.id === id);
    if (!template) return null;

    template.useCount = (template.useCount || 0) + 1;
    template.lastUsed = new Date().toISOString();
    templateStorage.saveTemplates(templates);
    return template;
  },
};

