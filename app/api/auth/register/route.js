// app/api/auth/register/route.js
// ─────────────────────────────────────────────
// POST /api/auth/register
// Body: { username, email, password }
// ─────────────────────────────────────────────
import { NextResponse } from 'next/server';
import { createUser, findUserByEmail, findUserByUsername } from '@/services/db/users';
import { signToken, createAuthCookie } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    // ── Validation ──
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, dan password wajib diisi.' },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password minimal 8 karakter.' },
        { status: 400 }
      );
    }

    // ── Check duplicates ──
    const [existingEmail, existingUsername] = await Promise.all([
      findUserByEmail(email),
      findUserByUsername(username),
    ]);

    if (existingEmail) {
      return NextResponse.json({ error: 'Email sudah terdaftar.' }, { status: 409 });
    }
    if (existingUsername) {
      return NextResponse.json({ error: 'Username sudah digunakan.' }, { status: 409 });
    }

    // ── Create user & sign token ──
    const user  = await createUser({ username, email, password });
    const token = signToken({ id: user.id, username: user.username, email: user.email });

    const response = NextResponse.json(
      { message: 'Registrasi berhasil.', user },
      { status: 201 }
    );
    response.headers.set('Set-Cookie', createAuthCookie(token));
    return response;
  } catch (error) {
    console.error('[API/auth/register] Error:', error.message);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
