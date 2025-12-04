/**
 * Auth Status API Route
 * Returns the current authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SESSION_COOKIE_NAME, decodeSessionToken } from '@/lib/utils/session';
import { logError } from '@/lib/utils/errors';
import type { UserPublic } from '@/lib/types/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/me
 * Returns the current authenticated user from session cookie
 */
export async function GET(req: NextRequest): Promise<NextResponse<{ user: UserPublic | null }>> {
  try {
    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME);
    
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Decode userId from session token
    const userId = decodeSessionToken(sessionCookie.value);
    
    if (!userId) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
      },
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    logError('Auth me - Error', error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}

