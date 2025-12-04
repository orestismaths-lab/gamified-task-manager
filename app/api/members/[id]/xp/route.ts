/**
 * XP Management API Route
 * POST /api/members/[id]/xp
 * Updates member XP and level in database
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleDatabaseError, handleValidationError, logError } from '@/lib/utils/errors';
import { getSessionUser } from '@/lib/utils/session';
import type { UserPublic } from '@/lib/types/auth';
import { Member, calculateLevel } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/members/[id]/xp
 * Adds or removes XP for a member
 * Body: { amount: number } (positive to add, negative to remove)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<{ member: Member; wasLevelUp: boolean } | { error: string; details?: string }>> {
  try {
    const user: UserPublic | null = await getSessionUser(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return handleValidationError(['Invalid request body']);
    }

    const { amount } = body as { amount?: number };

    if (typeof amount !== 'number') {
      return handleValidationError(['XP amount must be a number']);
    }

    // Get or create member profile
    let memberProfile = await prisma.memberProfile.findUnique({
      where: { userId: params.id },
    });

    if (!memberProfile) {
      // Create member profile if it doesn't exist
      memberProfile = await prisma.memberProfile.create({
        data: {
          userId: params.id,
          xp: 0,
          level: 1,
        },
      });
    }

    // Calculate new XP and level
    const oldLevel = memberProfile.level;
    const newXP = Math.max(0, memberProfile.xp + amount);
    const newLevel = calculateLevel(newXP);
    const wasLevelUp = newLevel > oldLevel;

    // Update member profile
    const updatedProfile = await prisma.memberProfile.update({
      where: { userId: params.id },
      data: {
        xp: newXP,
        level: newLevel,
      },
    });

    // Get user data
    const memberUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
      },
    });

    if (!memberUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const member: Member = {
      id: memberUser.id,
      name: memberUser.name || memberUser.email.split('@')[0] || 'User',
      email: memberUser.email,
      userId: memberUser.id,
      avatar: memberUser.avatar || undefined,
      xp: updatedProfile.xp,
      level: updatedProfile.level,
    };

    return NextResponse.json({ member, wasLevelUp });
  } catch (error) {
    logError('Members API - XP update', error);
    return handleDatabaseError(error, 'Failed to update XP');
  }
}

