// services/db/profile.js
// ─────────────────────────────────────────────
// Profile DB operations (Database Layer)
// Handles user profile data and Top 5 game management
// ─────────────────────────────────────────────
import prisma from '@/lib/prisma';

/**
 * Fetch a user's full profile including top games and favorites.
 * @param {number} userId
 */
export async function getProfileWithTopGames(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id:        true,
      username:  true,
      email:     true,
      avatarUrl: true,
      bannerUrl: true,
      bio:       true,
      createdAt: true,
      topGames: {
        orderBy: { position: 'asc' },
        include: { game: true },
      },
      favorites: {
        orderBy: { createdAt: 'desc' },
        include: { game: true },
      },
    },
  });
}

/**
 * Update a user's profile fields (avatarUrl, bannerUrl, bio).
 * @param {number} userId
 * @param {{ avatarUrl?: string, bannerUrl?: string, bio?: string }} data
 */
export async function updateUserProfile(userId, { avatarUrl, bannerUrl, bio }) {
  return prisma.user.update({
    where: { id: userId },
    data:  { avatarUrl, bannerUrl, bio },
    select: {
      id:        true,
      username:  true,
      avatarUrl: true,
      bannerUrl: true,
      bio:       true,
      createdAt: true,
    },
  });
}

/**
 * Replace all Top 5 entries for a user atomically.
 * @param {number} userId
 * @param {Array<{ gameId: string, position: number }>} topGames - Max 5 entries
 */
export async function upsertTopGames(userId, topGames) {
  const validEntries = topGames
    .filter(({ gameId, position }) => gameId && position >= 1 && position <= 5)
    .slice(0, 5);

  return prisma.$transaction([
    prisma.userTopGame.deleteMany({ where: { userId } }),
    ...validEntries.map(({ gameId, position }) =>
      prisma.userTopGame.create({
        data: { userId, gameId: String(gameId), position },
      })
    ),
  ]);
}
