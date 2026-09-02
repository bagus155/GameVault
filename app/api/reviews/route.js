// app/api/reviews/route.js
// ─────────────────────────────────────────────
// GET  /api/reviews?gameId=xxx     — Get reviews for a game
// POST /api/reviews                — Submit a review
// Body for POST: { gameId, title, slug, coverUrl, rating, comment }
// ─────────────────────────────────────────────
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/authSession';
import { rateLimit } from '@/lib/rateLimit';
import prisma from '@/lib/prisma';
import {
  getReviewsByGame,
  getReviewByUserAndGame,
  createReview,
  updateReview,
  getAverageRating,
  getCombinedReviewsAndRating,
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
    const data = await getCombinedReviewsAndRating(gameId);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API/reviews GET] Error:', error.message);
    return NextResponse.json({ error: 'Gagal mengambil ulasan.' }, { status: 500 });
  }
}

// ── POST: Submit or update a review ──────────────────────────────────
export async function POST(request) {
  const user = await getAuthSession();
  if (!user) {
    return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });
  }

  // Rate Limiting: 5 requests per minute per user for reviews
  const rl = rateLimit(`review_${user.id}`, 5);
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Terlalu banyak permintaan. Silakan coba lagi nanti.' },
      { status: 429, headers: { 'Retry-After': Math.ceil((rl.resetTime - Date.now()) / 1000).toString() } }
    );
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

// ── DELETE: Delete a review ───────────────────────────────────────────
export async function DELETE(request) {
  const user = await getAuthSession();
  if (!user) {
    return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json({ error: 'reviewId diperlukan.' }, { status: 400 });
    }

    // Verify ownership and delete in one transaction
    const { count } = await prisma.review.deleteMany({
      where: {
        id: Number(reviewId),
        userId: user.id
      }
    });

    if (count === 0) {
      return NextResponse.json({ error: 'Ulasan tidak ditemukan atau tidak diizinkan.' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API/reviews DELETE] Error:', error.message);
    return NextResponse.json({ error: 'Gagal menghapus ulasan.' }, { status: 500 });
  }
}
