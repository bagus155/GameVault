// app/api/games/route.js
// ─────────────────────────────────────────────
// RAWG Games Catalog Proxy
// GET /api/games?page=1&pageSize=20&search=&genres=&ordering=
// ─────────────────────────────────────────────
import { NextResponse } from 'next/server';
import { getGames } from '@/lib/rawg';
import { rateLimit } from '@/lib/rateLimit';

export async function GET(request) {
  // Rate Limiting: max 30 requests per minute per IP for RAWG proxy
  const ip = request.headers.get('x-forwarded-for') || request.ip || '127.0.0.1';
  const rl = rateLimit(`rawg_games_${ip}`, 30);
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Terlalu banyak permintaan. Silakan coba lagi nanti.' },
      { status: 429, headers: { 'Retry-After': Math.ceil((rl.resetTime - Date.now()) / 1000).toString() } }
    );
  }

  try {
    const { searchParams } = new URL(request.url);

    const page      = searchParams.get('page')      || 1;
    const pageSize  = searchParams.get('pageSize')  || 20;
    const search    = searchParams.get('search')    || '';
    const genres    = searchParams.get('genres')    || '';
    const ordering  = searchParams.get('ordering')  || '-rating';
    const platforms = searchParams.get('platforms') || '';

    const data = await getGames({
      page:     Number(page),
      pageSize: Number(pageSize),
      search,
      genres,
      ordering,
      platforms,
    });

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('[API/games] Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch games', detail: error.message },
      { status: 500 }
    );
  }
}
