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
    const errors: string[] = [];

    // Log incoming data
    logError('[migrate-data] Starting migration', {
      userId: user.id,
      userEmail: user.email,
      tasksCount: tasks?.length || 0,
      membersCount: members?.length || 0,
    });

    // Migrate tasks
    if (tasks && Array.isArray(tasks) && tasks.length > 0) {
      logError('[migrate-data] Processing tasks', { count: tasks.length });
      
      for (const task of tasks) {
        try {
          // Validate task has required fields (title is required, id is optional)
          if (!task.title || typeof task.title !== 'string' || task.title.trim().length === 0) {
            errors.push(`Skipping task with invalid title: ${JSON.stringify(task.title)}`);
            logError('[migrate-data] Skipping invalid task:', { id: task.id, title: task.title });
            continue;
          }

          const taskTitle = task.title.trim();

          // Check if task already exists (by title + createdBy for same user)
          // We don't check by ID since we're generating new IDs
          const existingTask = await prisma.task.findFirst({
            where: {
              title: taskTitle,
              createdById: user.id,
            },
          });

          if (existingTask) {
            logError('[migrate-data] Task already exists, skipping:', { title: taskTitle, existingId: existingTask.id });
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
                      .filter((st: unknown): st is { title?: unknown; completed?: unknown } => 
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
          logError('[migrate-data] Successfully imported task:', { title: taskTitle, importedCount: importedTasks });
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          errors.push(`Error importing task "${task.title || 'unknown'}": ${errorMsg}`);
          logError(`[migrate-data] Error importing task ${task.id || task.title || 'unknown'}:`, error);
          // Continue with next task
        }
      }
      
      logError('[migrate-data] Task migration completed', { imported: importedTasks, total: tasks.length });
    } else {
      logError('[migrate-data] No tasks to migrate', { tasksProvided: !!tasks, isArray: Array.isArray(tasks), length: tasks?.length });
    }

    // Migrate members (create MemberProfile for users)
    if (members && Array.isArray(members) && members.length > 0) {
      logError('[migrate-data] Processing members', { count: members.length, userEmail: user.email, userId: user.id });
      
      // Find member that matches current user
      // Try multiple matching strategies (prioritize userId, then email, then name)
      let userMember = members.find(m => m.userId && m.userId === user.id);
      
      if (!userMember) {
        userMember = members.find(m => {
          const memberEmail = m.email?.toLowerCase().trim();
          const userEmail = user.email?.toLowerCase().trim();
          return memberEmail && userEmail && memberEmail === userEmail;
        });
      }
      
      if (!userMember && user.name) {
        userMember = members.find(m => {
          const memberName = m.name?.toLowerCase().trim();
          const userName = user.name?.toLowerCase().trim();
          return memberName && userName && memberName === userName;
        });
      }
      
      logError('[migrate-data] Member matching result', {
        found: !!userMember,
        memberEmail: userMember?.email,
        memberUserId: userMember?.userId,
        memberName: userMember?.name,
        userEmail: user.email,
        userId: user.id,
        userName: user.name,
        allMemberEmails: members.map(m => m.email).filter(Boolean),
        allMemberUserIds: members.map(m => m.userId).filter(Boolean),
      });
      
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
                xp: typeof userMember.xp === 'number' ? userMember.xp : 0,
                level: typeof userMember.level === 'number' ? userMember.level : 1,
              },
            });
            importedMembers++;
            logError('[migrate-data] Created MemberProfile', { userId: user.id, xp: userMember.xp, level: userMember.level });
          } else {
            // Update existing profile with XP/level from localStorage (if higher)
            const newXp = typeof userMember.xp === 'number' ? userMember.xp : 0;
            const newLevel = typeof userMember.level === 'number' ? userMember.level : 1;
            
            if (newXp > existingProfile.xp || newLevel > existingProfile.level) {
              await prisma.memberProfile.update({
                where: { userId: user.id },
                data: {
                  xp: Math.max(existingProfile.xp, newXp),
                  level: Math.max(existingProfile.level, newLevel),
                },
              });
              logError('[migrate-data] Updated MemberProfile', { userId: user.id, oldXp: existingProfile.xp, newXp, oldLevel: existingProfile.level, newLevel });
            } else {
              logError('[migrate-data] MemberProfile already has higher/equal XP/Level', { userId: user.id, existingXp: existingProfile.xp, existingLevel: existingProfile.level });
            }
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          errors.push(`Error importing member profile: ${errorMsg}`);
          logError(`[migrate-data] Error importing member profile:`, error);
        }
      } else {
        logError('[migrate-data] No matching member found', {
          membersProvided: members.length,
          userEmail: user.email,
          userId: user.id,
          memberEmails: members.map(m => m.email).filter(Boolean),
          memberUserIds: members.map(m => m.userId).filter(Boolean),
        });
        errors.push(`No matching member found for user ${user.email || user.id}. Checked ${members.length} members.`);
      }
    } else {
      logError('[migrate-data] No members to migrate', { membersProvided: !!members, isArray: Array.isArray(members), length: members?.length });
    }

    const message = errors.length > 0
      ? `Data migration completed with ${errors.length} warning(s). Imported ${importedTasks} tasks and ${importedMembers} members.`
      : `Data migration completed successfully. Imported ${importedTasks} tasks and ${importedMembers} members.`;

    logError('[migrate-data] Migration completed', {
      importedTasks,
      importedMembers,
      errors: errors.length,
      errorDetails: errors,
    });

    return NextResponse.json({
      success: true,
      message,
      imported: {
        tasks: importedTasks,
        members: importedMembers,
      },
      ...(errors.length > 0 && { warnings: errors }),
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

