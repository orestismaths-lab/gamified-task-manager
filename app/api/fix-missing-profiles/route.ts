/**
 * API endpoint to create MemberProfile for users without one
 * GET /api/fix-missing-profiles
 * Creates MemberProfile with default XP=0, Level=1 for users missing it
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/utils/session';
import { handleDatabaseError, logError } from '@/lib/utils/errors';
import type { UserPublic } from '@/lib/types/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/fix-missing-profiles
 * Creates MemberProfile for users that don't have one
 * Requires authentication (admin check can be added later)
 */
export async function GET(req: NextRequest): Promise<NextResponse<{
  success: boolean;
  message: string;
  created: number;
  totalUsers: number;
  usersWithoutProfile: Array<{ email: string; name: string | null }>;
} | { error: string; details?: string }>> {
  try {
    const user: UserPublic | null = await getSessionUser(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find all users
    const allUsers = await prisma.user.findMany({
      include: {
        memberProfile: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        memberProfile: {
          select: {
            id: true,
          },
        },
      },
    });

    // Find users without MemberProfile
    const usersWithoutProfile = allUsers.filter(u => !u.memberProfile);

    if (usersWithoutProfile.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All users have MemberProfile',
        created: 0,
        totalUsers: allUsers.length,
        usersWithoutProfile: [],
      });
    }

    // Create MemberProfile for each user without one
    let created = 0;
    const createdFor: Array<{ email: string; name: string | null }> = [];

    for (const userWithoutProfile of usersWithoutProfile) {
      try {
        await prisma.memberProfile.create({
          data: {
            userId: userWithoutProfile.id,
            xp: 0,
            level: 1,
          },
        });
        created++;
        createdFor.push({
          email: userWithoutProfile.email,
          name: userWithoutProfile.name,
        });
        logError('[fix-missing-profiles] Created MemberProfile', {
          userId: userWithoutProfile.id,
          email: userWithoutProfile.email,
        });
      } catch (error) {
        logError('[fix-missing-profiles] Failed to create MemberProfile', error, {
          userId: userWithoutProfile.id,
          email: userWithoutProfile.email,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${created} MemberProfile(s) for users without one`,
      created,
      totalUsers: allUsers.length,
      usersWithoutProfile: usersWithoutProfile.map(u => ({
        email: u.email,
        name: u.name,
      })),
    });
  } catch (error) {
    logError('Fix Missing Profiles API', error);
    return handleDatabaseError(error, 'Failed to fix missing profiles');
  }
}

