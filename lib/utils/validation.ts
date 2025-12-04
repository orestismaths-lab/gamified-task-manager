/**
 * Input validation utilities
 */

import { PASSWORD_CONFIG, VALIDATION_CONFIG } from '../constants';

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates password strength
 */
export function isValidPassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < PASSWORD_CONFIG.MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_CONFIG.MIN_LENGTH} characters`);
  }

  if (password.length > PASSWORD_CONFIG.MAX_LENGTH) {
    errors.push(`Password must be less than ${PASSWORD_CONFIG.MAX_LENGTH} characters`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates and sanitizes email
 */
export function sanitizeEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  return isValidEmail(trimmed) ? trimmed : null;
}

/**
 * Validates and sanitizes name
 */
export function sanitizeName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length < VALIDATION_CONFIG.NAME_MIN_LENGTH || trimmed.length > VALIDATION_CONFIG.NAME_MAX_LENGTH) {
    return null;
  }
  return trimmed;
}

/**
 * Validates login request
 */
export function validateLoginRequest(data: unknown): {
  valid: boolean;
  email?: string;
  password?: string;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Invalid request data'] };
  }

  const { email, password } = data as Record<string, unknown>;

  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
  } else {
    const sanitized = sanitizeEmail(email);
    if (!sanitized) {
      errors.push('Invalid email format');
    }
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else if (password.length === 0) {
    errors.push('Password cannot be empty');
  }

  return {
    valid: errors.length === 0,
    email: typeof email === 'string' ? sanitizeEmail(email) || undefined : undefined,
    password: typeof password === 'string' ? password : undefined,
    errors,
  };
}

/**
 * Validates register request
 */
export function validateRegisterRequest(data: unknown): {
  valid: boolean;
  email?: string;
  password?: string;
  name?: string;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Invalid request data'] };
  }

  const { email, password, name } = data as Record<string, unknown>;

  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
  } else {
    const sanitized = sanitizeEmail(email);
    if (!sanitized) {
      errors.push('Invalid email format');
    }
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else {
    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      errors.push(...passwordValidation.errors);
    }
  }

  if (name && typeof name === 'string') {
    const sanitized = sanitizeName(name);
    if (!sanitized) {
      errors.push('Invalid name format');
    }
  }

  return {
    valid: errors.length === 0,
    email: typeof email === 'string' ? sanitizeEmail(email) || undefined : undefined,
    password: typeof password === 'string' ? password : undefined,
    name: typeof name === 'string' ? sanitizeName(name) || undefined : undefined,
    errors,
  };
}

