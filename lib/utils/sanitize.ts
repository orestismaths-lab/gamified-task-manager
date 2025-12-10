/**
 * Input sanitization utilities for XSS prevention
 */

/**
 * Sanitizes text input by removing potentially dangerous HTML characters
 * This is a basic sanitization - React also auto-escapes, but this adds an extra layer
 */
export function sanitizeText(text: string): string {
  if (typeof text !== 'string') {
    return '';
  }
  
  // Remove HTML tags and dangerous characters
  return text
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .trim();
}

/**
 * Sanitizes HTML content (for descriptions that might contain formatting)
 * More permissive than sanitizeText but still removes dangerous content
 * Does NOT trim - trimming should be done by the caller if needed
 */
export function sanitizeHTML(html: string): string {
  if (typeof html !== 'string') {
    return '';
  }
  
  // Remove script tags and event handlers
  // Preserve all spaces including multiple spaces
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '');
}

/**
 * Sanitizes array of strings (for tags)
 */
export function sanitizeStringArray(arr: unknown[]): string[] {
  if (!Array.isArray(arr)) {
    return [];
  }
  
  return arr
    .filter((item): item is string => typeof item === 'string')
    .map(item => sanitizeText(item))
    .filter(item => item.length > 0)
    .slice(0, 50); // Limit to 50 tags max
}

/**
 * Validates and sanitizes task title
 */
export function sanitizeTaskTitle(title: unknown): string | null {
  if (typeof title !== 'string') {
    return null;
  }
  
  const sanitized = sanitizeText(title);
  
  if (sanitized.length === 0) {
    return null;
  }
  
  if (sanitized.length > 500) {
    return null; // Will be caught by validation
  }
  
  return sanitized;
}

/**
 * Validates and sanitizes task description
 * Preserves spaces within the text, only trims leading/trailing whitespace
 */
export function sanitizeTaskDescription(description: unknown): string | null {
  if (description === null || description === undefined) {
    return null;
  }
  
  if (typeof description !== 'string') {
    return null;
  }
  
  // First sanitize to remove dangerous content, preserving all spaces
  let sanitized = sanitizeHTML(description);
  
  // Only trim leading/trailing whitespace after sanitization
  sanitized = sanitized.trim();
  
  if (sanitized.length === 0) {
    return null;
  }
  
  if (sanitized.length > 5000) {
    return null; // Will be caught by validation
  }
  
  return sanitized;
}

