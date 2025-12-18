/**
 * Health Check API Route
 * Checks database connectivity and returns diagnostic information
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  environment: string;
  database: {
    connected: boolean;
    latencyMs: number | null;
    error: string | null;
    url: string | null; // Masked URL for debugging
  };
  counts?: {
    users: number;
    tasks: number;
    members: number;
  };
  env: {
    DATABASE_URL: boolean;
    NODE_ENV: string;
  };
}

/**
 * GET /api/health
 * Returns health status of the application and database
 */
export async function GET(): Promise<NextResponse<HealthCheckResult>> {
  const startTime = Date.now();
  
  console.log('[Health Check] Starting health check...');
  console.log('[Health Check] NODE_ENV:', process.env.NODE_ENV);
  console.log('[Health Check] DATABASE_URL exists:', !!process.env.DATABASE_URL);
  
  // Mask the DATABASE_URL for security (show only host)
  let maskedUrl: string | null = null;
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      maskedUrl = `${url.protocol}//*****@${url.host}${url.pathname}`;
      console.log('[Health Check] Database host:', url.host);
    } catch (e) {
      maskedUrl = 'Invalid URL format';
      console.error('[Health Check] Invalid DATABASE_URL format:', e);
    }
  }

  const result: HealthCheckResult = {
    status: 'unhealthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    database: {
      connected: false,
      latencyMs: null,
      error: null,
      url: maskedUrl,
    },
    env: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NODE_ENV: process.env.NODE_ENV || 'unknown',
    },
  };

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    result.database.error = 'DATABASE_URL environment variable is not set';
    console.error('[Health Check] DATABASE_URL is not set!');
    return NextResponse.json(result, { status: 503 });
  }

  // Test database connection
  try {
    console.log('[Health Check] Testing database connection...');
    const dbStartTime = Date.now();
    
    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1 as test`;
    
    const latency = Date.now() - dbStartTime;
    result.database.connected = true;
    result.database.latencyMs = latency;
    console.log('[Health Check] Database connected! Latency:', latency, 'ms');

    // Get counts
    try {
      console.log('[Health Check] Fetching counts...');
      const [userCount, taskCount, memberCount] = await Promise.all([
        prisma.user.count(),
        prisma.task.count(),
        prisma.memberProfile.count(),
      ]);
      
      result.counts = {
        users: userCount,
        tasks: taskCount,
        members: memberCount,
      };
      console.log('[Health Check] Counts:', result.counts);
    } catch (countError) {
      console.error('[Health Check] Error fetching counts:', countError);
      // Don't fail the health check for count errors
      result.status = 'degraded';
    }

    result.status = result.status === 'degraded' ? 'degraded' : 'healthy';
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    result.database.error = errorMessage;
    result.database.latencyMs = Date.now() - startTime;
    
    console.error('[Health Check] Database connection FAILED!');
    console.error('[Health Check] Error:', errorMessage);
    
    if (error instanceof Error && error.stack) {
      console.error('[Health Check] Stack:', error.stack);
    }
    
    return NextResponse.json(result, { status: 503 });
  }

  const totalTime = Date.now() - startTime;
  console.log('[Health Check] Complete! Total time:', totalTime, 'ms');
  
  return NextResponse.json(result);
}
