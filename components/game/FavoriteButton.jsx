// components/game/FavoriteButton.jsx
// ─────────────────────────────────────────────
// Toggle Favorite Button
// - Shows filled heart when favorited
// - Solid #1E1E1E background, solid white / muted text
// - Redirects to login if not authenticated
// ─────────────────────────────────────────────
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function HeartIcon({ filled }) {
  return (
    <svg
      className="w-5 h-5 transition-transform duration-150 active:scale-90"
      viewBox="0 0 24 24"
      fill={filled ? '#EF4444' : 'none'}
      stroke={filled ? '#EF4444' : 'currentColor'}
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );
}

/**
 * @param {Object} props
 * @param {string} props.gameId   - RAWG game ID
 * @param {string} props.title    - Game title
 * @param {string} props.slug     - Game slug
 * @param {string} props.coverUrl - Game cover URL
 */
export default function FavoriteButton({ gameId, title, slug, coverUrl }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isFav, setIsFav]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  // Check if this game is already favorited
  useEffect(() => {
    if (!user || !gameId) return;

    async function checkFavorite() {
      try {
        const res  = await fetch('/api/favorites');
        const data = await res.json();
        const favs = data.favorites ?? [];
        setIsFav(favs.some(f => f.gameId === String(gameId)));
      } catch {
        /* silently fail */
      } finally {
        setChecked(true);
      }
    }
    checkFavorite();
  }, [user, gameId]);

  const handleToggle = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: String(gameId), title, slug, coverUrl }),
      });
      const data = await res.json();
      if (data.action === 'added')   setIsFav(true);
      if (data.action === 'removed') setIsFav(false);
    } catch (err) {
      console.error('[FavoriteButton] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Don't render until auth is determined
  if (authLoading) return null;

  return (
    <button
      id={`favorite-btn-${gameId}`}
      onClick={handleToggle}
      disabled={loading || (user && !checked)}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-[8px] border font-semibold font-sans text-sm transition-all duration-150 ${
        isFav
          ? 'bg-[#1E1E1E] border-[#EF4444] text-[#EF4444] hover:bg-[#2A1A1A]'
          : 'bg-[#1E1E1E] border-[#2E2E2E] text-[#A1A1AA] hover:border-white hover:text-white'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      aria-label={isFav ? 'Hapus dari favorit' : 'Tambah ke favorit'}
    >
      <HeartIcon filled={isFav} />
      {isFav ? 'Tersimpan' : 'Simpan'}
    </button>
  );
}
