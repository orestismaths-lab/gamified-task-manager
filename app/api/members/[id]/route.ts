/**
 * Member CRUD operations API Route
 * GET, PUT, DELETE /api/members/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleDatabaseError, handleValidationError, logError } from '@/lib/utils/errors';
import { getSessionUser } from '@/lib/utils/session';
import type { UserPublic } from '@/lib/types/auth';
import { Member } from '@/types';
import { calculateLevel } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/members/[id]
 * Returns a single member by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<{ member: Member } | { error: string; details?: string }>> {
  try {
    const user: UserPublic | null = await getSessionUser(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const memberUser = await prisma.user.findUnique({
      where: { id: params.id },
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

    if (!memberUser) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const member: Member = {
      id: memberUser.id,
      name: memberUser.name || memberUser.email.split('@')[0] || 'User',
      email: memberUser.email,
      userId: memberUser.id,
      avatar: memberUser.avatar || undefined,
      xp: memberUser.memberProfile?.xp ?? 0,
      level: memberUser.memberProfile?.level ?? 1,
    };

    return NextResponse.json({ member });
  } catch (error) {
    logError('Members API - GET by ID', error);
    return handleDatabaseError(error, 'Failed to fetch member');
  }
}

/**
 * PUT /api/members/[id]
 * Updates a member (name, avatar)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<{ member: Member } | { error: string; details?: string }>> {
  try {
    const user: UserPublic | null = await getSessionUser(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow users to update their own profile
    if (params.id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to update this member' }, { status: 403 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return handleValidationError(['Invalid request body']);
    }

    const { name, avatar } = body as {
      name?: string;
      avatar?: string;
    };

    const updateData: { name?: string; avatar?: string | null } = {};
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return handleValidationError(['Member name cannot be empty']);
      }
      updateData.name = name.trim();
    }
    if (avatar !== undefined) {
      updateData.avatar = avatar || null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
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

    const member: Member = {
      id: updatedUser.id,
      name: updatedUser.name || updatedUser.email.split('@')[0] || 'User',
      email: updatedUser.email,
      userId: updatedUser.id,
      avatar: updatedUser.avatar || undefined,
      xp: updatedUser.memberProfile?.xp ?? 0,
      level: updatedUser.memberProfile?.level ?? 1,
    };

    return NextResponse.json({ member });
  } catch (error) {
    logError('Members API - PUT', error);
    return handleDatabaseError(error, 'Failed to update member');
  }
}

