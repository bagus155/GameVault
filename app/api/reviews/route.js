// app/api/reviews/route.js
// ─────────────────────────────────────────────
// GET  /api/reviews?gameId=xxx     — Get reviews for a game
// POST /api/reviews                — Submit a review
// Body for POST: { gameId, title, slug, coverUrl, rating, comment }
// ─────────────────────────────────────────────
import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import {
  getReviewsByGame,
  getReviewByUserAndGame,
  createReview,
  updateReview,
  getAverageRating,
} from '@/services/db/reviews';
import { upsertGame } from '@/services/db/favorites';
import { getGameRawgReviews, getGameStores } from '@/lib/rawg';

// ── GET: Fetch reviews for a game ─────────────────────────────────────
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get('gameId');

  if (!gameId) {
    return NextResponse.json({ error: 'gameId diperlukan.' }, { status: 400 });
  }

  try {
    const [localReviews, rating, rawgData, storesData] = await Promise.all([
      getReviewsByGame(gameId),
      getAverageRating(gameId),
      getGameRawgReviews(gameId).catch(() => ({ results: [] })),
      getGameStores(gameId).catch(() => ({ results: [] })),
    ]);

    const rawgReviews = (rawgData.results || []).map(r => ({
      id: `rawg_${r.id}`,
      rating: r.rating || 0,
      comment: r.text || r.text_preview || 'Ulasan dari pengguna RAWG.',
      createdAt: new Date(r.created),
      user: {
        username: r.user?.username || 'RAWG User',
      },
      isRawg: true,
    }));

    // Extract Steam App ID and fetch Steam reviews
    let steamReviews = [];
    const steamStore = storesData?.results?.find(s => s.url?.includes('steampowered.com/app/'));
    if (steamStore) {
      const match = steamStore.url.match(/app\/(\d+)/);
      if (match && match[1]) {
        try {
          const steamRes = await fetch(`https://store.steampowered.com/appreviews/${match[1]}?json=1&num_per_page=10`);
          const steamData = await steamRes.json();
          if (steamData.success === 1 && steamData.reviews) {
            steamReviews = steamData.reviews.map(r => ({
              id: `steam_${r.recommendationid}`,
              rating: r.voted_up ? 5 : 1,
              comment: r.review || 'Ulasan dari pengguna Steam.',
              createdAt: new Date(r.timestamp_created * 1000),
              user: {
                username: r.author?.personaname || 'Steam User',
              },
              isSteam: true,
            }));
          }
        } catch (e) {
          console.error('[API/reviews GET] Failed to fetch Steam reviews:', e.message);
        }
      }
    }

    const combinedReviews = [...localReviews, ...rawgReviews, ...steamReviews].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return NextResponse.json({ reviews: combinedReviews, rating });
  } catch (error) {
    console.error('[API/reviews GET] Error:', error.message);
    return NextResponse.json({ error: 'Gagal mengambil ulasan.' }, { status: 500 });
  }
}

// ── POST: Submit or update a review ──────────────────────────────────
export async function POST(request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { gameId, title, slug, coverUrl, rating, comment } = body;

    // Validation
    if (!gameId || !rating || !comment) {
      return NextResponse.json(
        { error: 'gameId, rating, dan komentar wajib diisi.' },
        { status: 400 }
      );
    }
    const ratingNum = Number(rating);
    if (ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ error: 'Rating harus antara 1–5.' }, { status: 400 });
    }

    // Ensure game exists in DB
    await upsertGame({
      id: String(gameId),
      title: title || gameId,
      slug: slug || String(gameId),
      coverUrl,
    });

    // Check if user already reviewed this game
    const existing = await getReviewByUserAndGame(user.id, gameId);

    let review;
    if (existing) {
      review = await updateReview(existing.id, { rating: ratingNum, comment });
    } else {
      review = await createReview({ userId: user.id, gameId, rating: ratingNum, comment });
    }

    return NextResponse.json({ review }, { status: existing ? 200 : 201 });
  } catch (error) {
    console.error('[API/reviews POST] Error:', error.message);
    return NextResponse.json({ error: 'Gagal menyimpan ulasan.' }, { status: 500 });
  }
}
