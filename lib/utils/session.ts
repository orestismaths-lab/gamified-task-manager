/**
 * Session management utilities
 */

import { NextResponse } from 'next/server';
import type { SessionData } from '../types/auth';

export const SESSION_COOKIE_NAME = 'task_manager_session';
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

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
 * Generates a secure session token
 */
export function generateSessionToken(): string {
  return crypto.randomUUID();
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

