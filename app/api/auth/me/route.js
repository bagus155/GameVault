// app/api/auth/me/route.js
// ─────────────────────────────────────────────
// GET /api/auth/me
// Returns the current authenticated user from token
// ─────────────────────────────────────────────
import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request) {
  const tokenUser = getAuthUser(request);
  if (!tokenUser) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: tokenUser.id },
      select: { id: true, username: true, email: true, avatarUrl: true },
    });

    if (!dbUser) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user: dbUser });
  } catch (error) {
    console.error('[API/auth/me] Error:', error.message);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
