/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com', 'image.tmdb.org'],
    formats: ['image/webp', 'image/avif'],
  },
  // Fix lockfile warning
  outputFileTracingRoot: __dirname,
}

module.exports = nextConfig