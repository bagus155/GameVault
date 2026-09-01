// app/profile/page.jsx
// ─────────────────────────────────────────────
// Profile Page — Client Component Orchestrator
// Fetches profile data, manages modal state,
// redirects unauthenticated users to /auth/login.
// ─────────────────────────────────────────────
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ProfileHeader    from '@/components/profile/ProfileHeader';
import Top5Showcase     from '@/components/profile/Top5Showcase';
import EditProfileModal from '@/components/profile/EditProfileModal';
import { Spinner }         from '@/components/ui/LoadingSpinner';

export default function ProfilePage() {
  const router = useRouter();

  const [profile,         setProfile]         = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isEditModalOpen,  setIsEditModalOpen]  = useState(false);

  // ── Fetch profile on mount ─────────────────
  const fetchProfile = useCallback(async () => {
    setIsLoadingProfile(true);
    try {
      const res = await fetch('/api/profile');
      if (res.status === 401) {
        router.replace('/auth/login');
        return;
      }
      if (!res.ok) throw new Error('Gagal memuat profil.');
      const data = await res.json();
      setProfile(data.profile);
    } catch (err) {
      console.error('[ProfilePage] fetchProfile:', err.message);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [router]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // ── Modal handlers ─────────────────────────
  const handleOpenEditModal  = useCallback(() => setIsEditModalOpen(true),  []);
  const handleCloseEditModal = useCallback(() => setIsEditModalOpen(false), []);

  const handleSaveSuccess = useCallback((updatedProfile) => {
    setProfile(updatedProfile);
    setIsEditModalOpen(false);
  }, []);

  // ── Loading state ──────────────────────────
  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60dvh]">
        <Spinner size={40} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60dvh] gap-3">
        <p className="text-[#A1A1AA] font-sans text-sm">Gagal memuat profil.</p>
        <button
          onClick={fetchProfile}
          className="text-white text-sm font-semibold font-sans underline hover:no-underline"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-screen-md mx-auto animate-fade-in">
        {/* ── Profile Header ── */}
        <ProfileHeader
          profile={profile}
          onOpenEditModal={handleOpenEditModal}
        />

        {/* ── Top 5 Showcase ── */}
        <Top5Showcase
          topGames={profile.topGames ?? []}
          onOpenEditModal={handleOpenEditModal}
        />
      </div>

      {/* ── Edit Modal ── */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        profile={profile}
        onClose={handleCloseEditModal}
        onSaveSuccess={handleSaveSuccess}
      />
    </>
  );
}
