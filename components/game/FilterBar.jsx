// components/game/FilterBar.jsx
// ─────────────────────────────────────────────
// Solid pill/tag filters for Genre + Sorting
// NO gradients — solid #262626 inactive, solid white active
// ─────────────────────────────────────────────
'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const GENRES = [
  { label: 'Semua',    value: '' },
  { label: 'Action',   value: 'action' },
  { label: 'RPG',      value: 'role-playing-games-rpg' },
  { label: 'Strategy', value: 'strategy' },
  { label: 'Indie',    value: 'indie' },
  { label: 'Adventure',value: 'adventure' },
  { label: 'Shooter',  value: 'shooter' },
  { label: 'Puzzle',   value: 'puzzle' },
  { label: 'Sports',   value: 'sports' },
  { label: 'Racing',   value: 'racing' },
];

const ORDERING = [
  { label: 'Relevansi',       value: '' },
  { label: 'Paling Populer',  value: '-added' },
  { label: 'Rating Tertinggi',value: '-rating' },
  { label: 'Terbaru',         value: '-released' },
  { label: 'Metacritic',      value: '-metacritic' },
  { label: 'A–Z',             value: 'name' },
];

export default function FilterBar() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const search       = searchParams.get('search')   || '';
  const activeGenre  = searchParams.get('genre')    || '';
  const activeOrder  = searchParams.get('ordering') || '-added';

  const updateParam = useCallback((key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Preserve search query
    router.push(`/?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  return (
    <div className="mb-6 space-y-3">
      {/* ── Genre Pills ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <span className="text-[#A1A1AA] text-xs font-semibold font-sans uppercase tracking-wide mr-1">
          Genre
        </span>
        {GENRES.map(g => {
          const isActive = activeGenre === g.value;
          return (
            <button
              key={g.value}
              id={`filter-genre-${g.value || 'all'}`}
              onClick={() => updateParam('genre', g.value)}
              className={`px-3 py-1 text-xs font-semibold font-sans rounded-pill transition-colors duration-150 ${
                isActive
                  ? 'bg-white text-[#121212]'
                  : 'bg-[#1E1E1E] text-[#A1A1AA] border border-[#2E2E2E] hover:border-[#3A3A3A] hover:text-white'
              }`}
            >
              {g.label}
            </button>
          );
        })}
      </div>

      {/* ── Sort Order ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <span className="text-[#A1A1AA] text-xs font-semibold font-sans uppercase tracking-wide mr-1">
          Urutkan
        </span>
        {ORDERING.filter(o => o.value !== '' || search).map(o => {
          const isActive = activeOrder === o.value;
          return (
            <button
              key={o.value}
              id={`filter-order-${o.value.replace('-','')}`}
              onClick={() => updateParam('ordering', o.value)}
              className={`px-3 py-1 text-xs font-semibold font-sans rounded-pill transition-colors duration-150 ${
                isActive
                  ? 'bg-[#EAB308] text-[#121212]'
                  : 'bg-[#1E1E1E] text-[#A1A1AA] border border-[#2E2E2E] hover:border-[#3A3A3A] hover:text-white'
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>

      {/* Search result label */}
      {search && (
        <div className="flex items-center gap-2">
          <span className="text-[#A1A1AA] text-sm font-sans">
            Hasil untuk: <strong className="text-white">"{search}"</strong>
          </span>
          <button
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete('search');
              router.push(`/?${params.toString()}`);
            }}
            className="text-xs text-[#A1A1AA] hover:text-white font-sans underline"
          >
            Hapus
          </button>
        </div>
      )}
    </div>
  );
}
