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
}

module.exports = nextConfig