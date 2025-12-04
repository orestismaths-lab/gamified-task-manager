import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const SESSION_COOKIE_NAME = 'task_manager_session';

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get(SESSION_COOKIE_NAME);

    if (!sessionToken || !sessionToken.value) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // TODO: Validate sessionToken from DB (simplified for now - just check cookie exists)
    // For now, we'll need to pass userId in a different way or store sessions in DB
    // This is a simplified version - in production, store sessions in DB

    return NextResponse.json({ user: null }, { status: 200 });
  } catch (err) {
    console.error('Auth check error:', err);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}

