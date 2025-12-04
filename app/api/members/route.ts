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
 * Returns a list of all members for task assignment:
 * - Users from database (with userId)
 * - Members from localStorage (may not have userId - created by admin before user signup)
 */
export async function GET(): Promise<NextResponse<{ members: Member[] } | { error: string; details?: string }>> {
  try {
    // Get users from database
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
      },
    });

    // Convert users to members format
    const userMembers: Member[] = users.map((user) => ({
      id: user.id,
      name: user.name || user.email.split('@')[0] || 'User',
      email: user.email,
      userId: user.id,
      avatar: user.avatar || undefined,
      xp: 0, // Default XP for new members
      level: 1, // Default level
    }));

    // Note: Members without userId are stored in localStorage and loaded client-side
    // This endpoint returns only users (with userId). 
    // Client-side code will merge with localStorage members.
    return NextResponse.json({ members: userMembers });
  } catch (error) {
    logError('Members API - GET', error);
    return handleDatabaseError(error, 'Failed to fetch members');
  }
}

