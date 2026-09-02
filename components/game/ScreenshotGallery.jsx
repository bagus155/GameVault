// components/game/ScreenshotGallery.jsx
// ─────────────────────────────────────────────
// Screenshot Gallery Slider (Client Component)
// - Horizontal scroll with prev/next arrows
// - Click to open full-size lightbox
// - Solid #1E1E1E backgrounds only
// - Images: HD quality via RAWG CDN resize + Next.js AVIF/WebP
// ─────────────────────────────────────────────
'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { getOptimizedImageUrl, getOptimizedThumbnailUrl } from '@/utils/imageOptimizer';

function ChevronLeft() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

/**
 * @param {Object}   props
 * @param {Object[]} props.screenshots - Array of { id, image } from RAWG
 */
export default function ScreenshotGallery({ screenshots = [] }) {
  const [lightbox, setLightbox] = useState(null);
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  if (!screenshots.length) return null;

  return (
    <>
      {/* ── Gallery ── */}
      <div className="relative group">
        {/* Prev Arrow */}
        <button
          onClick={() => scroll(-1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-[#1E1E1E] border border-[#2E2E2E] rounded-full flex items-center justify-center text-white hover:bg-[#262626] transition-colors opacity-0 group-hover:opacity-100 duration-150"
          aria-label="Previous screenshot"
        >
          <ChevronLeft />
        </button>

        {/* Scroll Container */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-none"
          style={{ scrollbarWidth: 'none' }}
        >
          {screenshots.map((ss, i) => (
            <button
              key={ss.id}
              onClick={() => setLightbox(i)}
              className="flex-shrink-0 relative rounded-[8px] overflow-hidden bg-[#262626] border border-[#2E2E2E] hover:border-[#A1A1AA] transition-colors duration-150"
              style={{ width: '280px', height: '158px' }}
              aria-label={`Screenshot ${i + 1}`}
            >
              <Image
                src={getOptimizedThumbnailUrl(ss.image)}
                alt={`Screenshot ${i + 1}`}
                fill
                unoptimized
                quality={100}
                sizes="280px"
                className="object-cover"
              />
            </button>
          ))}
        </div>

        {/* Next Arrow */}
        <button
          onClick={() => scroll(1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-[#1E1E1E] border border-[#2E2E2E] rounded-full flex items-center justify-center text-white hover:bg-[#262626] transition-colors opacity-0 group-hover:opacity-100 duration-150"
          aria-label="Next screenshot"
        >
          <ChevronRight />
        </button>
      </div>

      {/* ── Lightbox ── */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-[#121212] bg-opacity-95 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <Image
              src={getOptimizedImageUrl(screenshots[lightbox].image)}
              alt={`Screenshot ${lightbox + 1}`}
              width={1280}
              height={720}
              quality={90}
              className="w-full rounded-card object-contain"
            />
            {/* Close */}
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-3 right-3 w-8 h-8 bg-[#1E1E1E] border border-[#2E2E2E] rounded-full flex items-center justify-center text-[#A1A1AA] hover:text-white transition-colors"
              aria-label="Close lightbox"
            >
              ✕
            </button>
            {/* Prev / Next in lightbox */}
            <div className="flex justify-between mt-3">
              <button
                onClick={() => setLightbox(i => Math.max(0, i - 1))}
                disabled={lightbox === 0}
                className="flex items-center gap-1 text-xs text-[#A1A1AA] hover:text-white disabled:opacity-30 font-sans"
              >
                <ChevronLeft /> Sebelumnya
              </button>
              <span className="text-xs text-[#A1A1AA] font-sans">
                {lightbox + 1} / {screenshots.length}
              </span>
              <button
                onClick={() => setLightbox(i => Math.min(screenshots.length - 1, i + 1))}
                disabled={lightbox === screenshots.length - 1}
                className="flex items-center gap-1 text-xs text-[#A1A1AA] hover:text-white disabled:opacity-30 font-sans"
              >
                Berikutnya <ChevronRight />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
