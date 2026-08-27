// lib/rawg.js
// ─────────────────────────────────────────────
// RAWG API Service Layer
// All calls to RAWG are centralized here.
// This module is SERVER-ONLY — never import from client components.
// The API key is kept secret via Next.js Route Handlers (proxy pattern).
// ─────────────────────────────────────────────

const RAWG_BASE_URL = 'https://api.rawg.io/api';
const API_KEY = process.env.RAWG_API_KEY;

/**
 * Core fetcher: appends API key and handles errors uniformly.
 * @param {string} endpoint - Path after /api (e.g. '/games')
 * @param {Object} params   - Query params object
 */
async function rawgFetch(endpoint, params = {}) {
  if (!API_KEY) {
    throw new Error('RAWG_API_KEY is not set in environment variables.');
  }

  const url = new URL(`${RAWG_BASE_URL}${endpoint}`);
  url.searchParams.set('key', API_KEY);

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, String(v));
    }
  });

  const res = await fetch(url.toString(), {
    next: { revalidate: 300 }, // Cache for 5 minutes
  });

  if (!res.ok) {
    throw new Error(`RAWG API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// ─────────────────────────────────────────────
// Games
// ─────────────────────────────────────────────

/**
 * Fetch a paginated list of games.
 * @param {Object} options
 * @param {number} options.page         - Page number (default: 1)
 * @param {number} options.pageSize     - Results per page (default: 20)
 * @param {string} options.search       - Search query
 * @param {string} options.genres       - Comma-separated genre slugs
 * @param {string} options.ordering     - Sort field (e.g. '-rating', '-added')
 * @param {string} options.platforms    - Comma-separated platform IDs
 */
export async function getGames({
  page = 1,
  pageSize = 20,
  search = '',
  genres = '',
  ordering = '-rating',
  platforms = '',
} = {}) {
  return rawgFetch('/games', {
    page,
    page_size: pageSize,
    search,
    genres,
    ordering,
    platforms,
    ...(search ? { search_precise: true, search_exact: true } : {}),
  });
}

/**
 * Fetch details of a single game by RAWG ID or slug.
 * @param {string|number} idOrSlug
 */
export async function getGameById(idOrSlug) {
  return rawgFetch(`/games/${idOrSlug}`);
}

/**
 * Fetch screenshots for a game.
 * @param {string|number} idOrSlug
 */
export async function getGameScreenshots(idOrSlug) {
  return rawgFetch(`/games/${idOrSlug}/screenshots`);
}

/**
 * Fetch reviews for a game from RAWG.
 * @param {string|number} idOrSlug
 */
export async function getGameRawgReviews(idOrSlug) {
  return rawgFetch(`/games/${idOrSlug}/reviews`, { page_size: 10 });
}

/**
 * Fetch stores for a game to get store URLs (e.g., Steam App ID).
 * @param {string|number} idOrSlug
 */
export async function getGameStores(idOrSlug) {
  return rawgFetch(`/games/${idOrSlug}/stores`);
}

/**
 * Fetch trending/popular games for the Hero section.
 * Returns top 5 games ordered by added count.
 */
export async function getTrendingGames() {
  return rawgFetch('/games', {
    page_size: 5,
    ordering: '-added',
  });
}

/**
 * Fetch genre list for the filter bar.
 */
export async function getGenres() {
  return rawgFetch('/genres', { page_size: 20 });
}
