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
        { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        // S-1: Removed 'unsafe-eval' from script-src.
        // 'unsafe-inline' is kept in style-src because Next.js injects inline styles.
        // For scripts, 'unsafe-inline' is still required by Next.js for inline script
        // tags it generates; a nonce-based approach would require a custom server.
        { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co;" },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    },
  ],

  // Enable compression
  compress: true,
};

export default nextConfig;
