'use client';
import { useRouter } from 'next/navigation';

export default function BackButton({ fallbackUrl = '/' }) {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push(fallbackUrl);
        }
      }}
      className="inline-flex items-center gap-1.5 text-[#A1A1AA] hover:text-white text-sm font-sans mb-6 transition-colors duration-150"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      Kembali
    </button>
  );
}
