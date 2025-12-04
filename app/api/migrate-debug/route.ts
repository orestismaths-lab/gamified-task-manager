import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

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

    // Check for failed migrations first
    console.log('🔍 Checking for failed migrations...');
    try {
      const statusOutput = execSync('npx prisma migrate status', {
        encoding: 'utf-8',
        env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL || '' }
      });
      console.log('Migration status:', statusOutput);
      
      // If there are failed migrations, resolve them
      if (statusOutput.includes('failed') || statusOutput.includes('Failed')) {
        console.log('⚠️ Found failed migrations, resolving...');
        try {
          // Mark failed migration as rolled back
          execSync('npx prisma migrate resolve --rolled-back 20251203154938_init', {
            encoding: 'utf-8',
            env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL || '' }
          });
          console.log('✅ Resolved failed migration');
        } catch (resolveError: any) {
          console.log('⚠️ Could not resolve migration, trying to continue...');
          // Try to mark as applied if rolled back doesn't work
          try {
            execSync('npx prisma migrate resolve --applied 20251203154938_init', {
              encoding: 'utf-8',
              env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL || '' }
            });
            console.log('✅ Marked failed migration as applied');
          } catch (e) {
            console.log('⚠️ Could not resolve, will try to deploy anyway...');
          }
        }
      }
    } catch (statusError) {
      console.log('⚠️ Could not check migration status, continuing...');
    }

    // Run migrations
    console.log('🚀 Deploying migrations...');
    try {
      const output = execSync('npx prisma migrate deploy', {
        encoding: 'utf-8',
        env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL || '' }
      });
      
      console.log('✅ Migration completed successfully!');
      console.log('Migration output:', output);

      return NextResponse.json({
        success: true,
        message: 'Migrations deployed successfully',
        output: output
      });
    } catch (error: any) {
      console.error('❌ Migration failed:', error.message);
      const errorOutput = error.stdout || error.stderr || error.message;
      
      return NextResponse.json(
        { 
          error: 'Migration failed',
          details: error.message,
          output: errorOutput
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

