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
 * Returns a list of all users formatted as members for task assignment
 */
export async function GET(): Promise<NextResponse<{ members: Member[] } | { error: string; details?: string }>> {
  try {
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
    const members: Member[] = users.map((user) => ({
      id: user.id,
      name: user.name || user.email.split('@')[0] || 'User',
      email: user.email,
      userId: user.id,
      avatar: user.avatar || undefined,
      xp: 0, // Default XP for new members
      level: 1, // Default level
    }));

    return NextResponse.json({ members });
  } catch (error) {
    logError('Members API - GET', error);
    return handleDatabaseError(error, 'Failed to fetch members');
  }
}

