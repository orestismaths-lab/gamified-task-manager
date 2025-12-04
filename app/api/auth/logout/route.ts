/**
 * Logout API Route
 * Handles user logout and session termination
 */

import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/utils/session';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/logout
 * Clears the user session
 */
export async function POST(_req: NextRequest): Promise<NextResponse<{ success: boolean }>> {
  const response = NextResponse.json({ success: true });
  clearSessionCookie(response);
  return response;
}

