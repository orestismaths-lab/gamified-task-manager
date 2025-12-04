/**
 * Login API Route
 * Handles user authentication and session creation
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { validateLoginRequest } from '@/lib/utils/validation';
import { handleAuthError, handleDatabaseError, handleValidationError, logError } from '@/lib/utils/errors';
import { generateSessionToken, setSessionCookie } from '@/lib/utils/session';
import type { AuthResponse } from '@/lib/types/auth';

// Remove unused import warning
const _unused = null;

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/login
 * Authenticates a user and creates a session
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

    const validation = validateLoginRequest(body);
    if (!validation.valid || !validation.email || !validation.password) {
      return handleValidationError(validation.errors);
    }

    const { email, password } = validation;

    // Check database configuration
    if (!process.env.DATABASE_URL) {
      logError('Login', new Error('DATABASE_URL not set'));
      return NextResponse.json(
        {
          error: 'Database configuration error',
          details: 'DATABASE_URL environment variable is not set. Please configure it in Vercel.',
        },
        { status: 500 }
      );
    }

    // Find user
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          name: true,
        },
      });
    } catch (error) {
      logError('Login - Database query', error, { email });
      return handleDatabaseError(error);
    }

    // Verify user exists
    if (!user) {
      // Use generic message to prevent user enumeration
      return handleAuthError('Invalid email or password');
    }

    // Verify password
    let isValid: boolean;
    try {
      isValid = await bcrypt.compare(password, user.password);
    } catch (error) {
      logError('Login - Password comparison', error);
      return handleAuthError('Invalid email or password');
    }

    if (!isValid) {
      return handleAuthError('Invalid email or password');
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
    logError('Login - Unexpected error', error);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
      },
      { status: 500 }
    );
  }
}

