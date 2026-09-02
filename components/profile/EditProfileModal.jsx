// components/profile/EditProfileModal.jsx
// ─────────────────────────────────────────────
// Edit Profile Modal — Client Component
// Tab 1: Upload avatar/banner (file picker) + bio
// Tab 2: Select & order Top 5 from favorites
// ─────────────────────────────────────────────
'use client';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { useProfileEditor } from './useProfileEditor';

// ── Sub-component: Tab switcher ───────────────
function ModalTabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'profile', label: 'Edit Profil' },
    { id: 'top5',    label: 'Atur Top 5' },
  ];
  return (
    <div className="flex border-b border-[#2A2A2A] mb-6">
      {tabs.map(tab => (
        <button
          key={tab.id}
          id={`modal-tab-${tab.id}`}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-3 text-sm font-semibold font-sans transition-colors duration-150
            ${activeTab === tab.id
              ? 'text-white border-b-2 border-white -mb-px'
              : 'text-[#A1A1AA] hover:text-white'
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ── Sub-component: File drop zone ─────────────
function ImageUploadZone({ id, label, aspectClass, previewUrl, onFileChange, onClear, accept = 'image/*' }) {
  const inputRef = useRef(null);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold font-sans text-[#A1A1AA] uppercase tracking-wide">
          {label}
        </label>
        {previewUrl && (
          <button
            type="button"
            onClick={onClear}
            className="text-[10px] text-[#A1A1AA] hover:text-red-400 font-sans transition-colors"
          >
            Hapus
          </button>
        )}
      </div>

      <div
        id={id}
        onClick={() => inputRef.current?.click()}
        className={`relative w-full ${aspectClass} bg-[#262626] border border-dashed border-[#2A2A2A]
                    rounded-xl overflow-hidden cursor-pointer group
                    hover:border-[#3A3A3A] hover:bg-[#2A2A2A] transition-all duration-150`}
      >
        {previewUrl ? (
          <>
            <Image
              src={previewUrl}
              alt={label}
              fill
              className="object-cover"

            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center">
              <span className="text-white text-xs font-semibold font-sans">Ganti Foto</span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#A1A1AA] group-hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span className="text-xs font-sans text-center px-4 leading-tight">
              Klik untuk pilih foto<br />
              <span className="text-[10px] text-[#A1A1AA]">JPG, PNG, WebP • Maks 5 MB</span>
            </span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={onFileChange}
        className="hidden"
        aria-label={label}
      />
    </div>
  );
}

// ── Tab 1: Profile form ───────────────────────
function ProfileFormTab({ bio, avatarPreview, bannerPreview, onBioChange, onAvatarChange, onBannerChange, onClearAvatar, onClearBanner }) {
  return (
    <div className="space-y-5">
      {/* Avatar */}
      <ImageUploadZone
        id="upload-zone-avatar"
        label="Foto Profil"
        aspectClass="aspect-square max-w-[120px]"
        previewUrl={avatarPreview}
        onFileChange={onAvatarChange}
        onClear={onClearAvatar}
      />

      {/* Banner */}
      <ImageUploadZone
        id="upload-zone-banner"
        label="Foto Banner"
        aspectClass="aspect-[3/1]"
        previewUrl={bannerPreview}
        onFileChange={onBannerChange}
        onClear={onClearBanner}
      />

      {/* Bio */}
      <div className="space-y-1.5">
        <label htmlFor="input-bio" className="block text-xs font-semibold font-sans text-[#A1A1AA] uppercase tracking-wide">
          Bio
        </label>
        <div className="relative">
          <textarea
            id="input-bio"
            name="bio"
            rows={3}
            maxLength={160}
            placeholder="Ceritakan sedikit tentang dirimu…"
            value={bio}
            onChange={onBioChange}
            className="w-full bg-[#262626] text-white text-sm font-sans border border-[#2A2A2A]
                       rounded-lg px-3 py-2.5 placeholder-[#A1A1AA] focus:outline-none
                       focus:border-[#3A3A3A] transition-colors duration-150 resize-none"
          />
          <span className="absolute bottom-2 right-3 text-[10px] text-[#A1A1AA] font-sans select-none">
            {bio.length}/160
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Sub-component: Ordered Top 5 list ─────────
function SelectedGamesList({ games, onRemove, onMove }) {
  if (games.length === 0) {
    return (
      <p className="text-[#A1A1AA] text-sm font-sans text-center py-6">
        Belum ada game yang dipilih.
      </p>
    );
  }
  return (
    <ol className="space-y-2">
      {games.map((game, index) => (
        <li
          key={game.id}
          className="flex items-center gap-3 bg-[#262626] border border-[#2A2A2A] rounded-lg px-3 py-2 animate-fade-in"
        >
          <span className="text-xs font-bold font-sans text-[#A1A1AA] w-5 text-center flex-shrink-0">
            #{index + 1}
          </span>
          <div className="relative w-8 h-8 rounded overflow-hidden bg-[#1E1E1E] flex-shrink-0">
            {game.coverUrl
              ? <Image src={game.coverUrl.includes('|') ? game.coverUrl.split('|')[0] || game.coverUrl.split('|')[1] : game.coverUrl} alt={game.title} fill className="object-cover"/>
              : <span className="absolute inset-0 flex items-center justify-center text-sm select-none">🎮</span>
            }
          </div>
          <span className="flex-1 text-white text-xs font-sans font-medium leading-snug line-clamp-1">
            {game.title}
          </span>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => onMove(game.id, 'up')}  disabled={index === 0}               aria-label="Ke atas"   className="p-1 text-[#A1A1AA] hover:text-white disabled:opacity-30 transition-colors">▲</button>
            <button onClick={() => onMove(game.id, 'down')} disabled={index === games.length - 1} aria-label="Ke bawah" className="p-1 text-[#A1A1AA] hover:text-white disabled:opacity-30 transition-colors">▼</button>
            <button onClick={() => onRemove(game.id)} aria-label="Hapus" className="p-1 text-[#A1A1AA] hover:text-red-400 transition-colors ml-1">✕</button>
          </div>
        </li>
      ))}
    </ol>
  );
}

// ── Sub-component: Favorites picker ───────────
function FavoritesPicker({ favorites, selectedTopGames, onSelect }) {
  const selectedIds  = new Set(selectedTopGames.map(g => g.id));
  const isMaxReached = selectedTopGames.length >= 5;
  const available    = favorites.filter(fav => !selectedIds.has(fav.game.id));

  if (favorites.length === 0) {
    return (
      <p className="text-[#A1A1AA] text-sm font-sans text-center py-4">
        Kamu belum punya game favorit. Tambahkan dulu di halaman game!
      </p>
    );
  }
  if (available.length === 0) return null;

  return (
    <div>
      <p className="text-xs text-[#A1A1AA] font-sans mb-2">
        Pilih dari favorit {isMaxReached ? '(slot penuh)' : `(${5 - selectedTopGames.length} slot tersisa)`}:
      </p>
      <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
        {available.map(fav => (
          <button
            key={fav.game.id}
            onClick={() => !isMaxReached && onSelect(fav.game)}
            disabled={isMaxReached}
            className={`flex items-center gap-2 bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg px-2 py-2 text-left
                       transition-all duration-150
                       ${isMaxReached ? 'opacity-40 cursor-not-allowed' : 'hover:border-[#3A3A3A] hover:bg-[#262626] cursor-pointer'}`}
          >
            <div className="relative w-8 h-8 rounded flex-shrink-0 overflow-hidden bg-[#262626]">
              {fav.game.coverUrl
                ? <Image src={fav.game.coverUrl.includes('|') ? (fav.game.coverUrl.split('|')[1] || fav.game.coverUrl.split('|')[0]) : fav.game.coverUrl} alt={fav.game.title} fill className="object-cover"/>
                : <span className="absolute inset-0 flex items-center justify-center text-sm select-none">🎮</span>
              }
            </div>
            <span className="text-[11px] text-white font-sans leading-tight line-clamp-2">{fav.game.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Tab 2: Top 5 selector ─────────────────────
function Top5SelectorTab({ selectedTopGames, favorites, onSelect, onRemove, onMove }) {
  return (
    <div className="space-y-5">
      <SelectedGamesList games={selectedTopGames} onRemove={onRemove} onMove={onMove} />
      <FavoritesPicker favorites={favorites} selectedTopGames={selectedTopGames} onSelect={onSelect} />
    </div>
  );
}

// ── Main Modal ────────────────────────────────
/**
 * @param {boolean}  isOpen
 * @param {Object}   profile       - Current profile from server
 * @param {Function} onClose
 * @param {Function} onSaveSuccess - Receives updated profile after save
 */
export default function EditProfileModal({ isOpen, profile, onClose, onSaveSuccess }) {
  const {
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
  } = useProfileEditor(profile, onSaveSuccess);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <div
        id="edit-profile-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Edit Profil"
        className="relative w-full max-w-lg bg-[#1E1E1E] border border-[#2A2A2A]
                   rounded-2xl shadow-2xl animate-scale-up max-h-[90dvh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0 flex-shrink-0">
          <h2 className="text-base font-semibold font-sans text-white">Edit Profil</h2>
          <button
            id="btn-close-edit-modal"
            onClick={onClose}
            aria-label="Tutup modal"
            className="text-[#A1A1AA] hover:text-white transition-colors p-1 -mr-1"
          >✕</button>
        </div>

        {/* Tabs */}
        <div className="px-6 flex-shrink-0">
          <ModalTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Content */}
        <div className="px-6 overflow-y-auto flex-1 pb-4">
          {activeTab === 'profile' ? (
            <ProfileFormTab
              bio={bio}
              avatarPreview={avatarPreview}
              bannerPreview={bannerPreview}
              onBioChange={handleBioChange}
              onAvatarChange={handleAvatarFileChange}
              onBannerChange={handleBannerFileChange}
              onClearAvatar={handleClearAvatar}
              onClearBanner={handleClearBanner}
            />
          ) : (
            <Top5SelectorTab
              selectedTopGames={selectedTopGames}
              favorites={profile?.favorites ?? []}
              onSelect={handleSelectTopGame}
              onRemove={handleRemoveTopGame}
              onMove={handleMoveGame}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#2A2A2A] flex-shrink-0">
          {submitError && (
            <p className="text-red-400 text-xs font-sans mb-3 text-center">{submitError}</p>
          )}
          <div className="flex gap-3 justify-end">
            <button
              id="btn-cancel-edit-profile"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold font-sans text-[#A1A1AA] hover:text-white transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              id="btn-save-profile"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold font-sans text-black bg-white rounded-lg
                         hover:bg-[#E0E0E0] disabled:opacity-60 disabled:cursor-not-allowed
                         transition-all duration-150 active:scale-95 min-w-[90px]"
            >
              {isSubmitting ? 'Menyimpan…' : 'Simpan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
