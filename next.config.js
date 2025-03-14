// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bilder.vinmonopolet.no',
        port: '',
        pathname: '/cache/**',
      },
    ],
    // Increase image cache duration
    minimumCacheTTL: 3600, // 1 hour
    unoptimized: true, // Add this for easier deployment
  },
  // Add custom headers for caching
  async headers() {
    return [
      {
        // Apply caching to static assets - fixed pattern
        source: '/:path*\\.(jpg|jpeg|png|svg|webp|js|css|woff|woff2)$',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Apply caching to API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
    ];
  },
};

export default nextConfig;