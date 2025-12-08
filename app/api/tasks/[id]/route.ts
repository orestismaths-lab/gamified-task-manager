/**
 * Task by ID API Route
 * Handles individual task operations (GET, PUT, DELETE)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleDatabaseError, handleValidationError, logError } from '@/lib/utils/errors';
import { getSessionUser } from '@/lib/utils/session';
import { sanitizeTaskTitle, sanitizeTaskDescription, sanitizeStringArray } from '@/lib/utils/sanitize';
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

    // Validate and sanitize title
    if (updates.title !== undefined) {
      const sanitizedTitle = sanitizeTaskTitle(updates.title);
      if (!sanitizedTitle) {
        return handleValidationError(['Task title cannot be empty']);
      }
      if (sanitizedTitle.length > 500) {
        return handleValidationError(['Task title must be 500 characters or less']);
      }
      updateData.title = sanitizedTitle;
    }

    // Validate and sanitize description
    if (updates.description !== undefined) {
      const sanitizedDesc = sanitizeTaskDescription(updates.description);
      if (sanitizedDesc !== null && sanitizedDesc.length > 5000) {
        return handleValidationError(['Task description must be 5000 characters or less']);
      }
      updateData.description = sanitizedDesc;
    }

    // Validate priority
    if (updates.priority !== undefined) {
      const validPriorities = ['low', 'medium', 'high'] as const;
      if (typeof updates.priority === 'string' && validPriorities.includes(updates.priority as typeof validPriorities[number])) {
        updateData.priority = updates.priority;
      } else {
        return handleValidationError(['Priority must be one of: low, medium, high']);
      }
    }

    // Validate status
    if (updates.status !== undefined) {
      const validStatuses = ['todo', 'in-progress', 'in-review', 'blocked', 'completed'] as const;
      if (typeof updates.status === 'string' && validStatuses.includes(updates.status as typeof validStatuses[number])) {
        updateData.status = updates.status;
        updateData.completed = updates.status === 'completed';
      } else {
        return handleValidationError(['Status must be one of: todo, in-progress, in-review, blocked, completed']);
      }
    }

    // Validate dueDate
    if (updates.dueDate !== undefined) {
      if (updates.dueDate === null) {
        updateData.dueDate = null;
      } else if (typeof updates.dueDate === 'string') {
        const parsedDate = new Date(updates.dueDate);
        if (!isNaN(parsedDate.getTime())) {
          updateData.dueDate = parsedDate;
        } else {
          return handleValidationError(['Invalid due date format']);
        }
      } else {
        return handleValidationError(['Due date must be a valid date string or null']);
      }
    }

    // Validate and sanitize tags
    if (updates.tags !== undefined) {
      if (!Array.isArray(updates.tags)) {
        return handleValidationError(['Tags must be an array']);
      }
      try {
        const sanitizedTags = sanitizeStringArray(updates.tags);
        updateData.tags = JSON.stringify(sanitizedTags);
      } catch {
        return handleValidationError(['Invalid tags format']);
      }
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

    // Update assignments if provided (use transaction for atomicity)
    if (updates.assignedTo !== undefined) {
      if (!Array.isArray(updates.assignedTo)) {
        return handleValidationError(['assignedTo must be an array']);
      }

      // Validate user IDs
      const validUserIds = updates.assignedTo
        .filter((id): id is string => typeof id === 'string' && id.length > 0)
        .filter((id, index, self) => self.indexOf(id) === index); // Remove duplicates
      
      // Verify all assigned users exist
      if (validUserIds.length > 0) {
        const existingUsers = await prisma.user.findMany({
          where: { id: { in: validUserIds } },
          select: { id: true },
        });
        const existingUserIds = new Set(existingUsers.map(u => u.id));
        const invalidUserIds = validUserIds.filter(id => !existingUserIds.has(id));
        
        if (invalidUserIds.length > 0) {
          return handleValidationError([`Invalid user IDs: ${invalidUserIds.join(', ')}`]);
        }
      }
      
      // Use transaction for atomic assignment update
      await prisma.$transaction(async (tx) => {
        // Delete existing assignments
        await tx.taskAssignment.deleteMany({
          where: { taskId: params.id },
        });
        
        // Create new assignments
        if (validUserIds.length > 0) {
          await tx.taskAssignment.createMany({
            data: validUserIds.map((userId) => ({
              taskId: params.id,
              userId,
            })),
            skipDuplicates: true, // Prevent duplicate key errors
          });
        }
      });
    }

    // Update subtasks if provided (use transaction for atomicity)
    if (updates.subtasks !== undefined) {
      if (!Array.isArray(updates.subtasks)) {
        return handleValidationError(['subtasks must be an array']);
      }

      // Validate and sanitize subtasks
      const validSubtasks = updates.subtasks
        .filter((st): st is { title?: unknown; completed?: unknown } => 
          st !== null && typeof st === 'object'
        )
        .map((st) => {
          const sanitizedTitle = sanitizeTaskTitle(st.title) || '';
          if (sanitizedTitle.length > 500) {
            throw new Error('Subtask title must be 500 characters or less');
          }
          return {
            taskId: params.id,
            title: sanitizedTitle,
            completed: typeof st.completed === 'boolean' ? st.completed : false,
          };
        })
        .filter(st => st.title.length > 0) // Remove empty subtasks
        .slice(0, 50); // Limit to 50 subtasks max

      // Use transaction for atomic subtask update
      try {
        await prisma.$transaction(async (tx) => {
          // Delete existing subtasks
          await tx.subtask.deleteMany({
            where: { taskId: params.id },
          });
          
          // Create new subtasks
          if (validSubtasks.length > 0) {
            await tx.subtask.createMany({
              data: validSubtasks,
            });
          }
        });
      } catch (error) {
        if (error instanceof Error && error.message.includes('500 characters')) {
          return handleValidationError([error.message]);
        }
        throw error;
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

