// components/ui/LoadingSpinner.jsx
// ─────────────────────────────────────────────
// Minimal solid-color loading indicators
// ─────────────────────────────────────────────

/** Circular spinner */
export function Spinner({ size = 24, className = '' }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12" cy="12" r="10"
        stroke="#2E2E2E"
        strokeWidth="3"
      />
      <path
        d="M12 2a10 10 0 0110 10"
        stroke="#EAB308"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Full-page loading overlay */
export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Spinner size={40} />
    </div>
  );
}

/** Skeleton card for masonry placeholder */
export function SkeletonCard({ className = '', height = '140%' }) {
  return (
    <div className={`bg-[#1E1E1E] rounded-card overflow-hidden break-inside-avoid ${className}`}>
      <div className="w-full bg-[#262626] animate-pulse" style={{ paddingBottom: height }} />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-[#262626] rounded animate-pulse w-3/4" />
        <div className="h-2.5 bg-[#262626] rounded animate-pulse w-1/2" />
      </div>
    </div>
  );
}
