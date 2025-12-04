/**
 * Health Check API Route
 * Tests database connectivity and basic functionality
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logError } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health
 * Returns health status of the application and database
 */
export async function GET() {
  try {
    logError('Health Check', { message: 'Starting health check' });

    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    // Test basic query
    const userCount = await prisma.user.count();

    logError('Health Check', { 
      message: 'Health check passed',
      userCount,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
    });

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      userCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logError('Health Check', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

