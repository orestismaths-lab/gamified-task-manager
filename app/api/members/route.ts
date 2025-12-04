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
    // Get users from database with their member profiles (XP, level)
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        memberProfile: {
          select: {
            xp: true,
            level: true,
          },
        },
      },
    });

    // Convert users to members format with XP/level from database
    const userMembers: Member[] = users.map((user) => ({
      id: user.id,
      name: user.name || user.email.split('@')[0] || 'User',
      email: user.email,
      userId: user.id,
      avatar: user.avatar || undefined,
      xp: user.memberProfile?.xp ?? 0, // Get XP from database, default to 0
      level: user.memberProfile?.level ?? 1, // Get level from database, default to 1
    }));

    return NextResponse.json({ members: userMembers });
  } catch (error) {
    logError('Members API - GET', error);
    return handleDatabaseError(error, 'Failed to fetch members');
  }
}

