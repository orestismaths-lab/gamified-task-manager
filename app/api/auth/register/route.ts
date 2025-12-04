import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE_NAME = 'task_manager_session';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = (await req.json()) as {
      email?: string;
      password?: string;
      name?: string;
    };

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Test Prisma connection first
    try {
      await prisma.$connect();
    } catch (connectError: any) {
      console.error('Prisma connection error:', connectError);
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          details: process.env.NODE_ENV === 'development' ? connectError?.message : undefined
        },
        { status: 500 }
      );
    }

    // Check if user already exists
    let existingUser;
    try {
      existingUser = await prisma.user.findUnique({
        where: { email },
      });
    } catch (dbError: any) {
      console.error('Database error in register (check existing):', dbError);
      const errorMessage = dbError?.message || 'Unknown database error';
      const errorStack = dbError?.stack || '';
      console.error('Full error:', { errorMessage, errorStack, error: dbError });
      return NextResponse.json(
        { 
          error: `Database error: ${errorMessage}`,
          details: process.env.NODE_ENV === 'development' ? errorStack : undefined
        },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    let user;
    try {
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || email.split('@')[0],
        },
      });
    } catch (dbError: any) {
      console.error('Database error in register (create user):', dbError);
      const errorMessage = dbError?.message || 'Unknown database error';
      const errorStack = dbError?.stack || '';
      console.error('Full error:', { errorMessage, errorStack, error: dbError });
      
      // Check if it's a unique constraint violation
      if (errorMessage.includes('Unique constraint') || errorMessage.includes('UNIQUE constraint')) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { 
          error: `Database error: ${errorMessage}`,
          details: process.env.NODE_ENV === 'development' ? errorStack : undefined
        },
        { status: 500 }
      );
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
    console.error('Register error:', err);
    const errorMessage = err?.message || 'Unknown error';
    const errorStack = err?.stack || '';
    console.error('Error details:', { errorMessage, errorStack, error: err });
    
    // Provide more helpful error message in production
    let userFriendlyError = 'Failed to register user';
    if (errorMessage.includes('SQLite') || errorMessage.includes('database') || errorMessage.includes('ENOENT')) {
      userFriendlyError = 'Database connection error. Please try again later.';
    }
    
    return NextResponse.json(
      { 
        error: userFriendlyError,
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

