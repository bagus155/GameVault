// components/game/GameCard.jsx
// ─────────────────────────────────────────────
// Individual Game Card for Masonry Grid
// - Solid #1E1E1E background, NO gradient overlays
// - Variable heights (portrait / landscape / square) for masonry effect
// - Hover: subtle lift effect (no color change)
// - Images: HD quality via RAWG CDN resize + Next.js AVIF/WebP
// ─────────────────────────────────────────────
'use client';
import Link from 'next/link';
import Image from 'next/image';
import StarRating from '@/components/ui/StarRating';
import { getOptimizedThumbnailUrl } from '@/utils/imageOptimizer';

// ── Stable height variation based on game ID ──
function getAspectClass(id) {
  const variants = [
    'pb-[140%]', // tall portrait
    'pb-[100%]', // square
    'pb-[75%]',  // landscape
    'pb-[120%]', // portrait
    'pb-[90%]',  // near square
  ];
  const index = String(id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % variants.length;
  return variants[index];
}

// ── Platform tag ──────────────────────────────
function PlatformTag({ name }) {
  const short = name.replace('PlayStation', 'PS').replace('Nintendo Switch', 'Switch').replace('Xbox One', 'XB1');
  return (
    <span className="text-[10px] text-[#A1A1AA] bg-[#2E2E2E] px-1.5 py-0.5 rounded-[4px] font-sans leading-none">
      {short}
    </span>
  );
}

/**
 * @param {Object} props
 * @param {Object} props.game - RAWG game object
 * @param {boolean} [props.priority=false] - Preload image (for above-the-fold)
 */
export default function GameCard({ game, priority = false }) {
  const aspectClass = getAspectClass(game.id);
  const platforms = game.parent_platforms?.slice(0, 3) ?? [];
  const rating = game.rating ?? 0;
  const genres = game.genres?.slice(0, 2) ?? [];

  return (
    <Link
      href={`/games/${game.id}`}
      id={`game-card-${game.id}`}
      className="group block bg-[#1E1E1E] rounded-card overflow-hidden break-inside-avoid mb-4 border border-[#2E2E2E] hover:border-[#3A3A3A] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
    >
      {/* ── Cover Image ── */}
      <div className={`relative w-full ${aspectClass} overflow-hidden bg-[#262626]`}>
        {game.background_image ? (
          <Image
            src={getOptimizedThumbnailUrl(game.background_image)}
            alt={game.name}
            fill
            priority={priority}
            fetchPriority={priority ? "high" : "auto"}
            quality={75}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          // Solid fallback — no gradient
          <div className="absolute inset-0 bg-[#262626] flex items-center justify-center">
            <span className="text-[#3A3A3A] text-4xl">🎮</span>
          </div>
        )}

        {/* Metacritic badge */}
        {game.metacritic && (
          <div className="absolute top-2 right-2">
            <span className={`text-xs font-bold font-sans px-1.5 py-0.5 rounded-[4px] ${
              game.metacritic >= 75
                ? 'bg-[#1E1E1E] text-[#EAB308] border border-[#EAB308]'
                : 'bg-[#1E1E1E] text-[#A1A1AA] border border-[#3A3A3A]'
            }`}>
              {game.metacritic}
            </span>
          </div>
        )}
      </div>

      {/* ── Card Body ── */}
      <div className="p-3 space-y-2">
        {/* Title */}
        <h3 className="text-white text-sm font-semibold font-sans leading-snug line-clamp-2">
          {game.name}
        </h3>

        {/* Star Rating + Rating number */}
        <div className="flex items-center gap-1.5">
          <StarRating rating={Math.round(rating)} size={13} />
          {rating > 0 && (
            <span className="text-[11px] text-[#A1A1AA] font-sans">{rating.toFixed(1)}</span>
          )}
        </div>

        {/* Genres */}
        {genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {genres.map(g => (
              <span
                key={g.id}
                className="text-[10px] text-[#A1A1AA] font-sans"
              >
                {g.name}
              </span>
            ))}
          </div>
        )}

        {/* Platforms */}
        {platforms.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {platforms.map(p => (
              <PlatformTag key={p.platform.id} name={p.platform.name} />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
