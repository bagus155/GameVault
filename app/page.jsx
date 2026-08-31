// app/page.jsx
// ─────────────────────────────────────────────
// Homepage — Catalog-First (NO conventional landing page)
// Users land directly on the game catalog
// ─────────────────────────────────────────────
import { Suspense } from 'react';
import { getTrendingGames } from '@/lib/rawg';
import HeroSection from '@/components/game/HeroSection';
import FilterBar from '@/components/game/FilterBar';
import MasonryGrid from '@/components/game/MasonryGrid';
import { SkeletonCard } from '@/components/ui/LoadingSpinner';

export const metadata = {
  title: 'Katalog Game: GameVault',
  description: 'Jelajahi ribuan game dari berbagai platform. Filter by genre, urutkan by rating, dan simpan favoritmu.',
};

// ── Masonry Skeleton fallback ──────────────────
function MasonrySkeleton() {
  const heights = ['140%', '100%', '160%', '120%', '150%'];
  return (
    <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4">
      {Array.from({ length: 15 }).map((_, i) => (
        <SkeletonCard key={i} className="mb-4" height={heights[i % heights.length]} />
      ))}
    </div>
  );
}

export default async function HomePage(props) {
  const searchParams = await props.searchParams;

  // ── Fetch trending games for Hero (server-side, cached) ──
  let trendingGames = [];
  try {
    const data = await getTrendingGames();
    trendingGames = data.results ?? [];
  } catch (err) {
    console.error('[HomePage] Failed to fetch trending:', err.message);
  }

  const search   = searchParams?.search   || '';
  const genre    = searchParams?.genre    || '';
  const ordering = searchParams?.ordering || '-added';

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">

      {/* ── Hero Section ── */}
      {trendingGames.length > 0 && (
        <HeroSection games={trendingGames.slice(0, 5)} />
      )}

      {/* ── Section Title ── */}
      <div className="flex items-baseline gap-3 mb-4">
        <h1 className="font-heading font-semibold text-white text-2xl">
          {search ? 'Hasil Pencarian' : 'Semua Game'}
        </h1>
        <span className="text-[#A1A1AA] text-sm font-sans hidden sm:block">
          {search ? `untuk "${search}"` : 'Katalog Lengkap'}
        </span>
      </div>

      {/* ── Filter Bar ── */}
      <Suspense fallback={null}>
        <FilterBar />
      </Suspense>

      {/* ── Masonry Catalog ── */}
      <Suspense fallback={<MasonrySkeleton />}>
        <MasonryGrid
          search={search}
          genre={genre}
          ordering={ordering}
        />
      </Suspense>
    </div>
  );
}
