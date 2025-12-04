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
export function handleDatabaseError(error: unknown, defaultMessage?: string): NextResponse<ErrorResponse> {
  const isDev = process.env.NODE_ENV === 'development';
  const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
  const errorStack = error instanceof Error ? error.stack : undefined;
  const message = defaultMessage || 'Database operation failed';

  // Always log full error details (even in production) for debugging
  console.error('[handleDatabaseError] Full error details:', {
    message: errorMessage,
    stack: errorStack,
    error,
    isDev,
  });

  // Don't expose internal errors in production
  if (!isDev) {
    return createErrorResponse(
      message,
      500
    );
  }

  return createErrorResponse(
    message,
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
 * Can also be used for general logging (pass data object as second param)
 */
export function logError(context: string, error: unknown, additionalData?: Record<string, unknown>): void {
  // If error is a plain object (used for logging), treat it as data
  if (error && typeof error === 'object' && !(error instanceof Error)) {
    console.log(`[${context}]`, {
      ...(error as Record<string, unknown>),
      ...additionalData,
    });
    return;
  }

  // Otherwise, treat as error
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  console.error(`[${context}] Error:`, {
    message: errorMessage,
    stack: errorStack,
    ...additionalData,
  });
}

