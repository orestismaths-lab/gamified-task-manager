import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('⚠️ DATABASE_URL environment variable is not set!');
  console.error('Please set DATABASE_URL in Vercel Environment Variables.');
}

// Initialize Prisma with better error handling
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Handle Prisma disconnection on process exit
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

