/**
 * Data Migration API Route
 * Migrates tasks and members from localStorage to database
 * This is a one-time migration endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/utils/session';
import { handleDatabaseError, logError } from '@/lib/utils/errors';
import type { UserPublic } from '@/lib/types/auth';
import type { Task, Member } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/migrate-data
 * Migrates tasks and members from localStorage format to database
 * Body: { tasks: Task[], members: Member[] }
 * 
 * This endpoint:
 * 1. Takes tasks/members from localStorage (sent by client)
 * 2. Creates them in the database for the authenticated user
 * 3. Returns success/error status
 */
export async function POST(req: NextRequest): Promise<NextResponse<{ success: boolean; message: string; imported?: { tasks: number; members: number } } | { error: string; details?: string }>> {
  try {
    const user: UserPublic | null = await getSessionUser(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { tasks, members } = body as {
      tasks?: Task[];
      members?: Member[];
    };

    let importedTasks = 0;
    let importedMembers = 0;

    // Migrate tasks
    if (tasks && Array.isArray(tasks) && tasks.length > 0) {
      // Migrating tasks
      
      for (const task of tasks) {
        try {
          // Validate task has required fields
          if (!task.id || !task.title || typeof task.title !== 'string' || task.title.trim().length === 0) {
            logError('[migrate-data] Skipping invalid task:', { id: task.id, title: task.title });
            continue;
          }

          // Check if task already exists (by ID or by title + createdBy for same user)
          const existingTask = await prisma.task.findFirst({
            where: {
              OR: [
                { id: task.id },
                {
                  title: task.title.trim(),
                  createdById: user.id,
                },
              ],
            },
          });

          if (existingTask) {
            // Task already exists, skip
            continue;
          }

          // Validate priority and status
          const validPriorities = ['low', 'medium', 'high'];
          const validStatuses = ['todo', 'in-progress', 'in-review', 'blocked', 'completed'];
          
          const priority = (() => {
            if (task.priority && typeof task.priority === 'string' && validPriorities.includes(task.priority)) {
              return task.priority;
            }
            return 'medium';
          })();

          const status = (() => {
            if (task.status && typeof task.status === 'string' && validStatuses.includes(task.status)) {
              return task.status;
            }
            return task.completed ? 'completed' : 'todo';
          })();

          // Validate and parse dueDate
          let dueDate: Date | null = null;
          if (task.dueDate) {
            if (typeof task.dueDate === 'string') {
              const parsedDate = new Date(task.dueDate);
              if (!isNaN(parsedDate.getTime())) {
                dueDate = parsedDate;
              }
            }
          }

          // Create task in database (generate new ID to avoid conflicts)
          await prisma.task.create({
            data: {
              title: task.title.trim(),
              description: task.description && typeof task.description === 'string' ? task.description.trim() : null,
              priority,
              status,
              dueDate,
              tags: (() => {
                try {
                  return Array.isArray(task.tags) ? JSON.stringify(task.tags) : '[]';
                } catch {
                  return '[]';
                }
              })(),
              completed: status === 'completed' || task.completed || false,
              createdById: user.id, // Assign to current user
              subtasks: {
                create: Array.isArray(task.subtasks)
                  ? task.subtasks
                      .filter((st): st is { title?: string; completed?: boolean } => 
                        st !== null && typeof st === 'object'
                      )
                      .map((st) => ({
                        title: (typeof st.title === 'string' ? st.title.trim() : '') || '',
                        completed: typeof st.completed === 'boolean' ? st.completed : false,
                      }))
                  : [],
              },
              assignments: {
                create: [
                  { userId: user.id }, // Assign to current user by default
                ],
              },
            },
          });

          importedTasks++;
        } catch (error) {
          logError(`[migrate-data] Error importing task ${task.id || 'unknown'}:`, error);
          // Continue with next task
        }
      }
    }

    // Migrate members (create MemberProfile for users)
    if (members && Array.isArray(members) && members.length > 0) {
      if (process.env.NODE_ENV === 'development') {
        logError('Data Migration', { message: `Migrating ${members.length} members for user ${user.id}` });
      }
      
      // Find member that matches current user
      const userMember = members.find(m => m.userId === user.id || m.email === user.email);
      
      if (userMember) {
        try {
          // Check if MemberProfile already exists
          const existingProfile = await prisma.memberProfile.findUnique({
            where: { userId: user.id },
          });

          if (!existingProfile) {
            // Create MemberProfile with XP/level from localStorage
            await prisma.memberProfile.create({
              data: {
                userId: user.id,
                xp: userMember.xp || 0,
                level: userMember.level || 1,
              },
            });
            importedMembers++;
          } else {
            // Update existing profile with XP/level from localStorage (if higher)
            if (userMember.xp > existingProfile.xp || userMember.level > existingProfile.level) {
              await prisma.memberProfile.update({
                where: { userId: user.id },
                data: {
                  xp: Math.max(existingProfile.xp, userMember.xp || 0),
                  level: Math.max(existingProfile.level, userMember.level || 1),
                },
              });
              // MemberProfile updated
            }
          }
        } catch (error) {
          logError(`[migrate-data] Error importing member profile:`, error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Data migration completed',
      imported: {
        tasks: importedTasks,
        members: importedMembers,
      },
    });
  } catch (error) {
    logError('Data migration error:', error);
    return handleDatabaseError(error, 'Failed to migrate data');
  }
}

/**
 * GET /api/migrate-data
 * Returns instructions for data migration
 */
export async function GET(): Promise<NextResponse<{ message: string; instructions: string[] }>> {
  return NextResponse.json({
    message: 'Data migration endpoint. Use POST to migrate localStorage data to database.',
    instructions: [
      '1. Get tasks and members from localStorage on client side',
      '2. POST to /api/migrate-data with body: { tasks: Task[], members: Member[] }',
      '3. Tasks and members will be imported to database for authenticated user',
      '4. This is a one-time migration - duplicate tasks will be skipped',
    ],
  });
}

