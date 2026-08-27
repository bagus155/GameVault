// app/api/auth/logout/route.js
// ─────────────────────────────────────────────
// POST /api/auth/logout
// Clears the auth cookie
// ─────────────────────────────────────────────
import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ message: 'Logout berhasil.' });
  response.headers.set('Set-Cookie', clearAuthCookie());
  return response;
}
