// components/game/ReviewSection.jsx
// ─────────────────────────────────────────────
// Review Section for Game Detail Page
// - Jika sudah review: tampilkan ulasan sendiri dengan menu ⋯ (edit/hapus)
// - Jika belum review: tampilkan form (bintang + komentar)
// ─────────────────────────────────────────────
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import StarRating from '@/components/ui/StarRating';
import Link from 'next/link';
import { Spinner } from '@/components/ui/LoadingSpinner';

// ── Custom Confirm Modal ──────────────────────
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      {/* Panel */}
      <div className="relative bg-[#1E1E1E] border border-[#2E2E2E] rounded-[12px] shadow-2xl w-full max-w-sm p-6 space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 flex-shrink-0 rounded-full bg-[#EF4444]/10 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-[#EF4444]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <div>
            <h4 className="text-white font-semibold font-sans text-sm">Hapus Ulasan</h4>
            <p className="text-[#A1A1AA] text-sm font-sans mt-1 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-sans font-medium text-[#A1A1AA] hover:text-white bg-[#262626] hover:bg-[#2E2E2E] rounded-[8px] transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-sans font-semibold text-white bg-[#EF4444] hover:bg-[#DC2626] rounded-[8px] transition-colors"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Format Date Helper ────────────────────────
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

// ── Individual Review Card ────────────────────
function ReviewCard({ review, isOwn = false, onEdit, onDelete }) {
  const [translatedText, setTranslatedText] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslated, setShowTranslated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <div className={`bg-[#1E1E1E] border rounded-card p-4 space-y-2 ${isOwn ? 'border-[#EAB308]/40' : 'border-[#2E2E2E]'}`}>
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
              {isOwn && (
                <span className="text-[10px] font-sans px-1.5 py-0.5 rounded-sm bg-[#EAB308]/10 text-[#EAB308] uppercase font-bold tracking-wide border border-[#EAB308]/30">Ulasan Saya</span>
              )}
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

        {/* Right side: stars + owner menu */}
        <div className="flex items-center gap-2">
          <StarRating rating={review.rating} size={14} />
          {isOwn && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="w-7 h-7 flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-[#2E2E2E] rounded-[6px] transition-colors"
                aria-label="Menu ulasan"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-8 z-20 bg-[#1E1E1E] border border-[#2E2E2E] rounded-[8px] shadow-xl overflow-hidden min-w-[130px]">
                  <button
                    onClick={() => { setMenuOpen(false); onEdit(review); }}
                    className="w-full text-left px-4 py-2.5 text-sm font-sans text-white hover:bg-[#262626] flex items-center gap-2 transition-colors"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    Edit Ulasan
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onDelete(review.id); }}
                    className="w-full text-left px-4 py-2.5 text-sm font-sans text-[#EF4444] hover:bg-[#262626] flex items-center gap-2 transition-colors"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    Hapus Ulasan
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
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

// ── Review Form (new + edit mode) ─────────────
function ReviewForm({ gameId, gameTitle, gameSlug, gameCover, onSuccess, editReview, onCancelEdit }) {
  const isEdit = !!editReview;
  const [rating, setRating]   = useState(isEdit ? editReview.rating : 0);
  const [comment, setComment] = useState(isEdit ? editReview.comment : '');
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
      onSuccess(data.review);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-white font-semibold font-sans text-sm">
          {isEdit ? 'Edit Ulasan' : 'Tulis Ulasan'}
        </h4>
        {isEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-xs font-sans text-[#A1A1AA] hover:text-white transition-colors"
          >
            Batal
          </button>
        )}
      </div>

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
        {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Kirim Ulasan'}
      </button>
    </form>
  );
}

// ─────────────────────────────────────────────
// Main Review Section
// ─────────────────────────────────────────────
export default function ReviewSection({ gameId, gameTitle, gameSlug, gameCover }) {
  const { user } = useAuth();
  const [reviews, setReviews]     = useState([]);
  const [rating, setRating]       = useState({ average: 0, count: 0 });
  const [loading, setLoading]     = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // reviewId to delete

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

  // Find own review (local reviews only — have a numeric id and userId)
  const myReview = user
    ? reviews.find(r => !r.isRawg && !r.isSteam && r.user?.username === user.username)
    : null;

  const handleNewReview = (newReview) => {
    setEditingReview(null);
    fetchReviews();
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    window.scrollTo({ top: document.getElementById('reviews')?.offsetTop - 80, behavior: 'smooth' });
  };

  const handleDelete = async (reviewId) => {
    setConfirmDelete(reviewId);
  };

  const doDelete = async () => {
    const reviewId = confirmDelete;
    setConfirmDelete(null);
    try {
      const res = await fetch(`/api/reviews?reviewId=${reviewId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Gagal menghapus ulasan.');
        return;
      }
      fetchReviews();
    } catch {
      alert('Gagal menghapus ulasan.');
    }
  };

  return (
    <section className="mt-10 space-y-6" id="reviews">
      {/* ── Custom Confirm Modal ── */}
      {confirmDelete && (
        <ConfirmModal
          message="Ulasan ini akan dihapus secara permanen. Aksi ini tidak bisa dibatalkan."
          onConfirm={doDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
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

      {/* ── Review Form or My Review or Login Prompt ── */}
      {!user ? (
        <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-card p-5 text-center space-y-2">
          <p className="text-[#A1A1AA] text-sm font-sans">
            <Link href="/auth/login" className="text-white font-semibold hover:underline">Masuk</Link>
            {' '}untuk menulis ulasan.
          </p>
        </div>
      ) : myReview && !editingReview ? (
        // User already reviewed — show their card with menu, no form
        <ReviewCard
          review={myReview}
          isOwn={true}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        // No review yet, or in edit mode
        <ReviewForm
          gameId={gameId}
          gameTitle={gameTitle}
          gameSlug={gameSlug}
          gameCover={gameCover}
          onSuccess={handleNewReview}
          editReview={editingReview}
          onCancelEdit={() => setEditingReview(null)}
        />
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
            <ReviewCard
              key={review.id}
              review={review}
              isOwn={false}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          ))}
        </div>
      )}
    </section>
  );
}
