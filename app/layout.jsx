// app/layout.jsx
// ─────────────────────────────────────────────
// Root Layout — wraps all pages
// ─────────────────────────────────────────────
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';

export const metadata = {
  title: {
    default: 'GameVault — Katalog Game Terlengkap',
    template: '%s | GameVault',
  },
  description: 'Temukan, simpan, dan ulas game favorit Anda. Katalog game real-time dari RAWG API dengan fitur favorit dan review komunitas.',
  keywords: ['game', 'katalog game', 'review game', 'gamevault', 'RAWG'],
  openGraph: {
    title: 'GameVault',
    description: 'Katalog game real-time dengan favorit & review pengguna.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-[#121212] text-white font-sans antialiased">
        <AuthProvider>
          <Navbar />
          <main className="min-h-[calc(100dvh-64px)]">
            {children}
          </main>
          <footer className="border-t border-[#2E2E2E] mt-16">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-[#A1A1AA] text-xs font-sans">
                © {new Date().getFullYear()} GameVault. Data game dari{' '}
                <a
                  href="https://rawg.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:underline"
                >
                  RAWG
                </a>.
              </p>
              <p className="text-[#A1A1AA] text-xs font-sans">
                Dibangun dengan Next.js · Prisma · PostgreSQL
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
