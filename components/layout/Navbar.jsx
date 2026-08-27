'use client';
// components/layout/Navbar.jsx
// ─────────────────────────────────────────────
// Clean Header Navbar
// - Solid #1E1E1E background, no gradients
// - Left: GameVault logo
// - Center: Search bar
// - Right: Guest (Login/Register) or Auth (Profile dropdown)
// ─────────────────────────────────────────────
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// ── Search Icon ───────────────────────────────
function SearchIcon() {
  return (
    <svg className="w-4 h-4 text-[#A1A1AA]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M16.5 10.5a6 6 0 11-12 0 6 6 0 0112 0z" />
    </svg>
  );
}

// ── Chevron Down ──────────────────────────────
function ChevronIcon({ open }) {
  return (
    <svg
      className={`w-3.5 h-3.5 text-[#A1A1AA] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// ── User Icon ─────────────────────────────────
function UserIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

// ── Heart Icon ────────────────────────────────
function HeartIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

// ── Logout Icon ───────────────────────────────
function LogoutIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

// ─────────────────────────────────────────────
// Profile Dropdown
// ─────────────────────────────────────────────
function ProfileDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        id="profile-dropdown-btn"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-[8px] bg-[#262626] hover:bg-[#2E2E2E] transition-colors duration-150"
      >
        {/* Avatar circle */}
        <div className="w-7 h-7 rounded-full bg-[#3A3A3A] flex items-center justify-center text-white text-xs font-semibold font-sans">
          {user.username?.[0]?.toUpperCase() ?? 'U'}
        </div>
        <span className="text-white text-sm font-medium font-sans hidden sm:block max-w-[120px] truncate">
          {user.username}
        </span>
        <ChevronIcon open={open} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-[#1E1E1E] border border-[#2E2E2E] rounded-[10px] shadow-xl z-50 overflow-hidden animate-fade-in">
          <div className="px-4 py-3 border-b border-[#2E2E2E]">
            <p className="text-white text-sm font-semibold font-sans truncate">{user.username}</p>
            <p className="text-[#A1A1AA] text-xs font-sans mt-0.5 truncate">{user.email}</p>
          </div>
          <Link
            href="/favorites"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#A1A1AA] hover:text-white hover:bg-[#262626] transition-colors duration-150 font-sans"
          >
            <HeartIcon />
            Favorit Saya
          </Link>
          <button
            id="logout-btn"
            onClick={() => { setOpen(false); onLogout(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#A1A1AA] hover:text-white hover:bg-[#262626] transition-colors duration-150 font-sans"
          >
            <LogoutIcon />
            Keluar
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Navbar
// ─────────────────────────────────────────────
export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [mobileSearch, setMobileSearch] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const searchRef = useRef(null);

  // Load history
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gamevault_search_history');
      if (saved) setHistory(JSON.parse(saved));
    } catch (e) {}
  }, []);

  // Click outside to close history
  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowHistory(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const saveToHistory = (term) => {
    if (!term) return;
    const newHistory = [term, ...history.filter(h => h !== term)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('gamevault_search_history', JSON.stringify(newHistory));
  };

  const removeHistoryItem = (term, e) => {
    e.stopPropagation();
    const newHistory = history.filter(h => h !== term);
    setHistory(newHistory);
    localStorage.setItem('gamevault_search_history', JSON.stringify(newHistory));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    const term = query.trim();
    saveToHistory(term);
    router.push(`/?search=${encodeURIComponent(term)}`);
    setMobileSearch(false);
    setShowHistory(false);
  };

  const handleHistoryClick = (term) => {
    setQuery(term);
    saveToHistory(term);
    router.push(`/?search=${encodeURIComponent(term)}`);
    setMobileSearch(false);
    setShowHistory(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#1E1E1E] border-b border-[#2E2E2E]">
      <nav className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center gap-3 sm:gap-4">

        {/* ── Left: Logo ── */}
        <Link
          href="/"
          id="navbar-logo"
          className="flex-shrink-0 font-pixel text-white text-[10px] sm:text-sm leading-none tracking-tight hover:opacity-80 transition-opacity duration-150"
        >
          Game<span className="text-[#EAB308]">Vault</span>
        </Link>

        {/* ── Center: Search Bar (desktop) ── */}
        <div className="hidden sm:block flex-1 max-w-xl relative" ref={searchRef}>
          <form onSubmit={handleSearch}>
            <div className="flex items-center gap-2 bg-[#121212] border border-[#2E2E2E] rounded-[8px] px-3 h-10 focus-within:border-[#A1A1AA] transition-colors duration-150">
              <SearchIcon />
              <input
                id="search-input"
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setShowHistory(true)}
                placeholder="Cari game..."
                className="flex-1 bg-transparent text-white text-sm font-sans placeholder-[#A1A1AA] outline-none"
                autoComplete="off"
              />
            </div>
          </form>

          {/* Search History Dropdown */}
          {showHistory && history.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1E1E1E] border border-[#2E2E2E] rounded-[8px] shadow-xl overflow-hidden z-50">
              <div className="px-3 py-2 text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wide border-b border-[#2E2E2E]">
                Riwayat Pencarian
              </div>
              <ul className="py-1">
                {history.map((term, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between px-3 py-2.5 hover:bg-[#262626] cursor-pointer group"
                    onClick={() => handleHistoryClick(term)}
                  >
                    <div className="flex items-center gap-2 text-sm text-white font-sans">
                      <SearchIcon />
                      <span className="group-hover:text-[#EAB308] transition-colors">{term}</span>
                    </div>
                    <button
                      onClick={(e) => removeHistoryItem(term, e)}
                      className="text-[#A1A1AA] hover:text-[#EF4444] p-1 rounded-md transition-colors"
                      aria-label="Hapus riwayat"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ── Mobile: Search toggle button ── */}
        <div className="sm:hidden flex-1" />
        <button
          onClick={() => setMobileSearch(v => !v)}
          className="sm:hidden w-9 h-9 flex items-center justify-center text-[#A1A1AA] hover:text-white bg-[#262626] rounded-[8px] transition-colors"
          aria-label="Toggle search"
        >
          <SearchIcon />
        </button>

        {/* ── Right: Auth ── */}
        <div className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2">
          {loading ? (
            <div className="w-20 sm:w-24 h-9 bg-[#262626] rounded-[8px] animate-pulse" />
          ) : user ? (
            <ProfileDropdown user={user} onLogout={logout} />
          ) : (
            <>
              <Link
                href="/auth/login"
                id="navbar-login-btn"
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium font-sans text-[#A1A1AA] hover:text-white transition-colors duration-150"
              >
                Masuk
              </Link>
              <Link
                href="/auth/register"
                id="navbar-register-btn"
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold font-sans text-[#121212] bg-white rounded-[8px] hover:bg-[#E5E5E5] transition-colors duration-150"
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Mobile Search Expand ── */}
      {mobileSearch && (
        <div className="sm:hidden px-4 pb-3">
          <form onSubmit={handleSearch}>
            <div className="flex items-center gap-2 bg-[#121212] border border-[#2E2E2E] rounded-[8px] px-3 h-10 focus-within:border-[#A1A1AA] transition-colors duration-150">
              <SearchIcon />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Cari game..."
                autoFocus
                className="flex-1 bg-transparent text-white text-sm font-sans placeholder-[#A1A1AA] outline-none"
                autoComplete="off"
              />
            </div>
          </form>
          
          {/* Mobile Search History */}
          {history.length > 0 && (
            <div className="mt-3 bg-[#1E1E1E] border border-[#2E2E2E] rounded-[8px] shadow-sm overflow-hidden">
              <div className="px-3 py-2 text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wide border-b border-[#2E2E2E]">
                Riwayat Pencarian
              </div>
              <ul className="py-1 max-h-48 overflow-y-auto">
                {history.map((term, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between px-3 py-2 hover:bg-[#262626] cursor-pointer group"
                    onClick={() => handleHistoryClick(term)}
                  >
                    <div className="flex items-center gap-2 text-sm text-white font-sans">
                      <SearchIcon />
                      <span>{term}</span>
                    </div>
                    <button
                      onClick={(e) => removeHistoryItem(term, e)}
                      className="text-[#A1A1AA] hover:text-[#EF4444] p-1 rounded-md transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
