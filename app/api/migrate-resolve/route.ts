/**
 * Migration Resolve API Route
 * Resolves failed migrations in the database
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logError } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

// Secret key to protect this endpoint
const MIGRATE_SECRET = process.env.MIGRATE_SECRET || 'change-me-in-production';

/**
 * POST /api/migrate-resolve
 * Resolves failed migrations by marking them as rolled-back or applied
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

    logError('Migration Resolve', { message: 'Starting to resolve failed migrations' });

    // Get failed migrations from _prisma_migrations table
    const failedMigrations = await prisma.$queryRaw<Array<{ migration_name: string; finished_at: unknown; rolled_back_at: unknown }>>`
      SELECT migration_name, finished_at, rolled_back_at 
      FROM "_prisma_migrations" 
      WHERE finished_at IS NULL AND rolled_back_at IS NULL
    `;

    logError('Migration Resolve', { message: `Found ${failedMigrations.length} failed migrations`, migrations: failedMigrations });

    if (failedMigrations.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No failed migrations found',
      });
    }

    // Mark all failed migrations as rolled-back
    const resolved: string[] = [];
    for (const migration of failedMigrations) {
      try {
        await prisma.$executeRaw`
          UPDATE "_prisma_migrations" 
          SET rolled_back_at = NOW() 
          WHERE migration_name = ${migration.migration_name} 
            AND finished_at IS NULL 
            AND rolled_back_at IS NULL
        `;
        resolved.push(migration.migration_name);
        logError('Migration Resolve', { message: `Resolved migration: ${migration.migration_name}` });
      } catch (error) {
        logError('Migration Resolve', error, { migration: migration.migration_name });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Resolved ${resolved.length} failed migration(s)`,
      resolved,
    });
  } catch (error) {
    logError('Migration Resolve', error);
    return NextResponse.json(
      {
        error: 'Failed to resolve migrations',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/migrate-resolve
 * Returns status of failed migrations
 */
export async function GET() {
  try {
    const failedMigrations = await prisma.$queryRaw<Array<{ migration_name: string; started_at: unknown }>>`
      SELECT migration_name, started_at 
      FROM "_prisma_migrations" 
      WHERE finished_at IS NULL AND rolled_back_at IS NULL
    `;

    return NextResponse.json({
      failedMigrations: failedMigrations.length,
      migrations: failedMigrations.map(m => ({
        name: m.migration_name,
        startedAt: m.started_at,
      })),
    });
  } catch (error) {
    logError('Migration Resolve - GET', error);
    return NextResponse.json(
      {
        error: 'Failed to check migration status',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

