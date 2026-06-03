import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Caching headers for assets and pages
  headers: async () => [
    {
      // Static assets (images, fonts) - cache forever
      source: '/:all*(svg|jpg|png|webp|avif|ico|woff|woff2)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
    {
      // HTML pages - stale-while-revalidate for speed
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
  ],

  // Enable compression
  compress: true,
};

export default nextConfig;
