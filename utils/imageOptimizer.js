// utils/imageOptimizer.js
// ─────────────────────────────────────────────
// Image URL Utilities
//
// RAWG serves static full-resolution images from media.rawg.io
// (no CDN resize endpoint available). Next.js <Image/> handles
// all resizing, format conversion (AVIF/WebP), and compression
// via its built-in optimizer based on the `sizes` and `quality` props.
//
// This utility provides a safe passthrough that:
// - Strips any existing crop/resize fragments from RAWG URLs
//   (restoring the original full-resolution source)
// - Returns non-RAWG URLs unchanged
// ─────────────────────────────────────────────

const RAWG_MEDIA_PREFIX = 'https://media.rawg.io/media/';

/**
 * Ensure a RAWG image URL points to the full-resolution original.
 * If the URL contains a /crop/ or /resize/ fragment (e.g. from older
 * cached data), strip it to restore the original high-res source.
 *
 * Non-RAWG URLs (Steam, Supabase, etc.) pass through unchanged.
 *
 * @param {string|null|undefined} url - Image URL
 * @returns {string} Full-resolution URL
 */
export function getOptimizedImageUrl(url) {
  if (!url || typeof url !== 'string') return url ?? '';

  // Only process RAWG media URLs
  if (!url.startsWith(RAWG_MEDIA_PREFIX)) return url;

  // Extract path after /media/
  const mediaPath = url.slice(RAWG_MEDIA_PREFIX.length);

  // Strip any crop/resize prefix to get the original full-res image
  // e.g. "crop/600/400/games/abc/img.jpg" → "games/abc/img.jpg"
  // e.g. "resize/420/-/screenshots/abc/img.jpg" → "screenshots/abc/img.jpg"
  if (mediaPath.startsWith('crop/') || mediaPath.startsWith('resize/')) {
    const cleanPath = mediaPath.replace(/^(?:resize|crop)\/[^/]+\/[^/]+\//, '');
    return `${RAWG_MEDIA_PREFIX}${cleanPath}`;
  }

  return url;
}

/**
 * Alias — same as getOptimizedImageUrl since Next.js <Image/> handles
 * all sizing via the `sizes` prop. Kept for API compatibility.
 *
 * @param {string|null|undefined} url - Image URL
 * @returns {string} Full-resolution URL
 */
export function getOptimizedThumbnailUrl(url) {
  return getOptimizedImageUrl(url);
}
