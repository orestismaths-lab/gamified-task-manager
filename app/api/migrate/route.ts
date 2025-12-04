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
    const providedSecret = authHeader?.replace('Bearer ', '') || 
                          (await req.json()).then((body: any) => body.secret).catch(() => null);

    if (providedSecret !== MIGRATE_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized. Provide MIGRATE_SECRET in Authorization header or body.' },
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
      return NextResponse.json(
        { 
          error: 'Migration failed',
          details: error.message,
          output: error.stdout || error.stderr
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

