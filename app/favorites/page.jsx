// app/favorites/page.jsx
// ─────────────────────────────────────────────
// User Favorites Page
// Protected — redirects to login if not authenticated
// ─────────────────────────────────────────────
'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { PageLoader, SkeletonCard } from '@/components/ui/LoadingSpinner';

// ── Favorite Game Card ────────────────────────
function FavCard({ fav, onRemove }) {
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: fav.gameId,
          title: fav.game.title,
          slug: fav.game.slug,
          coverUrl: fav.game.coverUrl,
        }),
      });
      onRemove(fav.gameId);
    } catch {
      setRemoving(false);
    }
  };

  return (
    <div className="group bg-[#1E1E1E] border border-[#2E2E2E] rounded-card overflow-hidden hover:border-[#3A3A3A] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      {/* Cover */}
      <Link href={`/games/${fav.gameId}`} id={`fav-card-${fav.gameId}`}>
        <div className="relative w-full pb-[60%] bg-[#262626] overflow-hidden">
          {fav.game.coverUrl ? (
            <Image
              src={fav.game.coverUrl}
              alt={fav.game.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 bg-[#262626] flex items-center justify-center">
              <span className="text-3xl">🎮</span>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-3 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <Link href={`/games/${fav.gameId}`}>
            <h3 className="text-white text-sm font-semibold font-sans line-clamp-2 hover:underline leading-snug">
              {fav.game.title}
            </h3>
          </Link>
          <p className="text-[#A1A1AA] text-xs font-sans mt-0.5">
            Disimpan {new Date(fav.createdAt).toLocaleDateString('id-ID')}
          </p>
        </div>
        {/* Remove button */}
        <button
          id={`remove-fav-${fav.gameId}`}
          onClick={handleRemove}
          disabled={removing}
          className="flex-shrink-0 text-[#A1A1AA] hover:text-[#EF4444] transition-colors duration-150 disabled:opacity-50"
          aria-label={`Hapus ${fav.game.title} dari favorit`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Favorites Page
// ─────────────────────────────────────────────
export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading]     = useState(true);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login');
    }
  }, [user, authLoading, router]);

  // Fetch favorites
  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const res  = await fetch('/api/favorites');
        const data = await res.json();
        setFavorites(data.favorites ?? []);
      } catch {
        /* silently fail */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const handleRemove = (gameId) => {
    setFavorites(prev => prev.filter(f => f.gameId !== gameId));
  };

  if (authLoading || (!user && !authLoading)) return <PageLoader />;

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      {/* ── Header ── */}
      <div className="flex items-baseline gap-3 mb-8">
        <h1 className="font-heading font-semibold text-white text-2xl">Favorit Saya</h1>
        {!loading && (
          <span className="text-[#A1A1AA] text-sm font-sans">
            {favorites.length} game tersimpan
          </span>
        )}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} className="pb-[60%]" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
          <span className="text-6xl"></span>
          <div className="space-y-1">
            <p className="text-white font-semibold font-sans text-lg">Belum ada game tersimpan</p>
            <p className="text-[#A1A1AA] text-sm font-sans">
              Jelajahi katalog dan tekan tombol "Simpan" untuk menambahkan game favoritmu.
            </p>
          </div>
          <Link
            href="/"
            className="mt-2 px-5 py-2.5 bg-white text-[#121212] text-sm font-semibold font-sans rounded-[8px] hover:bg-[#E5E5E5] transition-colors duration-150"
          >
            Jelajahi Katalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {favorites.map(fav => (
            <FavCard key={fav.id} fav={fav} onRemove={handleRemove} />
          ))}
        </div>
      )}
    </div>
  );
}
