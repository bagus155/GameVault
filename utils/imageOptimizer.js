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
// - Rewrites URLs to use RAWG's native CDN resizing to drastically reduce payload
// - Returns non-RAWG URLs unchanged
// ─────────────────────────────────────────────

const RAWG_MEDIA_PREFIX = 'https://media.rawg.io/media/';

/**
 * Ensure a RAWG image URL points to a compressed 720p/1080p resolution.
 *
 * @param {string|null|undefined} url - Image URL
 * @returns {string} Resized URL
 */
export function getOptimizedImageUrl(url) {
  if (!url || typeof url !== 'string') return url ?? '';

  // Only process RAWG media URLs
  if (!url.startsWith(RAWG_MEDIA_PREFIX)) return url;

  // Extract path after /media/
  let mediaPath = url.slice(RAWG_MEDIA_PREFIX.length);

  // Strip any existing crop/resize to start fresh
  if (mediaPath.startsWith('crop/') || mediaPath.startsWith('resize/')) {
    mediaPath = mediaPath.replace(/^(?:resize|crop)\/[^/]+\/[^/]+\//, '');
  }

  // Use RAWG native resize to max 1280 width (drastically reduces payload from 4K)
  return `${RAWG_MEDIA_PREFIX}resize/1280/-/${mediaPath}`;
}

/**
 * Ensure a RAWG image URL points to a tiny cropped thumbnail.
 *
 * @param {string|null|undefined} url - Image URL
 * @returns {string} Cropped thumbnail URL
 */
export function getOptimizedThumbnailUrl(url) {
  if (!url || typeof url !== 'string') return url ?? '';
  if (!url.startsWith(RAWG_MEDIA_PREFIX)) return url;

  let mediaPath = url.slice(RAWG_MEDIA_PREFIX.length);
  if (mediaPath.startsWith('crop/') || mediaPath.startsWith('resize/')) {
    mediaPath = mediaPath.replace(/^(?:resize|crop)\/[^/]+\/[^/]+\//, '');
  }

  // Use RAWG native crop to 600x400 (drastically reduces payload for masonry grid)
  return `${RAWG_MEDIA_PREFIX}crop/600/400/${mediaPath}`;
}
