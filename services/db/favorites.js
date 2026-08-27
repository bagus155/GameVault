// services/db/favorites.js
// ─────────────────────────────────────────────
// Favorite CRUD operations (Database Layer)
// ─────────────────────────────────────────────
import prisma from '@/lib/prisma';

/**
 * Ensure a Game record exists in our DB before creating relations.
 * We upsert so we never duplicate RAWG game entries.
 * @param {{ id: string, title: string, slug: string, coverUrl?: string }} game
 */
export async function upsertGame({ id, title, slug, coverUrl }) {
  return prisma.game.upsert({
    where: { id: String(id) },
    update: { title, slug, coverUrl },
    create: { id: String(id), title, slug, coverUrl },
  });
}

/**
 * Get all favorites for a user (with game info).
 * @param {number} userId
 */
export async function getUserFavorites(userId) {
  return prisma.favorite.findMany({
    where: { userId },
    include: { game: true },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Check if a specific game is favorited by the user.
 * @param {number} userId
 * @param {string} gameId
 */
export async function isFavorited(userId, gameId) {
  const fav = await prisma.favorite.findUnique({
    where: { userId_gameId: { userId, gameId: String(gameId) } },
  });
  return !!fav;
}

/**
 * Toggle favorite: add if not present, remove if present.
 * Returns { action: 'added' | 'removed' }.
 * @param {number} userId
 * @param {string} gameId
 */
export async function toggleFavorite(userId, gameId) {
  const existing = await prisma.favorite.findUnique({
    where: { userId_gameId: { userId, gameId: String(gameId) } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return { action: 'removed' };
  }

  await prisma.favorite.create({
    data: { userId, gameId: String(gameId) },
  });
  return { action: 'added' };
}
