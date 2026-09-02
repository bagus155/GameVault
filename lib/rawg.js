// lib/rawg.js
// ─────────────────────────────────────────────
// RAWG API Service Layer
// All calls to RAWG are centralized here.
// This module is SERVER-ONLY — never import from client components.
// The API key is kept secret via Next.js Route Handlers (proxy pattern).
//
// Caching Strategy (Next.js App Router built-in fetch cache):
//   - Static data (game detail, screenshots, stores): 24h revalidation
//   - Dynamic lists (catalog, genres, trending, reviews): 1h revalidation
// ─────────────────────────────────────────────

const RAWG_BASE_URL = 'https://api.rawg.io/api';
const API_KEY = process.env.RAWG_API_KEY;

// ── Revalidation tiers (seconds) ──────────────
const CACHE_STATIC  = 86400; // 24 hours — game details, screenshots, stores
const CACHE_DYNAMIC = 3600;  // 1 hour  — catalog lists, genres, trending

/**
 * Core fetcher: appends API key, handles errors, and applies cache policy.
 * @param {string} endpoint   - Path after /api (e.g. '/games')
 * @param {Object} params     - Query params object
 * @param {number} revalidate - Cache revalidation period in seconds
 */
async function rawgFetch(endpoint, params = {}, revalidate = CACHE_DYNAMIC) {
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
    next: { revalidate },
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
 * Cache: 1 hour (catalog changes gradually)
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
  }, CACHE_DYNAMIC);
}

/**
 * Fetch details of a single game by RAWG ID or slug.
 * Cache: 24 hours (game metadata rarely changes)
 * @param {string|number} idOrSlug
 */
export async function getGameById(idOrSlug) {
  return rawgFetch(`/games/${idOrSlug}`, {}, CACHE_STATIC);
}

/**
 * Fetch screenshots for a game.
 * Cache: 24 hours (screenshots are static assets)
 * @param {string|number} idOrSlug
 */
export async function getGameScreenshots(idOrSlug) {
  return rawgFetch(`/games/${idOrSlug}/screenshots`, {}, CACHE_STATIC);
}

/**
 * Fetch reviews for a game from RAWG.
 * Cache: 1 hour (reviews may be added)
 * @param {string|number} idOrSlug
 */
export async function getGameRawgReviews(idOrSlug) {
  return rawgFetch(`/games/${idOrSlug}/reviews`, { page_size: 50 }, CACHE_DYNAMIC);
}

/**
 * Fetch stores for a game to get store URLs (e.g., Steam App ID).
 * Cache: 24 hours (store links are static)
 * @param {string|number} idOrSlug
 */
export async function getGameStores(idOrSlug) {
  return rawgFetch(`/games/${idOrSlug}/stores`, {}, CACHE_STATIC);
}

/**
 * Fetch trending/popular games for the Hero section.
 * Returns top 5 games ordered by added count.
 * Cache: 1 hour (trending list changes gradually)
 */
export async function getTrendingGames() {
  return rawgFetch('/games', {
    page_size: 5,
    ordering: '-added',
  }, CACHE_DYNAMIC);
}

/**
 * Fetch genre list for the filter bar.
 * Cache: 1 hour (genre list is very stable)
 */
export async function getGenres() {
  return rawgFetch('/genres', { page_size: 20 }, CACHE_DYNAMIC);
}
