/**
 * Register API Route
 * Handles user registration and session creation
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { validateRegisterRequest } from '@/lib/utils/validation';
import { handleDatabaseError, handleValidationError, logError } from '@/lib/utils/errors';
import { generateSessionToken, setSessionCookie } from '@/lib/utils/session';
import { PASSWORD_CONFIG } from '@/lib/constants';
import type { AuthResponse } from '@/lib/types/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/register
 * Creates a new user account and session
 */
export async function POST(req: NextRequest): Promise<NextResponse<AuthResponse | { error: string; details?: string }>> {
  try {
    // Parse and validate request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return handleValidationError(['Invalid request body']);
    }

    const validation = validateRegisterRequest(body);
    if (!validation.valid || !validation.email || !validation.password) {
      return handleValidationError(validation.errors);
    }

    const { email, password, name } = validation;

    // Check if user already exists
    let existingUser;
    try {
      existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });
    } catch (error) {
      logError('Register - Check existing user', error, { email });
      return handleDatabaseError(error);
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    let hashedPassword: string;
    try {
      hashedPassword = await bcrypt.hash(password, PASSWORD_CONFIG.BCRYPT_ROUNDS);
    } catch (error) {
      logError('Register - Password hashing', error);
      return NextResponse.json(
        { error: 'Failed to process password' },
        { status: 500 }
      );
    }

    // Create user
    let user;
    try {
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || email.split('@')[0] || 'User',
          // Automatically create MemberProfile for new users
          memberProfile: {
            create: {
              xp: 0,
              level: 1,
            },
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });
      logError('Register - Created user with MemberProfile', { userId: user.id, email: user.email });
    } catch (error) {
      logError('Register - Create user', error, { email });

      // Check if it's a unique constraint violation
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes('Unique constraint') ||
        errorMessage.includes('UNIQUE constraint') ||
        errorMessage.includes('UniqueViolation')
      ) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        );
      }

      return handleDatabaseError(error);
    }

    // Create session with encoded userId
    const sessionToken = generateSessionToken(user.id);
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    } satisfies AuthResponse);

    setSessionCookie(response, sessionToken);

    // TODO: Store sessionToken in DB for validation (simplified for now)

    return response;
  } catch (error) {
    logError('Register - Unexpected error', error);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
      },
      { status: 500 }
    );
  }
}

