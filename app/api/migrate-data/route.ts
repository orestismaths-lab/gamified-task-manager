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
      console.log(`[migrate-data] Migrating ${tasks.length} tasks for user ${user.id}`);
      
      for (const task of tasks) {
        try {
          // Check if task already exists
          const existingTask = await prisma.task.findUnique({
            where: { id: task.id },
          });

          if (existingTask) {
            console.log(`[migrate-data] Task ${task.id} already exists, skipping`);
            continue;
          }

          // Create task in database
          await prisma.task.create({
            data: {
              id: task.id,
              title: task.title,
              description: task.description || null,
              priority: task.priority || 'medium',
              status: task.status || (task.completed ? 'completed' : 'todo'),
              dueDate: task.dueDate ? new Date(task.dueDate) : null,
              tags: JSON.stringify(task.tags || []),
              completed: task.completed || false,
              createdById: user.id, // Assign to current user
              subtasks: {
                create: (task.subtasks || []).map((st) => ({
                  title: st.title || '',
                  completed: st.completed || false,
                })),
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
          logError(`[migrate-data] Error importing task ${task.id}:`, error);
          // Continue with next task
        }
      }
    }

    // Migrate members (create MemberProfile for users)
    if (members && Array.isArray(members) && members.length > 0) {
      console.log(`[migrate-data] Migrating ${members.length} members for user ${user.id}`);
      
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
            console.log(`[migrate-data] Created MemberProfile for user ${user.id} with XP: ${userMember.xp}, Level: ${userMember.level}`);
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
              console.log(`[migrate-data] Updated MemberProfile for user ${user.id}`);
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

