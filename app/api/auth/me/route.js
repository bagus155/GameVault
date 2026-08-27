// app/api/auth/me/route.js
// ─────────────────────────────────────────────
// GET /api/auth/me
// Returns the current authenticated user from token
// ─────────────────────────────────────────────
import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';

export async function GET(request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user });
}
