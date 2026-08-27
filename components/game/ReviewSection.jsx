// components/game/ReviewSection.jsx
// ─────────────────────────────────────────────
// Review Section for Game Detail Page
// - Review submission form (star rating + comment)
// - List of user reviews with muted gold stars
// ─────────────────────────────────────────────
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import StarRating from '@/components/ui/StarRating';
import Link from 'next/link';
import { Spinner } from '@/components/ui/LoadingSpinner';

// ── Format Date Helper ────────────────────────
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

// ── Individual Review Card ────────────────────
function ReviewCard({ review }) {
  const [translatedText, setTranslatedText] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslated, setShowTranslated] = useState(false);

  const handleTranslate = async () => {
    if (translatedText) {
      setShowTranslated(!showTranslated);
      return;
    }
    setIsTranslating(true);
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=id&dt=t&q=${encodeURIComponent(review.comment)}`;
      const res = await fetch(url);
      const data = await res.json();
      const text = data[0].map(item => item[0]).join('');
      setTranslatedText(text);
      setShowTranslated(true);
    } catch (e) {
      console.error(e);
      alert('Gagal menerjemahkan teks.');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-card p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-[#262626] border border-[#2E2E2E] flex items-center justify-center text-white text-sm font-semibold font-sans flex-shrink-0">
            {review.user.username?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-white text-sm font-semibold font-sans leading-none">
                {review.user.username}
              </p>
              {review.isSteam && (
                <span className="text-[10px] font-sans px-1.5 py-0.5 rounded-sm bg-[#171A21] text-[#66C0F4] uppercase font-bold tracking-wide border border-[#1b2838]">STEAM</span>
              )}
              {review.isRawg && (
                <span className="text-[10px] font-sans px-1.5 py-0.5 rounded-sm bg-[#262626] text-[#A1A1AA] uppercase font-bold tracking-wide">RAWG</span>
              )}
            </div>
            <p className="text-[#A1A1AA] text-xs font-sans mt-1">{formatDate(review.createdAt)}</p>
          </div>
        </div>
        <StarRating rating={review.rating} size={14} />
      </div>
      <div>
        <p className="text-[#A1A1AA] text-sm font-sans leading-relaxed whitespace-pre-wrap line-clamp-6">
          {showTranslated ? translatedText : review.comment}
        </p>
        {(review.isSteam || review.isRawg) && (
          <button
            onClick={handleTranslate}
            disabled={isTranslating}
            className="text-xs font-sans text-[#EAB308] hover:text-white transition-colors mt-2 disabled:opacity-50 font-medium"
          >
            {isTranslating ? 'Menerjemahkan...' : showTranslated ? 'Lihat Teks Asli' : 'Terjemahkan ke Indonesia'}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Review Form ───────────────────────────────
function ReviewForm({ gameId, gameTitle, gameSlug, gameCover, onSuccess }) {
  const [rating, setRating]   = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (rating === 0) { setError('Pilih rating bintang.'); return; }
    if (!comment.trim()) { setError('Tulis komentar terlebih dahulu.'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: String(gameId),
          title: gameTitle,
          slug: gameSlug,
          coverUrl: gameCover,
          rating,
          comment: comment.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan ulasan.');
      setRating(0);
      setComment('');
      onSuccess(data.review);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-card p-5 space-y-4">
      <h4 className="text-white font-semibold font-sans text-sm">Tulis Ulasan</h4>

      {/* Star selector */}
      <div className="space-y-1.5">
        <label className="text-[#A1A1AA] text-xs font-sans">Rating</label>
        <StarRating rating={rating} onChange={setRating} size={24} />
      </div>

      {/* Comment textarea */}
      <div className="space-y-1.5">
        <label className="text-[#A1A1AA] text-xs font-sans">Komentar</label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
          placeholder="Bagikan pendapatmu tentang game ini..."
          className="w-full bg-[#121212] border border-[#2E2E2E] rounded-[8px] px-3 py-2.5 text-white text-sm font-sans placeholder-[#A1A1AA] resize-none outline-none focus:border-[#A1A1AA] transition-colors duration-150"
        />
      </div>

      {/* Error */}
      {error && <p className="text-[#EF4444] text-xs font-sans">{error}</p>}

      <button
        type="submit"
        id="submit-review-btn"
        disabled={loading}
        className="px-5 py-2.5 bg-white text-[#121212] text-sm font-semibold font-sans rounded-[8px] hover:bg-[#E5E5E5] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {loading && <Spinner size={14} />}
        {loading ? 'Menyimpan...' : 'Kirim Ulasan'}
      </button>
    </form>
  );
}

// ─────────────────────────────────────────────
// Main Review Section
// ─────────────────────────────────────────────
export default function ReviewSection({ gameId, gameTitle, gameSlug, gameCover }) {
  const { user } = useAuth();
  const [reviews, setReviews]   = useState([]);
  const [rating, setRating]     = useState({ average: 0, count: 0 });
  const [loading, setLoading]   = useState(true);

  const fetchReviews = useCallback(async () => {
    try {
      const res  = await fetch(`/api/reviews?gameId=${gameId}`);
      const data = await res.json();
      setReviews(data.reviews ?? []);
      setRating(data.rating ?? { average: 0, count: 0 });
    } catch {
      /* silently fail */
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleNewReview = (newReview) => {
    setReviews(prev => {
      // Replace existing or prepend
      const idx = prev.findIndex(r => r.userId === newReview.userId);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = newReview;
        return updated;
      }
      return [newReview, ...prev];
    });
    fetchReviews(); // Refresh average
  };

  return (
    <section className="mt-10 space-y-6" id="reviews">
      {/* ── Section Header ── */}
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-white text-xl">
          Ulasan Pengguna
        </h3>
        {rating.count > 0 && (
          <div className="flex items-center gap-2 bg-[#1E1E1E] border border-[#2E2E2E] px-3 py-1.5 rounded-[8px]">
            <StarRating rating={Math.round(rating.average)} size={14} />
            <span className="text-white text-sm font-semibold font-sans">
              {rating.average.toFixed(1)}
            </span>
            <span className="text-[#A1A1AA] text-xs font-sans">
              ({rating.count} ulasan)
            </span>
          </div>
        )}
      </div>

      {/* ── Review Form or Login Prompt ── */}
      {user ? (
        <ReviewForm
          gameId={gameId}
          gameTitle={gameTitle}
          gameSlug={gameSlug}
          gameCover={gameCover}
          onSuccess={handleNewReview}
        />
      ) : (
        <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-card p-5 text-center space-y-2">
          <p className="text-[#A1A1AA] text-sm font-sans">
            <Link href="/auth/login" className="text-white font-semibold hover:underline">Masuk</Link>
            {' '}untuk menulis ulasan.
          </p>
        </div>
      )}

      {/* ── Reviews List ── */}
      {loading ? (
        <div className="flex justify-center py-8"><Spinner size={28} /></div>
      ) : reviews.length === 0 ? (
        <p className="text-[#A1A1AA] text-sm font-sans text-center py-6">
          Belum ada ulasan. Jadilah yang pertama!
        </p>
      ) : (
        <div className="space-y-3">
          {reviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </section>
  );
}
