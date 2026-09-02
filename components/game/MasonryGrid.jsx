// components/game/MasonryGrid.jsx
// ─────────────────────────────────────────────
// Masonry Grid using Tailwind CSS Multi-Column
// - columns-2 sm:columns-3 md:columns-4 lg:columns-5
// - break-inside-avoid on each card
// - Cards have variable heights for organic look
// ─────────────────────────────────────────────
'use client';
import { useEffect, useState, useCallback, useRef, startTransition } from 'react';
import GameCard from './GameCard';

const SKELETON_HEIGHTS = ['140%', '100%', '75%', '120%', '90%'];
import { SkeletonCard } from '@/components/ui/LoadingSpinner';

/**
 * @param {Object}   props
 * @param {Object[]} props.games       - Initial games array (from SSR or parent)
 * @param {string}   props.search      - Current search query (triggers re-fetch)
 * @param {string}   props.genre       - Current genre filter
 * @param {string}   props.ordering    - Sort ordering
 */
export default function MasonryGrid({ games: initialGames = [], search = '', genre = '', ordering = '-rating' }) {
  const [games, setGames]     = useState(initialGames);
  const [page, setPage]       = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(false);
  const [loaderNode, setLoaderNode] = useState(null);
  const abortRef  = useRef(null);
  const fetchingPageRef = useRef(0);

  // Fetch games from our internal API proxy
  const fetchGames = useCallback(async (pageNum, reset = false) => {
    // Prevent duplicate fetches for the same page (Strict Mode protection)
    if (!reset && fetchingPageRef.current === pageNum) return;

    // Only abort previous requests if we are applying a new filter
    if (reset) {
      fetchingPageRef.current = 1;
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
    } else {
      fetchingPageRef.current = pageNum;
    }

    setLoading(true);
    if (reset) setIsFirstLoad(true);

    try {
      const params = new URLSearchParams({
        page: pageNum,
        pageSize: 20,
        search,
        genres: genre,
        ordering,
      });

      const res = await fetch(`/api/games?${params}`, {
        signal: reset ? abortRef.current.signal : undefined,
      });
      const data = await res.json();

      let results = data.results ?? [];
      
      // Shuffle results for a more dynamic and random feel (if not searching)
      if (!search.trim()) {
        results = results.sort(() => Math.random() - 0.5);
      }

      startTransition(() => {
        setGames(prev => reset ? results : [...prev, ...results]);
        setHasMore(!!data.next);
      });
    } catch (err) {
      if (err.name !== 'AbortError') console.error('[MasonryGrid] Fetch error:', err);
    } finally {
      setLoading(false);
      setIsFirstLoad(false);
    }
  }, [search, genre, ordering]);

  // Re-fetch when filters change
  useEffect(() => {
    // Pick a random starting page (1-10) for non-search views to randomize the catalog
    const startPage = search.trim() ? 1 : Math.floor(Math.random() * 10) + 1;
    setPage(startPage);
    setHasMore(true);
    fetchGames(startPage, true);
  }, [fetchGames, search]);

  // Infinite scroll: observe loader sentinel
  useEffect(() => {
    if (!loaderNode || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchGames(nextPage);
        }
      },
      { rootMargin: '400px' }
    );
    
    observer.observe(loaderNode);
    return () => observer.disconnect();
  }, [loaderNode, hasMore, loading, page, fetchGames]);

  // ── Skeleton placeholders while first-loading ──
  if (isFirstLoad) {
    return (
      <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4">
        {Array.from({ length: 15 }).map((_, i) => (
          <SkeletonCard key={i} className="mb-4" height={SKELETON_HEIGHTS[i % 5]} />
        ))}
      </div>
    );
  }

  if (!loading && games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="text-5xl mb-4">🕹️</span>
        <p className="text-[#A1A1AA] font-sans text-base">
          {search ? `Tidak ada game yang ditemukan untuk "${search}"` : 'Tidak ada game ditemukan.'}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ── Masonry Column Layout ── */}
      <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4">
        {games.map((game, i) => (
          <div key={`${game.id}-${i}`} className={i >= 6 ? "animate-fade-in" : ""} style={i >= 6 ? { animationDelay: `${((i - 6) % 10) * 30}ms` } : {}}>
            <GameCard game={game} priority={i < 6} />
          </div>
        ))}
      </div>

      {/* ── Infinite Scroll Sentinel ── */}
      <div ref={setLoaderNode} className="py-6 flex justify-center w-full">
        {loading && !isFirstLoad && (
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4 w-full">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={`loading-${i}`} className="mb-4" height={SKELETON_HEIGHTS[i % 5]} />
            ))}
          </div>
        )}
        {!hasMore && games.length > 0 && (
          <p className="text-[#A1A1AA] text-sm font-sans">Semua game telah ditampilkan.</p>
        )}
      </div>
    </>
  );
}
