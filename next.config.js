/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    reactRemoveProperties: false,
  },
  output: 'standalone',
  images: {
    domains: ['localhost'],
  },
  experimental: {
    serverActions: true,
  }
}

module.exports = nextConfig 