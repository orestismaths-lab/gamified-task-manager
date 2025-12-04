import { NextResponse } from "next/server";

// Force dynamic rendering to prevent static optimization errors
export const dynamic = 'force-dynamic';

// Simplified auth check for demo: always return user: null
// We intentionally avoid using cookies here so that the route
// can be safely statically optimized on Vercel without errors.
export async function GET() {
  return NextResponse.json({ user: null }, { status: 200 });
}

