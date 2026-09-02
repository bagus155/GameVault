/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Serve modern formats: AVIF first (smallest), WebP fallback
    formats: ['image/avif', 'image/webp'],
    // Include large sizes for retina/HiDPI displays (2x, 3x)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [256, 384, 512, 640, 828],
    minimumCacheTTL: 31536000,
    // Allow images from RAWG CDN
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.rawg.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.rawg.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'shared.akamai.steamstatic.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Ensure environment variables are validated at build
  env: {
    RAWG_API_KEY: process.env.RAWG_API_KEY,
  },
};

module.exports = nextConfig;
