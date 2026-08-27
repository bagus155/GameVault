/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ─── Color Palette (Solid, NO Gradients) ───
      colors: {
        // Background
        'bg-base':    '#121212',
        // Surface / Card / Header
        'surface':    '#1E1E1E',
        'surface-2':  '#262626',
        // Text
        'text-primary':   '#FFFFFF',
        'text-muted':     '#A1A1AA',
        // Star / Accent
        'star-gold':  '#EAB308',
        'star-amber': '#D97706',
        // Border
        'border-subtle': '#2E2E2E',
      },

      // ─── Typography ───
      fontFamily: {
        sans:    ['Poppins', 'sans-serif'],
        heading: ['"Space Grotesk"', '"Poppins"', 'sans-serif'],
      },

      // ─── Spacing & Sizing ───
      borderRadius: {
        'card': '12px',
        'pill': '9999px',
      },

      // ─── Keyframe Animations ───
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-up': {
          '0%':   { transform: 'scale(0.97)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
      },
      animation: {
        'fade-in':  'fade-in 0.35s ease-out both',
        'scale-up': 'scale-up 0.3s ease-out both',
        'shimmer':  'shimmer 1.8s infinite',
      },
    },
  },
  plugins: [],
};
