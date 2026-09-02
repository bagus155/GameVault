// app/api/games/[id]/route.js
// ─────────────────────────────────────────────
// RAWG Single Game + Screenshots Proxy
// GET /api/games/[id]
// GET /api/games/[id]?screenshots=true
// ─────────────────────────────────────────────
import { NextResponse } from 'next/server';
import { getGameById, getGameScreenshots } from '@/lib/rawg';
import { rateLimit } from '@/lib/rateLimit';

export async function GET(request, props) {
  // Rate Limiting: max 60 requests per minute per IP for RAWG proxy
  const ip = request.headers.get('x-forwarded-for') || request.ip || '127.0.0.1';
  const rl = rateLimit(`rawg_game_id_${ip}`, 60);
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Terlalu banyak permintaan. Silakan coba lagi nanti.' },
      { status: 429, headers: { 'Retry-After': Math.ceil((rl.resetTime - Date.now()) / 1000).toString() } }
    );
  }

  const params = await props.params;
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const includeScreenshots = searchParams.get('screenshots') === 'true';

    const [game, screenshots] = await Promise.all([
      getGameById(id),
      includeScreenshots ? getGameScreenshots(id) : Promise.resolve(null),
    ]);

    return NextResponse.json({
      game,
      screenshots: screenshots?.results ?? [],
    });
  } catch (error) {
    console.error(`[API/games/${params.id}] Error:`, error.message);
    return NextResponse.json(
      { error: 'Game not found', detail: error.message },
      { status: 404 }
    );
  }
}
