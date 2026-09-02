// app/api/favorites/route.js
// ─────────────────────────────────────────────
// GET  /api/favorites              — Get user's favorites
// POST /api/favorites              — Toggle favorite (add/remove)
// Body for POST: { gameId, title, slug, coverUrl }
// ─────────────────────────────────────────────
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/authSession';
import { getUserFavorites, toggleFavorite, upsertGame } from '@/services/db/favorites';

// ── GET: Return all favorites for authenticated user ──────────────────
export async function GET(request) {
  const user = await getAuthSession();
  if (!user) {
    return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });
  }

  try {
    const favorites = await getUserFavorites(user.id);
    return NextResponse.json({ favorites });
  } catch (error) {
    console.error('[API/favorites GET] Error:', error.message);
    return NextResponse.json({ error: 'Gagal mengambil favorit.' }, { status: 500 });
  }
}

// ── POST: Toggle favorite ─────────────────────────────────────────────
export async function POST(request) {
  const user = await getAuthSession();
  if (!user) {
    return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { gameId, title, slug, coverUrl } = body;

    if (!gameId || !title || !slug) {
      return NextResponse.json(
        { error: 'gameId, title, dan slug wajib diisi.' },
        { status: 400 }
      );
    }

    // Ensure game exists in local DB before creating favorite relation
    await upsertGame({ id: String(gameId), title, slug, coverUrl });

    const result = await toggleFavorite(user.id, String(gameId));
    return NextResponse.json(result);
  } catch (error) {
    console.error('[API/favorites POST] Error:', error.message);
    return NextResponse.json({ error: 'Gagal mengubah favorit.' }, { status: 500 });
  }
}
