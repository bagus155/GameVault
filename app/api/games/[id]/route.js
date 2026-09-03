// app/api/games/[id]/route.js
// ─────────────────────────────────────────────
// RAWG Single Game + Screenshots Proxy
// GET /api/games/[id]
// GET /api/games/[id]?screenshots=true
// ─────────────────────────────────────────────
import { NextResponse } from 'next/server';
import { getGameById, getGameScreenshots } from '@/lib/rawg';


export async function GET(request, props) {


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
