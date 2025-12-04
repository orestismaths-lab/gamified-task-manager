import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';

export const dynamic = 'force-dynamic';

// Secret key to protect this endpoint
// Set MIGRATE_SECRET in Vercel Environment Variables
const MIGRATE_SECRET = process.env.MIGRATE_SECRET || 'change-me-in-production';

export async function POST(req: NextRequest) {
  try {
    // Check for secret key
    const authHeader = req.headers.get('authorization');
    let providedSecret = authHeader?.replace('Bearer ', '');
    
    // If not in header, try to get from body
    if (!providedSecret) {
      try {
        const body = await req.json();
        providedSecret = body.secret;
      } catch (e) {
        // Body might be empty or invalid JSON
      }
    }

    if (!providedSecret || providedSecret !== MIGRATE_SECRET) {
      console.error('Migration auth failed:', {
        provided: providedSecret ? '***' : 'none',
        expected: MIGRATE_SECRET ? '***' : 'not set',
        hasAuthHeader: !!authHeader,
      });
      return NextResponse.json(
        { 
          error: 'Unauthorized. Provide MIGRATE_SECRET in Authorization header or body.',
          hint: 'Check that MIGRATE_SECRET environment variable is set in Vercel and matches the secret you provide.'
        },
        { status: 401 }
      );
    }

    console.log('🔄 Starting Prisma migration...');

    // Generate Prisma Client
    console.log('📦 Generating Prisma Client...');
    try {
      execSync('npx prisma generate', { 
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL || '' }
      });
    } catch (error: any) {
      console.error('❌ Prisma generate failed:', error.message);
      return NextResponse.json(
        { 
          error: 'Prisma generate failed',
          details: error.message 
        },
        { status: 500 }
      );
    }

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
      
      // If error is about failed migrations, provide resolution steps
      if (errorOutput.includes('P3009') || errorOutput.includes('failed migrations')) {
        return NextResponse.json(
          { 
            error: 'Migration failed due to previous failed migration',
            details: errorOutput,
            resolution: 'The migration endpoint will try to resolve this automatically. Call it again, or manually run: npx prisma migrate resolve --rolled-back 20251203154938_init'
          },
          { status: 500 }
        );
      }
      
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

// GET endpoint for status check
export async function GET() {
  return NextResponse.json({
    message: 'Migration endpoint is ready. Use POST with MIGRATE_SECRET.',
    hint: 'Set MIGRATE_SECRET in Vercel Environment Variables and call: POST /api/migrate with Authorization: Bearer <secret>'
  });
}

