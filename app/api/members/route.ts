/**
 * Members API Route
 * Returns all users as members for task assignment
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleDatabaseError, logError } from '@/lib/utils/errors';
import { Member } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/members
 * Returns a list of all members for task assignment with XP/level from database
 */
export async function GET(): Promise<NextResponse<{ members: Member[] } | { error: string; details?: string }>> {
  try {
    logError('Members API - GET', { message: 'Starting fetch' });
    
    // Validate Prisma client
    if (!prisma) {
      throw new Error('Prisma client not initialized');
    }

    // Get users from database with their member profiles (XP, level)
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

    logError('Members API - GET', { message: `Fetched ${users.length} users from database` });

    // Convert users to members format with XP/level from database
    const userMembers: Member[] = users.map((user) => {
      try {
        // Validate required fields
        if (!user.id || !user.email) {
          logError('Members API - GET', { message: `Skipping user with missing id or email`, user });
          return null;
        }

        return {
          id: user.id,
          name: user.name || user.email.split('@')[0] || 'User',
          email: user.email,
          userId: user.id,
          avatar: user.avatar || undefined,
          xp: user.memberProfile?.xp ?? 0, // Get XP from database, default to 0
          level: user.memberProfile?.level ?? 1, // Get level from database, default to 1
        };
      } catch (mapError) {
        logError('Members API - GET', mapError, { userId: user.id, userEmail: user.email });
        return null;
      }
    }).filter((member): member is Member => member !== null);

    logError('Members API - GET', { message: `Returning ${userMembers.length} members` });
    return NextResponse.json({ members: userMembers });
  } catch (error) {
    logError('Members API - GET', error);
    return handleDatabaseError(error, 'Failed to fetch members');
  }
}

