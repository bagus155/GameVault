// services/db/reviews.js
// ─────────────────────────────────────────────
// Review CRUD operations (Database Layer)
// ─────────────────────────────────────────────
import prisma from '@/lib/prisma';

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
