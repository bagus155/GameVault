// app/not-found.jsx
// ─────────────────────────────────────────────
// 404 Not Found Page
// ─────────────────────────────────────────────
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100dvh-64px)] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-8xl font-heading font-semibold text-[#2E2E2E] mb-4">404</p>
      <h2 className="font-heading font-semibold text-white text-2xl mb-2">
        Halaman Tidak Ditemukan
      </h2>
      <p className="text-[#A1A1AA] text-sm font-sans mb-8 max-w-xs">
        Game atau halaman yang kamu cari tidak ada atau sudah dipindahkan.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-white text-[#121212] text-sm font-semibold font-sans rounded-[8px] hover:bg-[#E5E5E5] transition-colors duration-150"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
