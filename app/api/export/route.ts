/**
 * Export API Route
 * Exports all tasks and members from database to JSON format
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleDatabaseError, logError } from '@/lib/utils/errors';
import { getSessionUser } from '@/lib/utils/session';
import type { Task, Member, Priority, TaskStatus } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/export
 * Exports all tasks and members for the logged-in user in JSON format
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    logError('Export API - GET', { message: 'Starting export' });
    
    // Validate Prisma client
    if (!prisma) {
      throw new Error('Prisma client not initialized');
    }

    const user = await getSessionUser(req);
    
    if (!user) {
      logError('Export API - GET', { message: 'Unauthorized - no user in session' });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.id || !user.email) {
      logError('Export API - GET', { message: 'Invalid user object', user });
      return NextResponse.json({ error: 'Invalid user session' }, { status: 401 });
    }

    logError('Export API - GET', { message: `Exporting for user: ${user.email} (${user.id})` });

    // Get all tasks for the user
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

    // Get all members (users) for the export
    const users = await prisma.user.findMany({
      orderBy: { email: 'asc' },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        memberProfile: {
          select: {
            xp: true,
            level: true,
          },
        },
      },
    });

    logError('Export API - GET', { 
      message: `Fetched ${tasks.length} tasks and ${users.length} members from database` 
    });

    // Transform tasks to frontend format
    const transformedTasks: Task[] = tasks.flatMap((task) => {
      try {
        if (!task.id || !task.title) {
          logError('Export API - GET', { 
            message: `Skipping task with missing id or title`, 
            taskId: task.id 
          });
          return [];
        }

        return [{
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
        }];
      } catch (mapError) {
        logError('Export API - GET', mapError, { taskId: task.id, taskTitle: task.title });
        return [];
      }
    });

    // Transform users to members format
    const transformedMembers: Member[] = users
      .flatMap((user) => {
        try {
          if (!user.id || !user.email) {
            logError('Export API - GET', { 
              message: `Skipping user with missing id or email`, 
              user 
            });
            return [];
          }

          return [{
            id: user.id,
            name: user.name || user.email.split('@')[0] || 'User',
            email: user.email,
            userId: user.id,
            avatar: user.avatar || undefined,
            xp: user.memberProfile?.xp ?? 0,
            level: user.memberProfile?.level ?? 1,
          }];
        } catch (mapError) {
          logError('Export API - GET', mapError, { userId: user.id, userEmail: user.email });
          return [];
        }
      });

    // Create export data in the same format as backup.exportData()
    const exportData = {
      tasks: transformedTasks,
      members: transformedMembers,
      selectedMemberId: user.id, // Default to current user
      exportDate: new Date().toISOString(),
      version: '1.0',
      exportedFrom: 'database',
    };

    logError('Export API - GET', { 
      message: `Export completed: ${transformedTasks.length} tasks, ${transformedMembers.length} members` 
    });

    // Return as JSON with proper headers for download
    return NextResponse.json(exportData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="task-manager-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    logError('Export API - GET', error);
    return handleDatabaseError(error, 'Failed to export data');
  }
}

