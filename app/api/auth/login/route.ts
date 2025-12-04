import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE_NAME = 'task_manager_session';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function POST(req: NextRequest) {
  try {
    const { email, password } = (await req.json()) as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Check DATABASE_URL first
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not set');
      return NextResponse.json(
        { 
          error: 'Database configuration error',
          details: 'DATABASE_URL environment variable is not set. Please configure it in Vercel.'
        },
        { status: 500 }
      );
    }

    // Test Prisma connection first
    try {
      // Try to connect, but don't fail if already connected
      try {
        await prisma.$connect();
      } catch (e: any) {
        // If already connected, ignore the error
        if (!e.message?.includes('already connected')) {
          throw e;
        }
      }
    } catch (connectError: any) {
      console.error('Prisma connection error:', connectError);
      const errorMsg = connectError?.message || 'Unknown connection error';
      const errorCode = connectError?.code || 'UNKNOWN';
      console.error('Full connection error:', {
        message: errorMsg,
        code: errorCode,
        stack: connectError?.stack,
        databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      });
      // Include error message in production for debugging
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          details: `${errorMsg} (Code: ${errorCode})` // Show in production temporarily for debugging
        },
        { status: 500 }
      );
    }

    // Find user
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email },
      });
    } catch (dbError: any) {
      console.error('Database error in login:', dbError);
      const errorMessage = dbError?.message || 'Unknown database error';
      const errorStack = dbError?.stack || '';
      console.error('Full error:', { errorMessage, errorStack, error: dbError });
      // Include error message in production for debugging
      return NextResponse.json(
        { 
          error: `Database error: ${errorMessage}`,
          details: errorMessage // Show in production temporarily for debugging
        },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Create session token
    const sessionToken = crypto.randomUUID();

    // Set cookie
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_DURATION_MS / 1000,
      path: '/',
    });

    // TODO: Store sessionToken in DB for validation (simplified for now)

    return response;
  } catch (err: any) {
    console.error('Login error:', err);
    const errorMessage = err?.message || 'Unknown error';
    const errorStack = err?.stack || '';
    console.error('Error details:', { errorMessage, errorStack, error: err });
    
    // Provide more helpful error message in production
    let userFriendlyError = 'Failed to login';
    if (errorMessage.includes('SQLite') || errorMessage.includes('database') || errorMessage.includes('ENOENT') || errorMessage.includes('Prisma')) {
      userFriendlyError = 'Database connection error. Please try again later.';
    }
    
    return NextResponse.json(
      { 
        error: userFriendlyError,
        details: errorMessage // Show in production temporarily for debugging
      },
      { status: 500 }
    );
  }
}

