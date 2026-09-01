// components/profile/useProfileEditor.js
// ─────────────────────────────────────────────
// Custom Hook: Profile Edit Modal State & Logic
// Handles file selection (avatar/banner), object URL previews,
// file upload to /api/profile/upload, and final profile PUT.
// ─────────────────────────────────────────────
'use client';
import { useState, useCallback, useEffect } from 'react';

const MAX_TOP_GAMES = 5;

/**
 * Upload a single image file to the server.
 * Returns the public URL string on success.
 * @param {File}   file
 * @param {'avatar'|'banner'} type
 * @returns {Promise<string>}
 */
async function uploadImageFile(file, type) {
  const body = new FormData();
  body.append('file', file);
  body.append('type', type);

  const res  = await fetch('/api/profile/upload', { method: 'POST', body });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload gagal.');
  return data.url;
}

/**
 * @param {Object}   initialProfile - Profile data from server
 * @param {Function} onSaveSuccess  - Callback with updated profile after save
 */
export function useProfileEditor(initialProfile, onSaveSuccess) {
  const [bio, setBio] = useState(initialProfile?.bio ?? '');

  // Preview URLs shown in the UI (either existing remote URL or local blob URL)
  const [avatarPreview, setAvatarPreview] = useState(initialProfile?.avatarUrl ?? '');
  const [bannerPreview, setBannerPreview] = useState(initialProfile?.bannerUrl ?? '');

  // Pending File objects selected by the user (null = no change)
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  // Cleanup blob URLs when component unmounts
  useEffect(() => {
    return () => {
      if (avatarFile) URL.revokeObjectURL(avatarPreview);
      if (bannerFile) URL.revokeObjectURL(bannerPreview);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [selectedTopGames, setSelectedTopGames] = useState(
    () => initialProfile?.topGames?.map(entry => entry.game) ?? []
  );

  const [activeTab,    setActiveTab]    = useState('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError,  setSubmitError]  = useState(null);

  // ── File selection: avatar ─────────────────
  const handleAvatarFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }, []);

  // ── File selection: banner ─────────────────
  const handleBannerFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  }, []);

  // ── Remove selected avatar ─────────────────
  const handleClearAvatar = useCallback(() => {
    setAvatarFile(null);
    setAvatarPreview('');
  }, []);

  // ── Remove selected banner ─────────────────
  const handleClearBanner = useCallback(() => {
    setBannerFile(null);
    setBannerPreview('');
  }, []);

  // ── Bio change ─────────────────────────────
  const handleBioChange = useCallback((e) => {
    setBio(e.target.value);
  }, []);

  // ── Top 5 handlers ─────────────────────────
  const handleSelectTopGame = useCallback((game) => {
    setSelectedTopGames(prev => {
      if (prev.find(g => g.id === game.id)) return prev;
      if (prev.length >= MAX_TOP_GAMES) return prev;
      return [...prev, game];
    });
  }, []);

  const handleRemoveTopGame = useCallback((gameId) => {
    setSelectedTopGames(prev => prev.filter(g => g.id !== gameId));
  }, []);

  const handleMoveGame = useCallback((gameId, direction) => {
    setSelectedTopGames(prev => {
      const index = prev.findIndex(g => g.id === gameId);
      if (index === -1) return prev;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  }, []);

  // ── Submit: upload files then save profile ──
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Upload new files in parallel (only if a new file was selected)
      const [newAvatarUrl, newBannerUrl] = await Promise.all([
        avatarFile ? uploadImageFile(avatarFile, 'avatar') : Promise.resolve(null),
        bannerFile ? uploadImageFile(bannerFile, 'banner') : Promise.resolve(null),
      ]);

      const payload = {
        avatarUrl: newAvatarUrl ?? initialProfile?.avatarUrl ?? null,
        bannerUrl: newBannerUrl ?? initialProfile?.bannerUrl ?? null,
        bio:       bio || null,
        topGames:  selectedTopGames.map((game, i) => ({ gameId: game.id, position: i + 1 })),
      };

      // Override with empty string to clear if user explicitly cleared
      if (!avatarPreview && !avatarFile) payload.avatarUrl = null;
      if (!bannerPreview && !bannerFile) payload.bannerUrl = null;

      const res  = await fetch('/api/profile', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan profil.');

      onSaveSuccess(data.profile);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [avatarFile, bannerFile, avatarPreview, bannerPreview, bio, selectedTopGames, initialProfile, onSaveSuccess]);

  return {
    bio,
    avatarPreview,
    bannerPreview,
    selectedTopGames,
    activeTab,
    isSubmitting,
    submitError,
    setActiveTab,
    handleBioChange,
    handleAvatarFileChange,
    handleBannerFileChange,
    handleClearAvatar,
    handleClearBanner,
    handleSelectTopGame,
    handleRemoveTopGame,
    handleMoveGame,
    handleSubmit,
  };
}
