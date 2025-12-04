import { NextRequest } from 'next/server';
import { prisma } from './prisma';

const SESSION_COOKIE_NAME = 'task_manager_session';

// TODO: Store sessions in DB for proper validation
// For now, simplified - just check cookie exists
export async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  const sessionToken = req.cookies.get(SESSION_COOKIE_NAME);
  
  if (!sessionToken || !sessionToken.value) {
    return null;
  }

  // TODO: Validate sessionToken from DB
  // For now, return null - we'll need to pass userId differently or store sessions
  return null;
}

