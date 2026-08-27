// app/auth/login/page.jsx
// ─────────────────────────────────────────────
// Login Page
// Solid #1E1E1E card, centered layout
// ─────────────────────────────────────────────
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/LoadingSpinner';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-56px)] sm:min-h-[calc(100dvh-64px)] flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block font-heading font-semibold text-2xl text-white tracking-tight">
            Game<span className="text-[#EAB308]">Vault</span>
          </Link>
          <p className="text-[#A1A1AA] text-sm font-sans mt-1">Masuk ke akunmu</p>
        </div>

        {/* Card */}
        <div className="bg-[#1E1E1E] border border-[#2E2E2E] rounded-card p-6 space-y-5">

          {/* Error Alert */}
          {error && (
            <div className="bg-[#2A1A1A] border border-[#EF4444] text-[#EF4444] text-sm font-sans px-4 py-2.5 rounded-[8px]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-[#A1A1AA] text-xs font-sans block">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="nama@email.com"
                className="w-full bg-[#121212] border border-[#2E2E2E] rounded-[8px] px-3 py-2.5 text-white text-sm font-sans placeholder-[#A1A1AA] outline-none focus:border-[#A1A1AA] transition-colors duration-150"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-[#A1A1AA] text-xs font-sans block">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-[#121212] border border-[#2E2E2E] rounded-[8px] px-3 py-2.5 text-white text-sm font-sans placeholder-[#A1A1AA] outline-none focus:border-[#A1A1AA] transition-colors duration-150"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="login-submit-btn"
              disabled={loading}
              className="w-full py-2.5 bg-white text-[#121212] text-sm font-semibold font-sans rounded-[8px] hover:bg-[#E5E5E5] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Spinner size={14} />}
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-[#A1A1AA] text-sm font-sans">
            Belum punya akun?{' '}
            <Link href="/auth/register" className="text-white font-semibold hover:underline">
              Daftar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
