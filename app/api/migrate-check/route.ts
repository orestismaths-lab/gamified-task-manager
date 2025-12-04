/**
 * Migration Check API Route
 * Checks if tables exist and marks migrations as applied if they do
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logError } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

// Secret key to protect this endpoint
const MIGRATE_SECRET = process.env.MIGRATE_SECRET || 'change-me-in-production';

/**
 * POST /api/migrate-check
 * Checks if tables exist and marks migrations as applied if they do
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

    logError('Migration Check', { message: 'Checking if tables exist' });

    // Check which tables exist
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
        AND tablename IN ('User', 'Task', 'Subtask', 'TaskAssignment', 'MemberProfile', '_prisma_migrations')
      ORDER BY tablename
    `;

    const existingTables = tables.map(t => t.tablename);
    logError('Migration Check', { message: `Found tables: ${existingTables.join(', ')}` });

    const requiredTables = ['User', 'Task', 'Subtask', 'TaskAssignment'];
    const allRequiredExist = requiredTables.every(table => existingTables.includes(table));
    const memberProfileExists = existingTables.includes('MemberProfile');

    if (!allRequiredExist) {
      return NextResponse.json({
        success: false,
        message: 'Not all required tables exist',
        existingTables,
        requiredTables,
        missingTables: requiredTables.filter(t => !existingTables.includes(t)),
      });
    }

    // Mark migrations as applied if tables exist
    const migrationsToMark: string[] = [];
    
    // Mark init_postgres as applied if all base tables exist
    if (allRequiredExist) {
      const initMigration = await prisma.$queryRaw<Array<{ migration_name: string; finished_at: unknown }>>`
        SELECT migration_name, finished_at 
        FROM "_prisma_migrations" 
        WHERE migration_name = '20251204000000_init_postgres'
      `;
      
      if (initMigration.length === 0 || !initMigration[0].finished_at) {
        await prisma.$executeRaw`
          INSERT INTO "_prisma_migrations" (migration_name, checksum, finished_at, started_at, applied_steps_count)
          VALUES ('20251204000000_init_postgres', '', NOW(), NOW(), 1)
          ON CONFLICT (migration_name) 
          DO UPDATE SET finished_at = NOW(), applied_steps_count = 1
        `;
        migrationsToMark.push('20251204000000_init_postgres');
        logError('Migration Check', { message: 'Marked 20251204000000_init_postgres as applied' });
      }
    }

    // Mark member_profile as applied if MemberProfile table exists
    if (memberProfileExists) {
      const memberMigration = await prisma.$queryRaw<Array<{ migration_name: string; finished_at: unknown }>>`
        SELECT migration_name, finished_at 
        FROM "_prisma_migrations" 
        WHERE migration_name = '20251205000000_add_member_profile'
      `;
      
      if (memberMigration.length === 0 || !memberMigration[0].finished_at) {
        await prisma.$executeRaw`
          INSERT INTO "_prisma_migrations" (migration_name, checksum, finished_at, started_at, applied_steps_count)
          VALUES ('20251205000000_add_member_profile', '', NOW(), NOW(), 1)
          ON CONFLICT (migration_name) 
          DO UPDATE SET finished_at = NOW(), applied_steps_count = 1
        `;
        migrationsToMark.push('20251205000000_add_member_profile');
        logError('Migration Check', { message: 'Marked 20251205000000_add_member_profile as applied' });
      }
    }

    return NextResponse.json({
      success: true,
      message: `All required tables exist. Marked ${migrationsToMark.length} migration(s) as applied.`,
      existingTables,
      migrationsMarked: migrationsToMark,
      allRequiredExist,
      memberProfileExists,
    });
  } catch (error) {
    logError('Migration Check', error);
    return NextResponse.json(
      {
        error: 'Failed to check migrations',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/migrate-check
 * Returns status of tables and migrations
 */
export async function GET() {
  try {
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
        AND tablename IN ('User', 'Task', 'Subtask', 'TaskAssignment', 'MemberProfile', '_prisma_migrations')
      ORDER BY tablename
    `;

    const migrations = await prisma.$queryRaw<Array<{ migration_name: string; finished_at: unknown; rolled_back_at: unknown }>>`
      SELECT migration_name, finished_at, rolled_back_at 
      FROM "_prisma_migrations" 
      WHERE migration_name IN ('20251204000000_init_postgres', '20251205000000_add_member_profile')
      ORDER BY migration_name
    `;

    return NextResponse.json({
      tables: tables.map(t => t.tablename),
      migrations: migrations.map(m => ({
        name: m.migration_name,
        applied: !!m.finished_at,
        rolledBack: !!m.rolled_back_at,
      })),
    });
  } catch (error) {
    logError('Migration Check - GET', error);
    return NextResponse.json(
      {
        error: 'Failed to check status',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

