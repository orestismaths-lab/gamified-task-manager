/**
 * Tasks API Route
 * Handles task CRUD operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleDatabaseError, handleValidationError, logError } from '@/lib/utils/errors';
import { getSessionUser } from '@/lib/utils/session';
import type { UserPublic } from '@/lib/types/auth';
import type { Task, Priority, TaskStatus } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/tasks
 * Returns all tasks for the authenticated user (created by or assigned to)
 */
export async function GET(req: NextRequest): Promise<NextResponse<{ tasks: Task[] } | { error: string; details?: string }>> {
  try {
    logError('Tasks API - GET', { message: 'Starting fetch' });
    
    // Validate Prisma client
    if (!prisma) {
      throw new Error('Prisma client not initialized');
    }

    const user = await getSessionUser(req);
    
    if (!user) {
      logError('Tasks API - GET', { message: 'Unauthorized - no user in session' });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.id || !user.email) {
      logError('Tasks API - GET', { message: 'Invalid user object', user });
      return NextResponse.json({ error: 'Invalid user session' }, { status: 401 });
    }

    logError('Tasks API - GET', { message: `User: ${user.email} (${user.id})` });

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

    logError('Tasks API - GET', { message: `Fetched ${tasks.length} tasks from database` });

    // Transform to frontend format
    const transformedTasks: Task[] = tasks.map((task) => {
      try {
        // Validate required fields
        if (!task.id || !task.title) {
          logError('Tasks API - GET', { message: `Skipping task with missing id or title`, taskId: task.id });
          return null;
        }

        return {
          id: task.id,
          title: task.title,
          description: task.description || undefined,
          ownerId: task.createdById, // Legacy field
          priority: (task.priority as Priority) || 'medium',
          status: (task.status as TaskStatus) || 'todo',
          dueDate: task.dueDate ? task.dueDate.toISOString() : new Date().toISOString(),
          tags: (() => {
            try {
              return task.tags ? JSON.parse(task.tags) : [];
            } catch {
              return [];
            }
          })(),
          subtasks: (task.subtasks || []).map((st) => ({
            id: st.id,
            title: st.title || '',
            completed: st.completed || false,
            createdAt: st.createdAt.toISOString(),
            updatedAt: st.updatedAt.toISOString(),
          })),
          completed: task.completed || false,
          createdAt: task.createdAt.toISOString(),
          updatedAt: task.updatedAt.toISOString(),
          assignedTo: (task.assignments || []).map((a) => a.userId).filter((id): id is string => !!id),
          createdBy: task.createdById,
        };
      } catch (mapError) {
        logError('Tasks API - GET', mapError, { taskId: task.id, taskTitle: task.title });
        return null;
      }
    }).filter((task): task is Task => task !== null);

    logError('Tasks API - GET', { message: `Returning ${transformedTasks.length} transformed tasks` });
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
            ? taskData.subtasks
                .filter((st): st is { title?: unknown; completed?: unknown } => 
                  st !== null && typeof st === 'object'
                )
                .map((st) => ({
                  title: typeof st.title === 'string' ? st.title.trim() : '',
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
    const transformedTask: Task = {
      id: task.id,
      title: task.title,
      description: task.description || undefined,
      ownerId: task.createdById,
      priority: task.priority as Priority,
      status: task.status as TaskStatus,
      dueDate: task.dueDate ? task.dueDate.toISOString() : new Date().toISOString(),
      tags: (() => {
        try {
          return task.tags ? JSON.parse(task.tags) : [];
        } catch {
          return [];
        }
      })(),
      subtasks: (task.subtasks || []).map((st) => ({
        id: st.id,
        title: st.title || '',
        completed: st.completed || false,
        createdAt: st.createdAt.toISOString(),
        updatedAt: st.updatedAt.toISOString(),
      })),
      completed: task.completed || false,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      assignedTo: (task.assignments || []).map((a) => a.userId).filter((id): id is string => !!id),
      createdBy: task.createdById,
    };

    // Task created successfully

    return NextResponse.json({ task: transformedTask }, { status: 201 });
  } catch (error) {
    logError('Tasks API - POST', error);
    return handleDatabaseError(error, 'Failed to create task');
  }
}

