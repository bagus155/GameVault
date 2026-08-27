// components/ui/StarRating.jsx
// ─────────────────────────────────────────────
// Reusable Star Rating Component
// - Display mode (read-only) and Interactive mode
// - Muted Gold color (#EAB308) — NO neon yellow
// - Supports half-display for average ratings
// ─────────────────────────────────────────────
'use client';
import { useState } from 'react';

/**
 * @param {Object} props
 * @param {number}   props.rating       - Current rating value (1–5)
 * @param {Function} props.onChange     - Called with new rating; if absent, renders read-only
 * @param {number}   props.size         - Star size in pixels (default: 20)
 * @param {boolean}  props.showValue    - Show numeric value label
 */
export default function StarRating({ rating = 0, onChange, size = 20, showValue = false }) {
  const [hovered, setHovered] = useState(0);
  const isInteractive = typeof onChange === 'function';
  const displayRating = isInteractive ? (hovered || rating) : rating;

  return (
    <div className="flex items-center gap-1" role={isInteractive ? 'radiogroup' : 'img'} aria-label={`Rating: ${rating} dari 5`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(displayRating);
        return (
          <button
            key={star}
            type="button"
            disabled={!isInteractive}
            onClick={() => isInteractive && onChange(star)}
            onMouseEnter={() => isInteractive && setHovered(star)}
            onMouseLeave={() => isInteractive && setHovered(0)}
            aria-label={`${star} bintang`}
            className={`leading-none transition-transform duration-100 ${
              isInteractive
                ? 'cursor-pointer hover:scale-110 active:scale-95'
                : 'cursor-default'
            } ${!isInteractive ? 'pointer-events-none' : ''}`}
            style={{ fontSize: size }}
          >
            <StarIcon filled={filled} size={size} />
          </button>
        );
      })}

      {showValue && (
        <span className="ml-1 text-sm font-medium text-[#A1A1AA] font-sans">
          {rating > 0 ? rating.toFixed(1) : '—'}
        </span>
      )}
    </div>
  );
}

// ── SVG Star ──────────────────────────────────
function StarIcon({ filled, size }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? '#EAB308' : 'none'}
      stroke={filled ? '#EAB308' : '#3A3A3A'}
      strokeWidth={1.5}
      style={{ display: 'block' }}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  );
}
