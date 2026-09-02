// app/api/profile/route.js
// ─────────────────────────────────────────────
// GET  /api/profile  — Fetch authenticated user's full profile
// PUT  /api/profile  — Update profile fields + Top 5 games
// ─────────────────────────────────────────────
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/authSession';
import prisma from '@/lib/prisma';
import {
  getProfileWithTopGames,
  updateUserProfile,
  upsertTopGames,
} from '@/services/db/profile';

// ── GET /api/profile ──────────────────────────
export async function GET(request) {
  try {
    const authUser = await getAuthSession();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const profile = await getProfileWithTopGames(authUser.id);
    if (!profile) {
      return NextResponse.json({ error: 'Profil tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('[API/profile GET] Error:', error.message);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

// ── PUT /api/profile ──────────────────────────
export async function PUT(request) {
  try {
    const authUser = await getAuthSession();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const { username, avatarUrl, bannerUrl, bio, topGames } = body;

    // ── Validation ──
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: { equals: username, mode: 'insensitive' },
          id: { not: authUser.id }
        }
      });
      if (existingUser) {
        return NextResponse.json({ error: 'Username sudah digunakan.' }, { status: 409 });
      }
    }
    if (bio && bio.length > 160) {
      return NextResponse.json(
        { error: 'Bio maksimal 160 karakter.' },
        { status: 400 }
      );
    }
    if (topGames !== undefined && (!Array.isArray(topGames) || topGames.length > 5)) {
      return NextResponse.json(
        { error: 'Top games harus berupa array maksimal 5 item.' },
        { status: 400 }
      );
    }

    // ── Persist changes ──
    const [updatedProfile] = await Promise.all([
      updateUserProfile(authUser.id, {
        username:  username  ?? undefined,
        avatarUrl: avatarUrl ?? undefined,
        bannerUrl: bannerUrl ?? undefined,
        bio:       bio       ?? undefined,
      }),
      topGames !== undefined
        ? upsertTopGames(authUser.id, topGames)
        : Promise.resolve(),
    ]);

    const profile = await getProfileWithTopGames(authUser.id);
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('[API/profile PUT] Error:', error.message);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
