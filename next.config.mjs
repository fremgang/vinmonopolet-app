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
  },
  experimental: {
    // Use Turbopack instead of webpack
    turbo: {
      rules: {
        // Opt-out specific import formats
      }
    },
  },
};

export default nextConfig;