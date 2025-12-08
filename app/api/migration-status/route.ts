/**
 * Migration Status API Route
 * Checks if user has already migrated data to database
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/utils/session';
import { handleDatabaseError, logError } from '@/lib/utils/errors';
import type { UserPublic } from '@/lib/types/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/migration-status
 * Returns whether the user has tasks/members in the database (migration completed)
 */
export async function GET(req: NextRequest): Promise<NextResponse<{ 
  hasMigrated: boolean; 
  taskCount: number; 
  memberProfileExists: boolean;
} | { error: string; details?: string }>> {
  try {
    const user: UserPublic | null = await getSessionUser(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has tasks in database
    const taskCount = await prisma.task.count({
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
    });

    // Check if user has member profile
    const memberProfile = await prisma.memberProfile.findUnique({
      where: { userId: user.id },
    });

    // Consider migration completed if:
    // 1. User has at least one task in database, OR
    // 2. User has a member profile (even if no tasks yet)
    const hasMigrated = taskCount > 0 || !!memberProfile;

    logError('[migration-status] Checked migration status', {
      userId: user.id,
      taskCount,
      memberProfileExists: !!memberProfile,
      hasMigrated,
    });

    return NextResponse.json({
      hasMigrated,
      taskCount,
      memberProfileExists: !!memberProfile,
    });
  } catch (error) {
    logError('Migration Status API', error);
    return handleDatabaseError(error, 'Failed to check migration status');
  }
}

