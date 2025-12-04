/**
 * Session management utilities
 */

import { NextResponse } from 'next/server';
import { SESSION_CONFIG } from '../constants';
import type { SessionData } from '../types/auth';

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

