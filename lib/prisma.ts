/**
 * Prisma Client Singleton
 * Ensures a single instance of PrismaClient across the application
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Validate DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('⚠️ DATABASE_URL environment variable is not set!');
  console.error('Please set DATABASE_URL in Vercel Environment Variables.');
}

/**
 * Prisma Client instance
 * Reuses the same instance in development to prevent connection pool exhaustion
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  });

// In development, reuse the same instance
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
if (typeof process !== 'undefined') {
  const gracefulShutdown = async () => {
    await prisma.$disconnect();
  };

  process.on('beforeExit', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
}

