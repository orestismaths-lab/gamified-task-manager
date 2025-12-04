import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Debug endpoint - runs migration without secret (ONLY FOR DEBUGGING)
// Remove this in production or add proper security
export async function POST() {
  try {
    console.log('🔄 Starting Prisma migration (debug mode)...');

    // Check DATABASE_URL
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'DATABASE_URL is not set' },
        { status: 500 }
      );
    }

    // Skip Prisma generate - it's already done during build
    console.log('📦 Skipping Prisma generate (already done in build)...');

    // Try to create tables directly using Prisma Client
    console.log('🚀 Creating database tables directly...');
    
    try {
      // Check if User table exists
      await prisma.$queryRaw`SELECT 1 FROM "User" LIMIT 1`;
      console.log('✅ Tables already exist');
      
      return NextResponse.json({
        success: true,
        message: 'Tables already exist',
      });
    } catch (e: any) {
      // Table doesn't exist, create it
      console.log('📦 Creating tables...');
    }

    try {
      // Create tables using raw SQL
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "password" TEXT NOT NULL,
          "name" TEXT,
          "avatar" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "User_pkey" PRIMARY KEY ("id")
        );
      `);

      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Task" (
          "id" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "description" TEXT,
          "priority" TEXT NOT NULL DEFAULT 'medium',
          "status" TEXT NOT NULL DEFAULT 'todo',
          "dueDate" TIMESTAMP(3),
          "tags" TEXT NOT NULL DEFAULT '[]',
          "completed" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          "createdById" TEXT NOT NULL,
          CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
        );
      `);

      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Task" ADD CONSTRAINT IF NOT EXISTS "Task_createdById_fkey" 
        FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Subtask" (
          "id" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "completed" BOOLEAN NOT NULL DEFAULT false,
          "taskId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Subtask_pkey" PRIMARY KEY ("id")
        );
      `);

      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Subtask" ADD CONSTRAINT IF NOT EXISTS "Subtask_taskId_fkey" 
        FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "TaskAssignment" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "taskId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "TaskAssignment_pkey" PRIMARY KEY ("id")
        );
      `);

      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "TaskAssignment_userId_taskId_key" 
        ON "TaskAssignment"("userId", "taskId");
      `);

      await prisma.$executeRawUnsafe(`
        ALTER TABLE "TaskAssignment" ADD CONSTRAINT IF NOT EXISTS "TaskAssignment_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);

      await prisma.$executeRawUnsafe(`
        ALTER TABLE "TaskAssignment" ADD CONSTRAINT IF NOT EXISTS "TaskAssignment_taskId_fkey" 
        FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);

      console.log('✅ Tables created successfully!');

      return NextResponse.json({
        success: true,
        message: 'Database tables created successfully',
      });
    } catch (error: any) {
      console.error('❌ Failed to create tables:', error.message);
      return NextResponse.json(
        { 
          error: 'Failed to create tables',
          details: error.message,
          stack: error.stack
        },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error('Migration endpoint error:', err);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: err?.message 
      },
      { status: 500 }
    );
  }
}

