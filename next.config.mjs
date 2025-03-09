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
    // Optional: optimize image formats
    formats: ['image/webp'],
  },
  experimental: {
    // Use Turbopack instead of webpack
    turbo: {
      rules: {
        // Opt-out specific import formats
      }
    },
    // Enable fetch cache for API requests
    fetchCache: true,
    // Enable HTTP keep-alive
    keepAlive: true,
    // Enable API response size optimization
    optimizeServerReact: true,
  },
  // Add custom headers for caching
  async headers() {
    return [
      {
        // Apply caching to static assets
        source: '/(.*).(?:jpg|jpeg|png|svg|webp|js|css|woff|woff2)$',
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