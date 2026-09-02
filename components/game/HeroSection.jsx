// components/game/HeroSection.jsx
// ─────────────────────────────────────────────
// Hero Banner — 3-5 Trending Games
// - Solid Dark Container (#1E1E1E), NO gradient overlay on images
// - Manual slide controls + auto-rotation
// - Shows title, rating, genres
// - Images: HD quality via RAWG CDN resize + Next.js AVIF/WebP
// ─────────────────────────────────────────────
'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import StarRating from '@/components/ui/StarRating';
import { getOptimizedImageUrl } from '@/utils/imageOptimizer';

function ChevronLeft() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

/**
 * @param {Object}   props
 * @param {Object[]} props.games - Trending games (3–5)
 */
export default function HeroSection({ games = [] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setActive(i => (i + 1) % games.length), [games.length]);
  const prev = useCallback(() => setActive(i => (i - 1 + games.length) % games.length), [games.length]);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (paused || games.length <= 1) return;
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [paused, next, games.length]);

  if (!games.length) return null;

  const current = games[active];

  return (
    <section
      className="relative w-full bg-[#1E1E1E] rounded-card overflow-hidden mb-6 sm:mb-8"
      style={{ minHeight: 'clamp(260px, 40vw, 380px)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Trending games hero"
    >
      {/* ── Background Image (solid-framed, NOT overlay) ── */}
      <div className="absolute inset-0">
        {current.background_image && (
          <Image
            key={current.id}
            src={getOptimizedImageUrl(current.background_image)}
            alt={current.name}
            fill
            priority
            unoptimized
            quality={100}
            sizes="100vw"
            className="object-cover object-center opacity-40 transition-opacity duration-500"
          />
        )}
        {/* Solid vignette — solid color blocks, no gradient */}
        <div className="absolute inset-0 bg-[#1E1E1E] opacity-30" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-[#1E1E1E] opacity-80" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col justify-end h-full p-4 sm:p-6 md:p-8" style={{ minHeight: 'clamp(260px, 40vw, 380px)' }}>
        {/* Trending label */}
        <div className="mb-3">
          <span className="text-xs font-semibold font-sans text-[#EAB308] bg-[#1E1E1E] border border-[#EAB308] px-2.5 py-1 rounded-[6px] tracking-wide uppercase">
            🔥 Trending
          </span>
        </div>

        {/* Game title */}
        <h2 className="font-heading font-semibold text-white text-xl sm:text-2xl md:text-4xl leading-tight mb-2 max-w-lg line-clamp-2">
          {current.name}
        </h2>

        {/* Rating + genre */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <StarRating rating={Math.round(current.rating ?? 0)} size={16} />
          {current.rating > 0 && (
            <span className="text-[#A1A1AA] text-sm font-sans">{current.rating.toFixed(1)} / 5</span>
          )}
          {current.genres?.slice(0, 3).map(g => (
            <span key={g.id} className="text-[11px] font-sans text-[#A1A1AA] bg-[#262626] border border-[#2E2E2E] px-2 py-0.5 rounded-[4px]">
              {g.name}
            </span>
          ))}
        </div>

        {/* CTA button */}
        <Link
          href={`/games/${current.id}`}
          id={`hero-cta-${current.id}`}
          className="inline-flex items-center gap-2 bg-white text-[#121212] text-sm font-semibold font-sans px-5 py-2.5 rounded-[8px] hover:bg-[#E5E5E5] transition-colors duration-150 w-fit"
        >
          Lihat Game
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* ── Controls ── */}
      {games.length > 1 && (
        <>
          <button
            id="hero-prev-btn"
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-[#1E1E1E] border border-[#2E2E2E] rounded-full flex items-center justify-center text-white hover:bg-[#262626] transition-colors duration-150"
            aria-label="Previous slide"
          >
            <ChevronLeft />
          </button>
          <button
            id="hero-next-btn"
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-[#1E1E1E] border border-[#2E2E2E] rounded-full flex items-center justify-center text-white hover:bg-[#262626] transition-colors duration-150"
            aria-label="Next slide"
          >
            <ChevronRight />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-4 right-6 z-20 flex gap-1.5">
            {games.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active ? 'w-5 bg-white' : 'w-1.5 bg-[#3A3A3A]'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
