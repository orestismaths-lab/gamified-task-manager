/**
 * Tasks API Route
 * Handles task CRUD operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleDatabaseError, handleValidationError, logError } from '@/lib/utils/errors';
import { getSessionUser } from '@/lib/utils/session';
import type { UserPublic } from '@/lib/types/auth';
import type { Task } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/tasks
 * Returns all tasks for the authenticated user (created by or assigned to)
 */
export async function GET(req: NextRequest): Promise<NextResponse<{ tasks: Task[] } | { error: string; details?: string }>> {
  try {
    const user = await getSessionUser(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Log for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      logError('Tasks API - GET', { message: `User: ${user.email} (${user.id})` });
    }

    // Get tasks created by user or assigned to user
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { createdById: user.id },
          {
            assignments: {
              some: {
                userId: user.id,
              },
            },
          },
        ],
      },
      include: {
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
        subtasks: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Debug logging
    console.log(`[GET /api/tasks] Found ${tasks.length} tasks for user ${user.email}`);
    tasks.forEach(task => {
      console.log(`  - Task: ${task.title} (createdBy: ${task.createdById}, assignments: ${task.assignments.map(a => a.userId).join(', ')})`);
    });

    // Transform to frontend format
    const transformedTasks = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description || undefined,
      ownerId: task.createdById, // Legacy field
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.toISOString() : new Date().toISOString(),
      tags: task.tags ? JSON.parse(task.tags) : [],
      subtasks: task.subtasks.map((st) => ({
        id: st.id,
        title: st.title,
        completed: st.completed,
        createdAt: st.createdAt.toISOString(),
        updatedAt: st.updatedAt.toISOString(),
      })),
      completed: task.completed,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      assignedTo: task.assignments.map((a) => a.userId),
      createdBy: task.createdById,
    }));

    return NextResponse.json({ tasks: transformedTasks });
  } catch (error) {
    logError('Tasks API - GET', error);
    return handleDatabaseError(error, 'Failed to fetch tasks');
  }
}

/**
 * POST /api/tasks
 * Creates a new task
 */
export async function POST(req: NextRequest): Promise<NextResponse<{ task: Task } | { error: string; details?: string }>> {
  try {
    const user = await getSessionUser(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return handleValidationError(['Invalid request body']);
    }

    const taskData = body as {
      title?: unknown;
      description?: unknown;
      priority?: unknown;
      status?: unknown;
      dueDate?: unknown;
      tags?: unknown;
      subtasks?: unknown;
      assignedTo?: unknown;
    };

    if (!taskData.title || typeof taskData.title !== 'string' || taskData.title.trim().length === 0) {
      return handleValidationError(['Task title is required']);
    }

    // Validate assignedTo users exist
    const assignedToUserIds = Array.isArray(taskData.assignedTo) && taskData.assignedTo.length > 0
      ? (taskData.assignedTo as unknown[]).filter((id): id is string => typeof id === 'string')
      : [user.id];
    
    // Verify all assigned users exist
    if (assignedToUserIds.length > 0) {
      const existingUsers = await prisma.user.findMany({
        where: { id: { in: assignedToUserIds } },
        select: { id: true },
      });
      const existingUserIds = new Set(existingUsers.map(u => u.id));
      const invalidUserIds = assignedToUserIds.filter(id => !existingUserIds.has(id));
      
      if (invalidUserIds.length > 0) {
        return handleValidationError([`Invalid user IDs: ${invalidUserIds.join(', ')}`]);
      }
    }

    // Create task with assignments
    const task = await prisma.task.create({
      data: {
        title: taskData.title.trim(),
        description: typeof taskData.description === 'string' ? taskData.description : null,
        priority: (taskData.priority as string) || 'medium',
        status: (taskData.status as string) || 'todo',
        dueDate: taskData.dueDate ? new Date(taskData.dueDate as string) : null,
        tags: (() => {
          try {
            return taskData.tags && Array.isArray(taskData.tags) 
              ? JSON.stringify(taskData.tags) 
              : '[]';
          } catch {
            return '[]';
          }
        })(),
        completed: taskData.status === 'completed',
        createdById: user.id,
        subtasks: {
          create: Array.isArray(taskData.subtasks)
            ? taskData.subtasks.map((st: { title?: unknown; completed?: unknown }) => ({
                title: typeof st.title === 'string' ? st.title : '',
                completed: typeof st.completed === 'boolean' ? st.completed : false,
              }))
            : [],
        },
        assignments: {
          create: assignedToUserIds.map((userId: string) => ({
            userId,
          })),
        },
      },
      include: {
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
        subtasks: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // Transform to frontend format
    const transformedTask = {
      id: task.id,
      title: task.title,
      description: task.description || undefined,
      ownerId: task.createdById,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.toISOString() : new Date().toISOString(),
      tags: task.tags ? JSON.parse(task.tags) : [],
      subtasks: task.subtasks.map((st) => ({
        id: st.id,
        title: st.title,
        completed: st.completed,
        createdAt: st.createdAt.toISOString(),
        updatedAt: st.updatedAt.toISOString(),
      })),
      completed: task.completed,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      assignedTo: task.assignments.map((a) => a.userId),
      createdBy: task.createdById,
    };

    // Debug logging
    console.log(`[POST /api/tasks] Created task "${transformedTask.title}" with ID ${transformedTask.id}, assignedTo: ${transformedTask.assignedTo.join(', ')}`);

    return NextResponse.json({ task: transformedTask }, { status: 201 });
  } catch (error) {
    logError('Tasks API - POST', error);
    return handleDatabaseError(error, 'Failed to create task');
  }
}

