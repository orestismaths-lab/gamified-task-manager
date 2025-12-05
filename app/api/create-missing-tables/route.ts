/**
 * Create Missing Tables API Route
 * Creates missing tables (Subtask, TaskAssignment) if they don't exist
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logError } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

// Secret key to protect this endpoint
const MIGRATE_SECRET = process.env.MIGRATE_SECRET || 'change-me-in-production';

/**
 * POST /api/create-missing-tables
 * Creates missing tables (Subtask, TaskAssignment) if they don't exist
 */
export async function POST(req: NextRequest) {
  try {
    // Check for secret key
    const authHeader = req.headers.get('authorization');
    let providedSecret = authHeader?.replace('Bearer ', '');
    
    if (!providedSecret) {
      try {
        const body = await req.json();
        providedSecret = body.secret;
      } catch (e) {
        // Body might be empty
      }
    }

    if (!providedSecret || providedSecret !== MIGRATE_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized. Provide MIGRATE_SECRET in Authorization header or body.' },
        { status: 401 }
      );
    }

    logError('Create Missing Tables', { message: 'Checking for missing tables' });

    // Check which tables exist
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
        AND tablename IN ('Subtask', 'TaskAssignment')
      ORDER BY tablename
    `;

    const existingTables = tables.map(t => t.tablename);
    logError('Create Missing Tables', { message: `Found tables: ${existingTables.join(', ') || 'none'}` });

    const created: string[] = [];
    const errors: string[] = [];

    // Create Subtask table if it doesn't exist
    if (!existingTables.includes('Subtask')) {
      try {
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "Subtask" (
            "id" TEXT NOT NULL,
            "title" TEXT NOT NULL,
            "completed" BOOLEAN NOT NULL DEFAULT false,
            "taskId" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "Subtask_pkey" PRIMARY KEY ("id")
          )
        `;

        await prisma.$executeRaw`
          CREATE INDEX IF NOT EXISTS "Subtask_taskId_idx" ON "Subtask"("taskId")
        `;

        await prisma.$executeRaw`
          ALTER TABLE "Subtask" 
          DROP CONSTRAINT IF EXISTS "Subtask_taskId_fkey",
          ADD CONSTRAINT "Subtask_taskId_fkey" 
          FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `;

        created.push('Subtask');
        logError('Create Missing Tables', { message: 'Created Subtask table' });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        errors.push(`Failed to create Subtask: ${errorMsg}`);
        logError('Create Missing Tables', error, { table: 'Subtask' });
      }
    }

    // Create TaskAssignment table if it doesn't exist
    if (!existingTables.includes('TaskAssignment')) {
      try {
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "TaskAssignment" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "taskId" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "TaskAssignment_pkey" PRIMARY KEY ("id")
          )
        `;

        await prisma.$executeRaw`
          CREATE UNIQUE INDEX IF NOT EXISTS "TaskAssignment_userId_taskId_key" 
          ON "TaskAssignment"("userId", "taskId")
        `;

        await prisma.$executeRaw`
          CREATE INDEX IF NOT EXISTS "TaskAssignment_userId_idx" ON "TaskAssignment"("userId")
        `;

        await prisma.$executeRaw`
          CREATE INDEX IF NOT EXISTS "TaskAssignment_taskId_idx" ON "TaskAssignment"("taskId")
        `;

        await prisma.$executeRaw`
          ALTER TABLE "TaskAssignment" 
          DROP CONSTRAINT IF EXISTS "TaskAssignment_userId_fkey",
          ADD CONSTRAINT "TaskAssignment_userId_fkey" 
          FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `;

        await prisma.$executeRaw`
          ALTER TABLE "TaskAssignment" 
          DROP CONSTRAINT IF EXISTS "TaskAssignment_taskId_fkey",
          ADD CONSTRAINT "TaskAssignment_taskId_fkey" 
          FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `;

        created.push('TaskAssignment');
        logError('Create Missing Tables', { message: 'Created TaskAssignment table' });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        errors.push(`Failed to create TaskAssignment: ${errorMsg}`);
        logError('Create Missing Tables', error, { table: 'TaskAssignment' });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${created.length} table(s)`,
      created,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    logError('Create Missing Tables', error);
    return NextResponse.json(
      {
        error: 'Failed to create missing tables',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/create-missing-tables
 * Returns status of tables
 */
export async function GET() {
  try {
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
        AND tablename IN ('Subtask', 'TaskAssignment')
      ORDER BY tablename
    `;

    return NextResponse.json({
      tables: tables.map(t => t.tablename),
      missing: ['Subtask', 'TaskAssignment'].filter(t => !tables.some(tt => tt.tablename === t)),
    });
  } catch (error) {
    logError('Create Missing Tables - GET', error);
    return NextResponse.json(
      {
        error: 'Failed to check table status',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

