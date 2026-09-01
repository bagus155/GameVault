// components/profile/ProfileHeader.jsx
// ─────────────────────────────────────────────
// Profile Header — Server Component
// Displays banner, square avatar (overlapping banner),
// user info, and the "Edit Profil" action button.
// ─────────────────────────────────────────────
import Image from 'next/image';

/**
 * @param {Object}   props
 * @param {Object}   props.profile        - User profile data
 * @param {Function} props.onOpenEditModal - Client-side callback to open modal
 */
export default function ProfileHeader({ profile, onOpenEditModal }) {
  const joinDate = new Date(profile.createdAt).toLocaleDateString('id-ID', {
    year:  'numeric',
    month: 'long',
    day:   'numeric',
  });

  return (
    <div className="w-full">
      {/* ── Banner ── */}
      <div className="relative w-full aspect-[3/1] bg-[#161616] overflow-hidden rounded-none sm:rounded-xl border-b border-[#2A2A2A]">
        {profile.bannerUrl && (
          <Image
            src={profile.bannerUrl}
            alt="Profile banner"
            fill
            className="object-cover"
            unoptimized
            priority
          />
        )}
      </div>

      {/* ── Avatar + Info Row ── */}
      <div className="px-4 sm:px-6 pb-5">
        <div className="flex items-end justify-between gap-4 -mt-10 sm:-mt-12">

          {/* Square Avatar — overlaps banner bottom */}
          <div
            className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0
                        aspect-square rounded-2xl border-4 border-[#121212]
                        overflow-hidden bg-[#2A2A2A]"
          >
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={profile.username}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#2A2A2A]">
                <svg className="w-12 h-12 text-[#A1A1AA]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            )}
          </div>

          {/* Edit Button */}
          <button
            id="btn-open-edit-profile"
            onClick={onOpenEditModal}
            className="mb-1 px-4 py-2 text-sm font-semibold font-sans
                       bg-[#1E1E1E] text-white border border-[#2A2A2A]
                       rounded-lg hover:border-[#3A3A3A] hover:bg-[#262626]
                       transition-all duration-150 active:scale-95"
          >
            Edit Profil & Top 5
          </button>
        </div>

        {/* ── User Info ── */}
        <div className="mt-3 space-y-1">
          <h1 className="text-xl sm:text-2xl font-semibold font-sans text-white leading-tight">
            {profile.username}
          </h1>

          {profile.bio && (
            <p className="text-sm text-[#A1A1AA] font-sans max-w-lg leading-relaxed">
              {profile.bio}
            </p>
          )}

          <p className="text-xs text-[#A1A1AA] font-sans pt-0.5">
            Bergabung sejak{' '}
            <time dateTime={profile.createdAt} className="text-white">
              {joinDate}
            </time>
          </p>
        </div>
      </div>
    </div>
  );
}
