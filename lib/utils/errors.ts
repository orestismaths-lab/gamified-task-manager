/**
 * Error handling utilities
 */

import { NextResponse } from 'next/server';
import type { ErrorResponse } from '../types/auth';

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  error: string,
  status: number,
  details?: string,
  code?: string
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      error,
      ...(details && { details }),
      ...(code && { code }),
    },
    { status }
  );
}

/**
 * Handles database errors and returns appropriate response
 */
export function handleDatabaseError(error: unknown): NextResponse<ErrorResponse> {
  const isDev = process.env.NODE_ENV === 'development';
  const errorMessage = error instanceof Error ? error.message : 'Unknown database error';

  // Don't expose internal errors in production
  if (!isDev) {
    return createErrorResponse(
      'Database operation failed',
      500
    );
  }

  return createErrorResponse(
    'Database error',
    500,
    errorMessage
  );
}

/**
 * Handles authentication errors
 */
export function handleAuthError(error: string, status: number = 401): NextResponse<ErrorResponse> {
  return createErrorResponse(error, status);
}

/**
 * Handles validation errors
 */
export function handleValidationError(errors: string[]): NextResponse<ErrorResponse> {
  return createErrorResponse(
    'Validation failed',
    400,
    errors.join(', ')
  );
}

/**
 * Logs error with context
 */
export function logError(context: string, error: unknown, additionalData?: Record<string, unknown>): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  console.error(`[${context}] Error:`, {
    message: errorMessage,
    stack: errorStack,
    ...additionalData,
  });
}

