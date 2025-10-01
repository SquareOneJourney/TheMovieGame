/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  // Fix lockfile warning
  outputFileTracingRoot: __dirname,
  // Ensure proper static file handling
  trailingSlash: false,
  // Disable x-powered-by header
  poweredByHeader: false,
  // Optimize for production
  compress: true,
  // Add build timestamp for cache busting
  env: {
    BUILD_TIMESTAMP: new Date().toISOString(),
  },
}

module.exports = nextConfig