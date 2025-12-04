/**
 * Session management utilities
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../prisma';
import { SESSION_CONFIG } from '../constants';
import type { SessionData, UserPublic } from '../types/auth';

export const SESSION_COOKIE_NAME = SESSION_CONFIG.COOKIE_NAME;
export const SESSION_DURATION_MS = SESSION_CONFIG.DURATION_MS;

/**
 * Creates a secure session cookie
 */
export function createSessionCookie(token: string): void {
  // Cookie is set via NextResponse.cookies.set() in the route handler
  // This is just a utility for cookie configuration
}

/**
 * Gets session cookie configuration
 */
export function getSessionCookieConfig() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: SESSION_CONFIG.DURATION_SECONDS,
    path: '/',
  };
}

/**
 * Generates a secure session token with encoded userId
 * Format: base64(userId:timestamp:random)
 */
export function generateSessionToken(userId: string): string {
  const timestamp = Date.now();
  const random = crypto.randomUUID();
  const tokenData = `${userId}:${timestamp}:${random}`;
  return Buffer.from(tokenData).toString('base64');
}

/**
 * Decodes session token to get userId
 */
export function decodeSessionToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userId] = decoded.split(':');
    return userId || null;
  } catch {
    return null;
  }
}

/**
 * Sets session cookie on response
 */
export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieConfig());
}

/**
 * Clears session cookie
 */
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    ...getSessionCookieConfig(),
    maxAge: 0,
  });
}

/**
 * Retrieves the authenticated user from the session cookie.
 * Reads the session cookie and decodes the userId, then fetches user from DB.
 */
export async function getSessionUser(req: NextRequest): Promise<UserPublic | null> {
  try {
    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME);
    
    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }

    // Decode userId from session token
    const userId = decodeSessionToken(sessionCookie.value);
    
    if (!userId) {
      return null;
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

    return user;
  } catch (error) {
    console.error('getSessionUser error:', error);
    return null;
  }
}

