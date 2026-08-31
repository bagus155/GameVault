// services/db/reviews.js
// ─────────────────────────────────────────────
// Review CRUD operations (Database Layer)
// ─────────────────────────────────────────────
import prisma from '@/lib/prisma';
import { getGameRawgReviews, getGameStores } from '@/lib/rawg';
/**
 * Get all reviews for a game, including reviewer's username.
 * @param {string} gameId
 */
export async function getReviewsByGame(gameId) {
  return prisma.review.findMany({
    where: { gameId: String(gameId) },
    include: {
      user: { select: { id: true, username: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get a specific review by user + game (to check if already reviewed).
 * @param {number} userId
 * @param {string} gameId
 */
export async function getReviewByUserAndGame(userId, gameId) {
  return prisma.review.findFirst({
    where: { userId, gameId: String(gameId) },
  });
}

/**
 * Create a new review for a game.
 * @param {{ userId: number, gameId: string, rating: number, comment: string }} data
 */
export async function createReview({ userId, gameId, rating, comment }) {
  return prisma.review.create({
    data: {
      userId,
      gameId: String(gameId),
      rating: Number(rating),
      comment,
    },
    include: {
      user: { select: { id: true, username: true } },
    },
  });
}

/**
 * Update an existing review.
 * @param {number} reviewId
 * @param {{ rating?: number, comment?: string }} data
 */
export async function updateReview(reviewId, { rating, comment }) {
  return prisma.review.update({
    where: { id: reviewId },
    data: {
      ...(rating !== undefined && { rating: Number(rating) }),
      ...(comment !== undefined && { comment }),
    },
    include: {
      user: { select: { id: true, username: true } },
    },
  });
}

/**
 * Delete a review by ID.
 * @param {number} reviewId
 */
export async function deleteReview(reviewId) {
  return prisma.review.delete({ where: { id: reviewId } });
}

/**
 * Calculate the average rating for a game from local reviews.
 * @param {string} gameId
 */
export async function getAverageRating(gameId) {
  const result = await prisma.review.aggregate({
    where: { gameId: String(gameId) },
    _avg: { rating: true },
    _count: { rating: true },
  });
  return {
    average: result._avg.rating ?? 0,
    count: result._count.rating,
  };
}

/**
 * Get combined reviews from local, RAWG, and Steam, and calculate real average rating.
 * @param {string} gameId
 */
export async function getCombinedReviewsAndRating(gameId) {
  const [localReviews, rawgData, storesData] = await Promise.all([
    getReviewsByGame(gameId),
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
        const steamRes = await fetch(`https://store.steampowered.com/appreviews/${match[1]}?json=1&num_per_page=50`, {
          headers: {
            'User-Agent': 'GameVault/1.0 (Next.js)',
            'Accept': 'application/json'
          },
          next: { revalidate: 3600 }
        });
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
        console.error('[getCombinedReviewsAndRating] Failed to fetch Steam reviews:', e.message);
      }
    }
  }

  const combinedReviews = [...localReviews, ...rawgReviews, ...steamReviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  let totalRating = 0;
  let validRatingCount = 0;
  for (const r of combinedReviews) {
    if (r.rating > 0) {
      totalRating += r.rating;
      validRatingCount++;
    }
  }
  const realAverage = validRatingCount > 0 ? totalRating / validRatingCount : 0;

  return {
    reviews: combinedReviews,
    rating: {
      average: realAverage,
      count: combinedReviews.length,
    }
  };
}
