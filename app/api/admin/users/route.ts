/**
 * Admin Users API Route
 * Handles user management operations (list, password reset, delete)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { handleDatabaseError, handleValidationError, logError } from '@/lib/utils/errors';
import { isValidPassword } from '@/lib/utils/validation';
import { PASSWORD_CONFIG } from '@/lib/constants';

export const dynamic = 'force-dynamic';

interface UserPublic {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
}

/**
 * GET /api/admin/users
 * Returns a list of all users
 */
export async function GET(): Promise<NextResponse<{ users: UserPublic[] } | { error: string }>> {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    logError('Admin Users - GET', error);
    return handleDatabaseError(error);
  }
}

/**
 * POST /api/admin/users
 * Resets a user's password
 */
export async function POST(req: NextRequest): Promise<NextResponse<{ success: boolean } | { error: string; details?: string }>> {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return handleValidationError(['Invalid request body']);
    }

    const { userId, newPassword } = body as {
      userId?: unknown;
      newPassword?: unknown;
    };

    if (!userId || typeof userId !== 'string') {
      return handleValidationError(['User ID is required']);
    }

    if (!newPassword || typeof newPassword !== 'string') {
      return handleValidationError(['New password is required']);
    }

    const passwordValidation = isValidPassword(newPassword);
    if (!passwordValidation.valid) {
      return handleValidationError(passwordValidation.errors);
    }

    const hash = await bcrypt.hash(newPassword, PASSWORD_CONFIG.BCRYPT_ROUNDS);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hash,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError('Admin Users - POST (Password Reset)', error);
    return handleDatabaseError(error);
  }
}

/**
 * DELETE /api/admin/users
 * Deletes a user and all associated data
 */
export async function DELETE(req: NextRequest): Promise<NextResponse<{ success: boolean } | { error: string; details?: string }>> {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return handleValidationError(['Invalid request body']);
    }

    const { userId } = body as { userId?: unknown };

    if (!userId || typeof userId !== 'string') {
      return handleValidationError(['User ID is required']);
    }

    // Delete related data in transaction
    await prisma.$transaction([
      prisma.taskAssignment.deleteMany({
        where: { userId },
      }),
      prisma.task.deleteMany({
        where: { createdById: userId },
      }),
      prisma.user.delete({
        where: { id: userId },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    logError('Admin Users - DELETE', error);
    return handleDatabaseError(error);
  }
}


