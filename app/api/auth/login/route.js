// app/api/auth/login/route.js
// ─────────────────────────────────────────────
// POST /api/auth/login
// Body: { email, password }
// ─────────────────────────────────────────────
import { NextResponse } from 'next/server';
import { findUserByEmail, verifyPassword } from '@/services/db/users';
import { signToken, createAuthCookie } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Email atau password salah.' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Email atau password salah.' },
        { status: 401 }
      );
    }

    const token = signToken({ id: user.id, username: user.username, email: user.email });

    const response = NextResponse.json({
      message: 'Login berhasil.',
      user: { id: user.id, username: user.username, email: user.email },
    });
    response.headers.set('Set-Cookie', createAuthCookie(token));
    return response;
  } catch (error) {
    console.error('[API/auth/login] Error:', error.message);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
