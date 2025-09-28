/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com', 'image.tmdb.org'],
  },
  // Fix lockfile warning
  outputFileTracingRoot: __dirname,
}

module.exports = nextConfig