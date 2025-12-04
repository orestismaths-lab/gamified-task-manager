/**
 * Task by ID API Route
 * Handles individual task operations (GET, PUT, DELETE)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleDatabaseError, handleValidationError, logError } from '@/lib/utils/errors';
import { getSessionUser } from '@/lib/utils/session';
import type { UserPublic } from '@/lib/types/auth';
import type { Task, Priority, TaskStatus } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/tasks/[id]
 * Returns a single task by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<{ task: Task } | { error: string; details?: string }>> {
  try {
    const user: UserPublic | null = await getSessionUser(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const task = await prisma.task.findFirst({
      where: {
        id: params.id,
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
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

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

    return NextResponse.json({ task: transformedTask });
  } catch (error) {
    logError('Tasks API - GET by ID', error);
    return handleDatabaseError(error, 'Failed to fetch task');
  }
}

/**
 * PUT /api/tasks/[id]
 * Updates a task
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<{ task: Task } | { error: string; details?: string }>> {
  try {
    const user: UserPublic | null = await getSessionUser(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission (creator or assigned)
    const existingTask = await prisma.task.findFirst({
      where: {
        id: params.id,
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
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return handleValidationError(['Invalid request body']);
    }

    const updates = body as {
      title?: unknown;
      description?: unknown;
      priority?: unknown;
      status?: unknown;
      dueDate?: unknown;
      tags?: unknown;
      subtasks?: unknown;
      assignedTo?: unknown;
    };

    // Build update data object
    const updateData: {
      title?: string;
      description?: string | null;
      priority?: string;
      status?: string;
      dueDate?: Date | null;
      tags?: string;
      completed?: boolean;
    } = {};

    if (updates.title && typeof updates.title === 'string') {
      updateData.title = updates.title.trim();
    }
    if (updates.description !== undefined) {
      updateData.description = updates.description as string | null;
    }
    if (updates.priority !== undefined) {
      const validPriorities = ['low', 'medium', 'high'];
      if (typeof updates.priority === 'string' && validPriorities.includes(updates.priority)) {
        updateData.priority = updates.priority;
      } else {
        return handleValidationError([`Invalid priority: ${updates.priority}. Must be one of: ${validPriorities.join(', ')}`]);
      }
    }
    if (updates.status !== undefined) {
      const validStatuses = ['todo', 'in-progress', 'in-review', 'blocked', 'completed'];
      if (typeof updates.status === 'string' && validStatuses.includes(updates.status)) {
        updateData.status = updates.status;
        updateData.completed = updates.status === 'completed';
      } else {
        return handleValidationError([`Invalid status: ${updates.status}. Must be one of: ${validStatuses.join(', ')}`]);
      }
    }
    if (updates.dueDate !== undefined) {
      if (updates.dueDate === null || updates.dueDate === '') {
        updateData.dueDate = null;
      } else if (typeof updates.dueDate === 'string') {
        const parsedDate = new Date(updates.dueDate);
        if (!isNaN(parsedDate.getTime())) {
          updateData.dueDate = parsedDate;
        } else {
          return handleValidationError([`Invalid date format: ${updates.dueDate}`]);
        }
      } else {
        return handleValidationError(['dueDate must be a string or null']);
      }
    }
    if (updates.tags !== undefined) {
      try {
        updateData.tags = Array.isArray(updates.tags) ? JSON.stringify(updates.tags) : '[]';
      } catch {
        updateData.tags = '[]';
      }
    }
    if (updates.status === 'completed') {
      updateData.completed = true;
    } else if (updates.status && updates.status !== 'completed') {
      updateData.completed = false;
    }

    // Update task
    const task = await prisma.task.update({
      where: { id: params.id },
      data: updateData,
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

    // Update assignments if provided
    if (updates.assignedTo && Array.isArray(updates.assignedTo)) {
      await prisma.taskAssignment.deleteMany({
        where: { taskId: params.id },
      });
      await prisma.taskAssignment.createMany({
        data: (updates.assignedTo as string[]).map((userId) => ({
          taskId: params.id,
          userId,
        })),
      });
    }

    // Update subtasks if provided
    if (updates.subtasks !== undefined && Array.isArray(updates.subtasks)) {
      // Delete existing subtasks
      await prisma.subtask.deleteMany({
        where: { taskId: params.id },
      });
      
      // Create new subtasks (with validation)
      const validSubtasks = updates.subtasks
        .filter((st): st is { title?: unknown; completed?: unknown } => 
          st !== null && typeof st === 'object'
        )
        .map((st) => ({
          taskId: params.id,
          title: typeof st.title === 'string' ? st.title.trim() : '',
          completed: typeof st.completed === 'boolean' ? st.completed : false,
        }));
      
      if (validSubtasks.length > 0) {
        await prisma.subtask.createMany({
          data: validSubtasks,
        });
      }
    }

    // Fetch updated task with all relations
    const updatedTask = await prisma.task.findUnique({
      where: { id: params.id },
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

    if (!updatedTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Transform to frontend format
    const transformedTask: Task = {
      id: updatedTask.id,
      title: updatedTask.title,
      description: updatedTask.description || undefined,
      ownerId: updatedTask.createdById,
      priority: updatedTask.priority as Priority,
      status: updatedTask.status as TaskStatus,
      dueDate: updatedTask.dueDate ? updatedTask.dueDate.toISOString() : new Date().toISOString(),
      tags: (() => {
        try {
          return updatedTask.tags ? JSON.parse(updatedTask.tags) : [];
        } catch {
          return [];
        }
      })(),
      subtasks: (updatedTask.subtasks || []).map((st) => ({
        id: st.id,
        title: st.title || '',
        completed: st.completed || false,
        createdAt: st.createdAt.toISOString(),
        updatedAt: st.updatedAt.toISOString(),
      })),
      completed: updatedTask.completed || false,
      createdAt: updatedTask.createdAt.toISOString(),
      updatedAt: updatedTask.updatedAt.toISOString(),
      assignedTo: (updatedTask.assignments || []).map((a) => a.userId).filter((id): id is string => !!id),
      createdBy: updatedTask.createdById,
    };

    return NextResponse.json({ task: transformedTask });
  } catch (error) {
    logError('Tasks API - PUT', error);
    return handleDatabaseError(error, 'Failed to update task');
  }
}

/**
 * DELETE /api/tasks/[id]
 * Deletes a task
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<{ success: boolean } | { error: string; details?: string }>> {
  try {
    const user: UserPublic | null = await getSessionUser(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is the creator
    const task = await prisma.task.findFirst({
      where: {
        id: params.id,
        createdById: user.id,
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
    }

    // Delete task (cascade will handle assignments and subtasks)
    await prisma.task.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError('Tasks API - DELETE', error);
    return handleDatabaseError(error, 'Failed to delete task');
  }
}

