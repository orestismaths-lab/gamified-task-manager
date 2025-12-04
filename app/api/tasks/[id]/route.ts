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
    if (updates.priority) {
      updateData.priority = updates.priority as string;
    }
    if (updates.status) {
      updateData.status = updates.status as string;
    }
    if (updates.dueDate) {
      updateData.dueDate = new Date(updates.dueDate as string);
    }
    if (updates.tags) {
      updateData.tags = JSON.stringify(updates.tags);
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
    if (updates.subtasks && Array.isArray(updates.subtasks)) {
      // Delete existing subtasks
      await prisma.subtask.deleteMany({
        where: { taskId: params.id },
      });
      // Create new subtasks
      await prisma.subtask.createMany({
        data: (updates.subtasks as Array<{ title?: unknown; completed?: unknown }>).map((st) => ({
          taskId: params.id,
          title: typeof st.title === 'string' ? st.title : '',
          completed: typeof st.completed === 'boolean' ? st.completed : false,
        })),
      });
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
      subtasks: updatedTask.subtasks.map((st) => ({
        id: st.id,
        title: st.title,
        completed: st.completed,
        createdAt: st.createdAt.toISOString(),
        updatedAt: st.updatedAt.toISOString(),
      })),
      completed: updatedTask.completed,
      createdAt: updatedTask.createdAt.toISOString(),
      updatedAt: updatedTask.updatedAt.toISOString(),
      assignedTo: updatedTask.assignments.map((a) => a.userId),
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

