/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove deprecated options
  output: 'standalone', // For Docker builds
}

module.exports = nextConfig