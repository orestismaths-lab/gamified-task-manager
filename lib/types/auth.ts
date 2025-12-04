/**
 * Authentication-related types and interfaces
 */

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPublic {
  id: string;
  email: string;
  name: string | null;
  avatar?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  user: UserPublic;
}

export interface ErrorResponse {
  error: string;
  details?: string;
  code?: string;
}

export interface SessionData {
  userId: string;
  email: string;
  name: string | null;
  token: string;
  expiresAt: Date;
}

